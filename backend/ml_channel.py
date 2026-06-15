"""
Optional PyTorch CNN channel — imported only when ML is enabled.

PyTorch loads large internal operator registries (dict-heavy) and can use ~1GB RAM
in Docker when CUDA wheels are installed. Production Docker sets DISABLE_TORCH=1
and uses rule-based analysis only (see requirements-docker.txt).
"""
from __future__ import annotations

import logging
import os
import re
from typing import Any, Dict, List, Optional, Tuple, TYPE_CHECKING

logger = logging.getLogger(__name__)

NUM_MODEL_CLASSES = 10

if TYPE_CHECKING:
    from analysis_engine import AssessmentData

_torch = None
_nn = None
_F = None
_EducationCNN = None
_ML_READY = False


def is_disabled() -> bool:
    return os.environ.get("DISABLE_TORCH", "").strip().lower() in ("1", "true", "yes")


def ml_available() -> bool:
    return _ensure_ml() is not None


def _ensure_ml():
    """Lazy-import torch once; returns (torch, nn, F, EducationCNN) or None."""
    global _torch, _nn, _F, _EducationCNN, _ML_READY
    if is_disabled():
        return None
    if _ML_READY:
        return (_torch, _nn, _F, _EducationCNN) if _torch is not None else None
    try:
        import torch
        import torch.nn as nn
        import torch.nn.functional as F

        class EducationCNN(nn.Module):
            def __init__(
                self,
                vocab_size: int = 10000,
                embedding_dim: int = 128,
                num_classes: int = NUM_MODEL_CLASSES,
                dropout: float = 0.3,
            ):
                super().__init__()
                self.embedding = nn.Embedding(vocab_size, embedding_dim)
                self.conv1 = nn.Conv1d(embedding_dim, 64, kernel_size=3, padding=1)
                self.conv2 = nn.Conv1d(64, 128, kernel_size=3, padding=1)
                self.conv3 = nn.Conv1d(128, 256, kernel_size=3, padding=1)
                self.bn1 = nn.BatchNorm1d(64)
                self.bn2 = nn.BatchNorm1d(128)
                self.bn3 = nn.BatchNorm1d(256)
                self.pool = nn.AdaptiveMaxPool1d(1)
                self.fc1 = nn.Linear(256 + 50, 512)
                self.fc2 = nn.Linear(512, 256)
                self.fc3 = nn.Linear(256, 128)
                self.fc4 = nn.Linear(128, num_classes)
                self.dropout = nn.Dropout(dropout)
                self.numeric_fc = nn.Linear(20, 50)

            def forward(self, text_input, numeric_features):
                x = self.embedding(text_input)
                x = x.transpose(1, 2)
                x = F.relu(self.bn1(self.conv1(x)))
                x = F.relu(self.bn2(self.conv2(x)))
                x = F.relu(self.bn3(self.conv3(x)))
                x = self.pool(x).squeeze(-1)
                numeric_out = F.relu(self.numeric_fc(numeric_features))
                x = torch.cat([x, numeric_out], dim=1)
                x = F.relu(self.fc1(x))
                x = self.dropout(x)
                x = F.relu(self.fc2(x))
                x = self.dropout(x)
                x = F.relu(self.fc3(x))
                x = self.dropout(x)
                return self.fc4(x)

        _torch, _nn, _F, _EducationCNN = torch, nn, F, EducationCNN
        _ML_READY = True
        logger.info("PyTorch ML channel enabled")
        return (_torch, _nn, _F, _EducationCNN)
    except ImportError as e:
        _ML_READY = True
        logger.info("PyTorch not installed — rule-based analysis only (%s)", e)
        return None


def preprocess_tensors(assessment_data: "AssessmentData", vocab: Dict[str, int], vocab_size: int = 10000):
    pack = _ensure_ml()
    if pack is None:
        return None, None
    torch, _, _, _ = pack
    text = (
        f"{assessment_data.learning_description} {assessment_data.behavior_description} "
        f"{assessment_data.parent_concerns} "
        + " ".join(assessment_data.learning_habits + assessment_data.classroom_behavior + assessment_data.social_behavior)
    )
    words = re.findall(r"\w+|[^\w\s]", text.lower(), flags=re.UNICODE)
    if not vocab:
        vocab.update({word: (i % (vocab_size - 1)) + 1 for i, word in enumerate(dict.fromkeys(words))})
    text_indices = [min(vocab.get(w, 0), vocab_size - 1) for w in words[:100]]
    text_indices += [0] * (100 - len(text_indices))

    numeric_features: List[float] = [min(1.0, max(0.0, assessment_data.age / 18.0))]
    subject_vals = list(assessment_data.subjects.values()) if assessment_data.subjects else []
    numeric_features.extend([min(1.0, max(0.0, float(s) / 100.0)) for s in subject_vals[:10]])
    numeric_features.extend([0.0] * (10 - len(subject_vals)))

    behavior_features = [0.0] * 8
    blob = (" ".join(assessment_data.classroom_behavior) + " " + " ".join(assessment_data.social_behavior)).lower()
    if any(x in blob for x in ["注意力", "attention", "focus", "distract"]):
        behavior_features[0] = 1.0
    if any(x in blob for x in ["多动", "hyper", "impulsive", "restless"]):
        behavior_features[1] = 1.0
    if any(x in blob for x in ["情绪", "anxious", "worry", "anxiety"]):
        behavior_features[2] = 1.0
    if any(x in blob for x in ["社交", "social", "peer"]):
        behavior_features[3] = 1.0
    numeric_features.extend(behavior_features)
    while len(numeric_features) < 20:
        numeric_features.append(0.0)

    return (
        torch.tensor([text_indices], dtype=torch.long),
        torch.tensor([numeric_features[:20]], dtype=torch.float32),
    )


def forward_probs(model, assessment_data: "AssessmentData", vocab: Dict[str, int]) -> Optional[Any]:
    pack = _ensure_ml()
    if pack is None or model is None:
        return None
    torch, _, F, _ = pack
    try:
        text_input, numeric_features = preprocess_tensors(assessment_data, vocab)
        if text_input is None:
            return None
        with torch.no_grad():
            logits = model(text_input, numeric_features)
            return F.softmax(logits, dim=1)
    except Exception as e:
        logger.warning("Model forward failed: %s", e)
        return None


def load_checkpoint(model_path: str) -> Tuple[Optional[Any], Dict[str, int]]:
    pack = _ensure_ml()
    if pack is None:
        return None, {}
    torch, _, _, EducationCNN = pack
    try:
        try:
            checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)
        except TypeError:
            checkpoint = torch.load(model_path, map_location="cpu")
        model = EducationCNN()
        model.load_state_dict(checkpoint["model_state_dict"])
        model.eval()
        vocab = checkpoint.get("vocab", {}) or {}
        logger.info("Loaded CNN checkpoint from %s", model_path)
        return model, vocab
    except Exception as e:
        logger.error("Model load failed: %s", e)
        return None, {}


def save_checkpoint(model, vocab: Dict[str, int], model_path: str) -> None:
    pack = _ensure_ml()
    if pack is None or model is None:
        return
    torch, _, _, _ = pack
    os.makedirs(os.path.dirname(model_path) or ".", exist_ok=True)
    torch.save({"model_state_dict": model.state_dict(), "vocab": vocab}, model_path)


def train_model(
    model,
    vocab: Dict[str, int],
    training_data: List[Tuple["AssessmentData", int]],
    epochs: int = 50,
    learning_rate: float = 0.001,
) -> Any:
    pack = _ensure_ml()
    if pack is None:
        logger.warning("train_model skipped — PyTorch disabled or not installed")
        return None
    torch, nn, _, EducationCNN = pack
    if not training_data:
        return None
    model = EducationCNN()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    criterion = nn.CrossEntropyLoss()
    for epoch in range(epochs):
        total_loss = 0.0
        for assessment_data, label in training_data:
            text_input, numeric_features = preprocess_tensors(assessment_data, vocab)
            target = torch.tensor([label], dtype=torch.long)
            optimizer.zero_grad()
            output = model(text_input, numeric_features)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        if (epoch + 1) % 10 == 0:
            logger.info("Epoch %s/%s loss=%.4f", epoch + 1, epochs, total_loss / max(1, len(training_data)))
    return model


def top_class_indices(probs_row) -> Tuple[int, List[int], List[float]]:
    """Return (argmax, top-k indices, top-k weights) without importing torch in callers."""
    pack = _ensure_ml()
    if pack is None:
        return 0, [], []
    torch, _, _, _ = pack
    p = probs_row
    top_idx = int(torch.argmax(p).item())
    top2 = torch.topk(p, k=min(3, NUM_MODEL_CLASSES))
    return top_idx, top2.indices.tolist(), [float(p[i].item()) for i in top2.indices.tolist()]
