"""
Data-driven assessment analysis for SpecialCare Connect MVP.
Derives scores and recommendations only from submitted payload + optional PyTorch model.
"""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

logger = logging.getLogger(__name__)

# --- CNN (must match saved checkpoints) ---------------------------------
NUM_MODEL_CLASSES = 10


class EducationCNN(nn.Module):
    """CNN-based educational assessment analysis model (architecture fixed for checkpoint compatibility)."""

    def __init__(self, vocab_size: int = 10000, embedding_dim: int = 128, num_classes: int = NUM_MODEL_CLASSES, dropout: float = 0.3):
        super().__init__()
        self.vocab_size = vocab_size
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
        x = self.fc4(x)
        return x


# Model class index → user-facing theme (used when model influences narrative)
MODEL_CLASS_THEMES = [
    ("learning_pace", "Learning pace / mastery"),
    ("attention_focus", "Attention and focus"),
    ("behavior_regulation", "Behavior and self-regulation"),
    ("social_communication", "Social communication"),
    ("motor_coordination", "Motor coordination"),
    ("language_expression", "Language expression"),
    ("anxiety_sensitivity", "Anxiety or sensory sensitivity"),
    ("routine_structure", "Routines and predictability"),
    ("motivation_engagement", "Motivation and engagement"),
    ("advanced_enrichment", "Extension and enrichment"),
]


@dataclass
class AssessmentData:
    child_name: str
    age: int
    school_type: str
    grade: str
    subjects: Dict[str, float]
    learning_habits: List[str]
    classroom_behavior: List[str]
    social_behavior: List[str]
    learning_description: str
    behavior_description: str
    parent_concerns: str


@dataclass
class ParsedDomains:
    motor: Optional[float] = None
    cognitive: Optional[float] = None
    language: Optional[float] = None
    social_emotional: Optional[float] = None
    daily_living: Optional[float] = None
    domain_details: Dict[str, Any] = field(default_factory=dict)


# Keywords: English + Chinese (keep Chinese rules, add English)
KEYWORD_GROUPS: List[Tuple[str, List[str]]] = [
    ("attention", ["attention", "focus", "distracted", "distractible", "concentrat", "adhd", "集中", "注意力", "分心"]),
    ("hyperactivity", ["hyperactive", "impulsive", "restless", "fidget", "多动", "冲动"]),
    ("social", ["social", "peer", "friend", "lonely", "isolate", "社交", "同伴", "朋友"]),
    ("anxiety", ["anxiety", "anxious", "worry", "nervous", "fear", "焦虑", "紧张", "担心"]),
    ("learning", ["reading", "math", "writing", "homework", "struggl", "behind", "学习", "阅读", "数学", "作业"]),
    ("motor", ["motor", "coordination", "clumsy", "gross motor", "fine motor", "运动", "协调"]),
    ("language", ["language", "speech", "talk", "vocabulary", "语言", "说话", "表达"]),
    ("routine", ["routine", "schedule", "transition", "bedtime", "常规", "作息", "转换"]),
]


RECOMMENDATIONS_EN: Dict[str, List[str]] = {
    "attention": [
        "Use short work blocks (10–15 minutes) with a visible timer and a quiet, low-distraction workspace.",
        "Pair verbal instructions with a simple checklist or picture sequence the child can follow.",
        "Reward sustained effort (not only correct answers) to reinforce focus habits.",
    ],
    "hyperactivity": [
        "Offer regular movement breaks before tasks that require sitting still.",
        "Use clear, positively framed rules and preview transitions a few minutes ahead.",
        "Channel energy into structured gross-motor play before seated learning.",
    ],
    "social": [
        "Practice turn-taking and joint attention during play with a trusted adult, then generalize to peers.",
        "Use short social stories or role-play to rehearse greetings, sharing, and conflict repair.",
        "Start with one predictable peer activity weekly and build duration slowly.",
    ],
    "anxiety": [
        "Maintain predictable routines and narrate upcoming changes in simple language.",
        "Teach one calming strategy (breathing, counting, or a comfort object) and rehearse when calm.",
        "Avoid pressure to perform; emphasize effort and small wins.",
    ],
    "learning": [
        "Break tasks into the smallest possible steps and check understanding after each step.",
        "Use multisensory materials (objects to touch, draw, or move) alongside symbols or text.",
        "Revisit prerequisites briefly before introducing a new skill.",
    ],
    "motor": [
        "Add short daily practice for fine-motor skills (beads, dough, drawing) and gross-motor play (jumping, catching).",
        "Embed motor goals into meaningful play rather than drill-only exercises.",
    ],
    "language": [
        "Expand language by narrating daily routines and echo-expanding the child’s phrases.",
        "Read together daily; pause to ask concrete “who/what/where” questions.",
    ],
    "routine": [
        "Use a visual schedule for mornings, after-school, and bedtime.",
        "Warn before transitions (“two more minutes”) and keep transition steps identical day to day.",
    ],
    "motor_domain_low": [
        "Based on milestone responses, prioritize playful motor practice (balance, reaching, grasping) matched to the child’s age.",
    ],
    "cognitive_domain_low": [
        "Use concrete manipulatives and repeated patterns before abstract questions; celebrate correct attempts immediately.",
    ],
    "language_domain_low": [
        "Model short sentences, wait for a response, then gently expand what the child said.",
    ],
    "social_domain_low": [
        "Practice labeling emotions and co-regulation: name feelings and solve one small social problem at a time.",
    ],
    "daily_living_low": [
        "Teach one self-care step at a time (e.g., washing hands) with visual cues and hand-over-hand support fading gradually.",
    ],
}


def _iter_numeric_leaves(obj: Any, depth: int = 0) -> List[float]:
    if depth > 12:
        return []
    if isinstance(obj, dict):
        out: List[float] = []
        for v in obj.values():
            out.extend(_iter_numeric_leaves(v, depth + 1))
        return out
    if isinstance(obj, list):
        out = []
        for v in obj:
            out.extend(_iter_numeric_leaves(v, depth + 1))
        return out
    if isinstance(obj, bool):
        return []
    if isinstance(obj, (int, float)):
        return [float(obj)]
    return []


def _normalize_milestone_value(v: float) -> float:
    """Milestone rubric 0/1/2 → 0–100; larger values treated as already percent-like."""
    if v <= 2.0:
        return float(v) * 50.0
    return max(0.0, min(100.0, float(v)))


def domain_average_from_payload(raw: Optional[Dict[str, Any]]) -> Optional[float]:
    if not raw:
        return None
    leaves = _iter_numeric_leaves(raw)
    if not leaves:
        return None
    mapped = [_normalize_milestone_value(x) for x in leaves]
    return float(sum(mapped) / len(mapped))


def parse_domains(req: Dict[str, Any]) -> ParsedDomains:
    motor = domain_average_from_payload(req.get("motorSkills"))
    cognitive = domain_average_from_payload(req.get("cognitiveSkills"))
    language = domain_average_from_payload(req.get("languageSkills"))
    social_emotional = domain_average_from_payload(req.get("socialEmotional"))
    daily_living = domain_average_from_payload(req.get("dailyLiving"))
    return ParsedDomains(
        motor=motor,
        cognitive=cognitive,
        language=language,
        social_emotional=social_emotional,
        daily_living=daily_living,
        domain_details={
            "motor": motor,
            "cognitive": cognitive,
            "language": language,
            "social_emotional": social_emotional,
            "daily_living": daily_living,
        },
    )


def _combined_parent_text(req: Dict[str, Any]) -> str:
    parts = [
        str(req.get("parentObservations") or ""),
        str(req.get("concerns") or ""),
        str(req.get("strengths") or ""),
    ]
    return " \n ".join(parts).lower()


def detect_keyword_signals(text: str) -> List[str]:
    found: List[str] = []
    for key, words in KEYWORD_GROUPS:
        for w in words:
            if w.lower() in text:
                found.append(key)
                break
    return list(dict.fromkeys(found))


def build_behavior_lists(parsed: ParsedDomains, keyword_signals: List[str]) -> Tuple[List[str], List[str]]:
    """Split rough classroom vs social tags for the CNN / legacy analyzer."""
    classroom: List[str] = []
    social: List[str] = []

    if parsed.motor is not None and parsed.motor < 55:
        classroom.append("motor_coordination_support")
    if parsed.cognitive is not None and parsed.cognitive < 55:
        classroom.append("cognitive_support")
    if parsed.language is not None and parsed.language < 55:
        social.append("language_expression_support")
    if parsed.social_emotional is not None and parsed.social_emotional < 55:
        social.append("social_emotional_support")
    if parsed.daily_living is not None and parsed.daily_living < 55:
        social.append("daily_living_skills_support")

    if "attention" in keyword_signals:
        classroom.append("注意力不集中")
    if "hyperactivity" in keyword_signals:
        classroom.append("多动")
    if "social" in keyword_signals:
        social.append("社交困难")
    if "anxiety" in keyword_signals:
        social.append("情绪波动")

    # English equivalents for model preprocessor (substring checks also match English tokens)
    if "attention" in keyword_signals and "注意力不集中" not in classroom:
        classroom.append("attention difficulty")
    if "hyperactivity" in keyword_signals and "多动" not in classroom:
        classroom.append("hyperactivity")
    if "social" in keyword_signals and "社交困难" not in social:
        social.append("peer social challenges")

    return classroom, social


def overall_score_from_domains(parsed: ParsedDomains, text: str) -> float:
    vals = [v for v in (parsed.motor, parsed.cognitive, parsed.language, parsed.social_emotional, parsed.daily_living) if v is not None]
    if vals:
        return float(round(sum(vals) / len(vals), 1))
    # Text-only fallback: neutral baseline adjusted slightly by concern density
    base = 72.0
    concern_len = len(text.strip())
    adjustment = min(18.0, max(-12.0, (concern_len / 400.0) * 20.0 - 6.0))
    if any(k in text for k in ["worry", "struggl", "difficult", "can't", "cannot", "担心", "困难"]):
        adjustment -= 4.0
    if any(k in text for k in ["strength", "great", "love", "进步", "优势"]):
        adjustment += 4.0
    return float(round(max(35.0, min(95.0, base + adjustment)), 1))


def subjects_from_domains(parsed: ParsedDomains) -> Dict[str, float]:
    """Human-readable domain scores (0–100) — no random academics."""
    subjects: Dict[str, float] = {}
    if parsed.motor is not None:
        subjects["Motor development"] = round(parsed.motor, 1)
    if parsed.cognitive is not None:
        subjects["Cognitive development"] = round(parsed.cognitive, 1)
    if parsed.language is not None:
        subjects["Language development"] = round(parsed.language, 1)
    if parsed.social_emotional is not None:
        subjects["Social-emotional development"] = round(parsed.social_emotional, 1)
    if parsed.daily_living is not None:
        subjects["Daily living skills"] = round(parsed.daily_living, 1)
    return subjects


def identify_main_challenges(
    parsed: ParsedDomains, _subjects: Dict[str, float], keyword_signals: List[str], child_test: Optional[Dict]
) -> List[str]:
    challenges: List[str] = []
    labels = [
        ("motor", parsed.motor, "Motor coordination or gross/fine motor milestones"),
        ("cognitive", parsed.cognitive, "Cognitive / early learning skills"),
        ("language", parsed.language, "Receptive or expressive language"),
        ("social_emotional", parsed.social_emotional, "Social-emotional regulation or peer skills"),
        ("daily_living", parsed.daily_living, "Daily living / independence skills"),
    ]
    for _key, val, msg in labels:
        if val is not None and val < 58:
            challenges.append(msg)

    if "attention" in keyword_signals:
        challenges.append("Parent-reported attention or focus concerns")
    if "hyperactivity" in keyword_signals:
        challenges.append("Parent-reported hyperactivity or impulsivity")
    if "anxiety" in keyword_signals:
        challenges.append("Parent-reported anxiety or worry")

    perf = (child_test or {}).get("performance")
    if perf in ("needs_improvement", "poor", "below_average"):
        challenges.append("Structured attention task suggests room to build focus stamina")

    return list(dict.fromkeys(challenges))


def collect_recommendations(
    parsed: ParsedDomains, keyword_signals: List[str], challenges: List[str]
) -> List[str]:
    recs: List[str] = []
    if parsed.motor is not None and parsed.motor < 58:
        recs.extend(RECOMMENDATIONS_EN["motor_domain_low"])
    if parsed.cognitive is not None and parsed.cognitive < 58:
        recs.extend(RECOMMENDATIONS_EN["cognitive_domain_low"])
    if parsed.language is not None and parsed.language < 58:
        recs.extend(RECOMMENDATIONS_EN["language_domain_low"])
    if parsed.social_emotional is not None and parsed.social_emotional < 58:
        recs.extend(RECOMMENDATIONS_EN["social_domain_low"])
    if parsed.daily_living is not None and parsed.daily_living < 58:
        recs.extend(RECOMMENDATIONS_EN["daily_living_low"])

    for sig in keyword_signals:
        recs.extend(RECOMMENDATIONS_EN.get(sig, []))

    # If nothing matched but challenges exist, add balanced defaults
    if not recs and challenges:
        recs.extend(
            [
                "Pick one priority skill this week and practice it in short, daily sessions (5–10 minutes).",
                "Share concrete examples with teachers or caregivers so everyone uses the same cues and praise.",
            ]
        )
    if not recs:
        recs.append(
            "Continue strengths-based routines; keep a simple log of one win per day to track momentum."
        )
    # De-dupe preserving order
    seen = set()
    out = []
    for r in recs:
        if r not in seen:
            seen.add(r)
            out.append(r)
    return out[:24]


class EducationAnalyzer:
    """Loads optional CNN weights; exposes preprocess + forward for fusion."""

    def __init__(self, model_path: Optional[str] = None):
        self.model: Optional[nn.Module] = None
        self.vocab: Dict[str, int] = {}
        self._vocab_size = 10000
        if model_path and __import__("os").path.exists(model_path):
            self.load_model(model_path)

    def preprocess_data(self, assessment_data: AssessmentData) -> Tuple[torch.Tensor, torch.Tensor]:
        text = (
            f"{assessment_data.learning_description} {assessment_data.behavior_description} "
            f"{assessment_data.parent_concerns} "
            + " ".join(assessment_data.learning_habits + assessment_data.classroom_behavior + assessment_data.social_behavior)
        )
        words = re.findall(r"\w+|[^\w\s]", text.lower(), flags=re.UNICODE)
        vs = self._vocab_size
        if not self.vocab:
            unique_words = list(dict.fromkeys(words))
            self.vocab = {word: (i % (vs - 1)) + 1 for i, word in enumerate(unique_words)}
        text_indices = [min(self.vocab.get(w, 0), vs - 1) for w in words[:100]]
        text_indices += [0] * (100 - len(text_indices))

        numeric_features: List[float] = []
        numeric_features.append(min(1.0, max(0.0, assessment_data.age / 18.0)))
        subject_vals = list(assessment_data.subjects.values()) if assessment_data.subjects else []
        numeric_features.extend([min(1.0, max(0.0, float(s) / 100.0)) for s in subject_vals[:10]])
        numeric_features.extend([0.0] * (10 - len(subject_vals)))

        behavior_features = [0.0] * 8
        joined_cb = " ".join(assessment_data.classroom_behavior)
        joined_sb = " ".join(assessment_data.social_behavior)
        blob = (joined_cb + " " + joined_sb).lower()
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
        numeric_features = numeric_features[:20]

        return torch.tensor([text_indices], dtype=torch.long), torch.tensor([numeric_features], dtype=torch.float32)

    def forward_probs(self, assessment_data: AssessmentData) -> Optional[torch.Tensor]:
        if self.model is None:
            return None
        try:
            text_input, numeric_features = self.preprocess_data(assessment_data)
            with torch.no_grad():
                logits = self.model(text_input, numeric_features)
                return F.softmax(logits, dim=1)
        except Exception as e:
            logger.warning("Model forward failed, ignoring model channel: %s", e)
            return None

    def load_model(self, model_path: str) -> None:
        import os

        try:
            try:
                checkpoint = torch.load(model_path, map_location="cpu", weights_only=False)
            except TypeError:
                checkpoint = torch.load(model_path, map_location="cpu")
            self.model = EducationCNN()
            self.model.load_state_dict(checkpoint["model_state_dict"])
            self.vocab = checkpoint.get("vocab", {}) or {}
            self.model.eval()
            logger.info("Loaded CNN checkpoint from %s", model_path)
        except Exception as e:
            logger.error("Model load failed: %s", e)
            self.model = None

    def save_model(self, model_path: str) -> None:
        import os

        if self.model is not None:
            os.makedirs(os.path.dirname(model_path) or ".", exist_ok=True)
            torch.save({"model_state_dict": self.model.state_dict(), "vocab": self.vocab}, model_path)

    def train_model(self, training_data: List[Tuple[AssessmentData, int]], epochs: int = 50, learning_rate: float = 0.001):
        if not training_data:
            return
        self.model = EducationCNN()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)
        criterion = nn.CrossEntropyLoss()
        for epoch in range(epochs):
            total_loss = 0.0
            for assessment_data, label in training_data:
                text_input, numeric_features = self.preprocess_data(assessment_data)
                target = torch.tensor([label], dtype=torch.long)
                optimizer.zero_grad()
                output = self.model(text_input, numeric_features)
                loss = criterion(output, target)
                loss.backward()
                optimizer.step()
                total_loss += loss.item()
            if (epoch + 1) % 10 == 0:
                logger.info("Epoch %s/%s loss=%.4f", epoch + 1, epochs, total_loss / max(1, len(training_data)))


def analyze_development_data_enhanced(
    parsed: ParsedDomains,
    age_group: str,
    assessment_mode: str,
    parent_text: str,
) -> Dict[str, Any]:
    """Domain-aware developmental narrative + age-band scaffolding."""
    analysis: Dict[str, Any] = {
        "overall_level": "Within the reported profile",
        "strengths": [],
        "areas_for_improvement": [],
        "detailed_analysis": {},
        "recommendations": generate_age_band_scaffold(age_group, parsed, parent_text),
    }

    for name, val, hi, lo_msg, hi_msg in [
        ("motor", parsed.motor, 78, "Motor milestones may need extra practice", "Motor milestones look strong"),
        ("cognitive", parsed.cognitive, 78, "Cognitive tasks may need more concrete scaffolding", "Cognitive responses look solid"),
        ("language", parsed.language, 78, "Language skills may benefit from targeted modeling", "Language milestones look encouraging"),
        ("social_emotional", parsed.social_emotional, 78, "Social-emotional themes may need gentle coaching", "Social-emotional responses look balanced"),
        ("daily_living", parsed.daily_living, 78, "Daily living skills are a good practice focus", "Daily living skills look on track"),
    ]:
        if val is None:
            continue
        analysis["detailed_analysis"][name] = round(val, 1)
        if val >= hi:
            analysis["strengths"].append(hi_msg)
        elif val < 58:
            analysis["areas_for_improvement"].append(lo_msg)

    if not analysis["strengths"]:
        analysis["strengths"].append("Parent observations provide a helpful baseline for next steps.")
    if not analysis["areas_for_improvement"] and any(v is not None and v < 65 for v in parsed.domain_details.values()):
        analysis["areas_for_improvement"].append("Continue monitoring domains that are close to the practice range.")

    return analysis


def generate_age_band_scaffold(age_group: str, parsed: ParsedDomains, parent_text: str) -> Dict[str, Any]:
    """Start from age templates, then prioritize weak domains."""
    weak = [k for k, v in parsed.domain_details.items() if v is not None and v < 62]
    rec = generate_development_recommendations_core(age_group)
    if weak:
        rec["summary"] += f" Priority practice themes based on responses: {', '.join(weak)}."
    if parent_text.strip():
        rec["next_steps"].insert(0, "Review parent notes weekly and adjust one routine based on what worked best.")
    return rec


def generate_development_recommendations_core(age_group: str) -> Dict[str, Any]:
    if age_group == "0-3":
        summary = "Age 0–3: relationship-rich, sensory-motor, and communication-first routines."
        activities = [
            {"category": "Motor", "activities": ["Tummy time or crawling paths", "Push-pull toys", "Ball rolling and catching"]},
            {"category": "Cognitive", "activities": ["Peek-a-boo and hiding objects", "Simple cause-and-effect toys", "One-step imitation games"]},
            {"category": "Language", "activities": ["Narrate routines", "Sing repeatable songs", "Echo-expand child's sounds/words"]},
            {"category": "Social-emotional", "activities": ["Name emotions in books", "Short parallel play with a peer", "Predictable hello/goodbye rituals"]},
        ]
    elif age_group == "4-6":
        summary = "Age 4–6: structured play, early literacy/math readiness, and cooperative skills."
        activities = [
            {"category": "Cognitive", "activities": ["Sort by color/size", "Simple patterns with blocks", "Picture sequencing stories"]},
            {"category": "Language", "activities": ["Story retell with props", "Word guessing games", "Pair drawings with spoken sentences"]},
            {"category": "Social", "activities": ["Cooperative building", "Turn-taking board games", "Problem-solving puppets"]},
        ]
    else:
        summary = "Age 7+: executive function habits, academic routines, and peer collaboration."
        activities = [
            {"category": "Learning habits", "activities": ["Planner check-in", "Pomodoro-style study blocks", "Self-check rubrics"]},
            {"category": "Social", "activities": ["Group projects with clear roles", "Debrief conflicts using 'two truths' listening"]},
            {"category": "Emotional", "activities": ["Body scan or breathing", "Worry time box", "Strength journaling"]},
        ]
    return {
        "summary": summary,
        "development_areas": {k: k.replace("_", " ") for k in ("motor", "cognitive", "language", "social", "daily_living")},
        "activities": activities,
        "resources": [
            {"type": "guidance", "title": "Trusted parenting and developmental education sites", "description": "Look for nonprofit or government child-development resources in your region."},
            {"type": "books", "title": "Age-matched developmental guides", "description": "Choose practical guides written for parents (not medical textbooks)."},
        ],
        "next_steps": [
            "Pick one measurable goal for two weeks (e.g., 10 minutes of reading together nightly).",
            "Share this summary with caregivers so language and cues stay consistent.",
        ],
    }


def summarize_interactive_results(interactive: Dict[str, Any]) -> Dict[str, Any]:
    score = float(interactive.get("score") or 0)
    acc = interactive.get("accuracy")
    if isinstance(acc, (int, float)) and acc <= 1.0:
        acc_pct = float(acc) * 100.0
    elif isinstance(acc, (int, float)):
        acc_pct = float(acc)
    else:
        acc_pct = None
    time_s = interactive.get("time")
    gtype = str(interactive.get("gameType") or "interactive_activity")

    if score >= 90:
        tier = "strong"
        summary = f"{gtype}: strong engagement/score ({score:.0f}/100)."
    elif score >= 75:
        tier = "good"
        summary = f"{gtype}: good performance ({score:.0f}/100) with room to refine consistency."
    elif score >= 60:
        tier = "developing"
        summary = f"{gtype}: developing performance ({score:.0f}/100); shorter sessions with cues may help."
    else:
        tier = "needs_support"
        summary = f"{gtype}: scores suggest extra scaffolding—shorten tasks and add visual guides."

    insights: List[str] = []
    if acc_pct is not None and acc_pct < 72:
        insights.append("Accuracy is below typical for this activity—try slower pacing and fewer items per round.")
    if isinstance(time_s, (int, float)) and time_s > 0 and score < 75:
        insights.append("If time-on-task was long with a modest score, add brief breaks to reset attention.")

    return {
        "game_type": gtype,
        "score": score,
        "accuracy_percent": acc_pct,
        "time_seconds": time_s,
        "performance_tier": tier,
        "performance_summary": summary,
        "skill_insights": insights or ["Use the same game weekly and track one metric (time, accuracy, or score) to see progress."],
    }


def summarize_age_adaptive(results: Dict[str, Any]) -> Dict[str, Any]:
    if not results:
        return {}
    # Frontend may send variable keys; stringify safe summary
    keys = list(results.keys())[:12]
    return {
        "recorded_fields": keys,
        "summary": "Age-adaptive activity data was included to contextualize attention and engagement style.",
        "detail": results,
    }


def run_full_analysis(req: Dict[str, Any], analyzer: EducationAnalyzer) -> Dict[str, Any]:
    """Main pipeline returning the `analysis` object stored with the assessment."""
    parent_text = _combined_parent_text(req)
    parsed = parse_domains(req)
    keyword_signals = detect_keyword_signals(parent_text)
    classroom_behavior, social_behavior = build_behavior_lists(parsed, keyword_signals)

    subjects = subjects_from_domains(parsed)
    overall = overall_score_from_domains(parsed, parent_text)

    child_test = req.get("childTestResults") or req.get("testResults")
    challenges = identify_main_challenges(parsed, subjects, keyword_signals, child_test)
    recommendations = collect_recommendations(parsed, keyword_signals, challenges)

    assessment_data = AssessmentData(
        child_name=str(req.get("childName") or "child").strip() or "child",
        age=int(req.get("childAge") or 0),
        school_type=str(req.get("assessmentMode") or "unspecified"),
        grade=str(req.get("ageGroup") or "unspecified"),
        subjects=subjects,
        learning_habits=[],
        classroom_behavior=classroom_behavior,
        social_behavior=social_behavior,
        learning_description=str(req.get("parentObservations") or ""),
        behavior_description=str(req.get("concerns") or ""),
        parent_concerns=str(req.get("strengths") or ""),
    )

    analysis: Dict[str, Any] = {
        "overall_score": overall,
        "main_problems": challenges,
        "recommendations": recommendations,
        "analysis_method": "data_driven_rules",
        "domain_scores": {k: round(v, 1) for k, v in parsed.domain_details.items() if v is not None},
        "keyword_signals": keyword_signals,
        "subjects_profile": subjects,
    }

    probs = analyzer.forward_probs(assessment_data)
    if probs is not None:
        p = probs[0]
        top_idx = int(torch.argmax(p).item())
        top2 = torch.topk(p, k=min(3, NUM_MODEL_CLASSES))
        themes = []
        for idx in top2.indices.tolist():
            themes.append({"theme": MODEL_CLASS_THEMES[idx][1], "weight": round(float(p[idx].item()), 3)})
        analysis["model_insights"] = {
            "top_themes": themes,
            "note": "Model output nudges scores and adds themes; it does not diagnose medical conditions.",
        }
        # Influence overall score slightly using attention + anxiety channels
        attention_idx = 1
        anxiety_idx = 6
        engagement_idx = 8
        delta = (float(p[attention_idx].item()) - float(p[engagement_idx].item())) * 12.0
        delta += (float(p[anxiety_idx].item()) - 0.12) * 8.0
        new_score = max(30.0, min(98.0, analysis["overall_score"] - delta))
        analysis["overall_score"] = round(new_score, 1)
        analysis["analysis_method"] = "data_driven_rules_plus_model"

        # Add two recommendations tied to strongest non-generic class
        extra = []
        for idx in top2.indices.tolist()[:2]:
            slug, label = MODEL_CLASS_THEMES[idx]
            w = float(p[idx].item())
            if w < 0.12:
                continue
            if slug == "attention_focus":
                extra.extend(RECOMMENDATIONS_EN["attention"][:1])
            elif slug == "behavior_regulation":
                extra.extend(RECOMMENDATIONS_EN["hyperactivity"][:1])
            elif slug == "social_communication":
                extra.extend(RECOMMENDATIONS_EN["social"][:1])
            elif slug == "anxiety_sensitivity":
                extra.extend(RECOMMENDATIONS_EN["anxiety"][:1])
            elif slug == "learning_pace":
                extra.extend(RECOMMENDATIONS_EN["learning"][:1])
            elif slug == "motor_coordination":
                extra.extend(RECOMMENDATIONS_EN["motor"][:1])
            elif slug == "language_expression":
                extra.extend(RECOMMENDATIONS_EN["language"][:1])
            elif slug == "routine_structure":
                extra.extend(RECOMMENDATIONS_EN["routine"][:1])
            else:
                extra.append(f"Model emphasis: {label} — keep activities short, concrete, and success-oriented.")
        analysis["recommendations"] = list(dict.fromkeys(analysis["recommendations"] + extra))[:24]
        analysis["model_primary_theme"] = MODEL_CLASS_THEMES[top_idx][1]

    analysis["development_analysis"] = analyze_development_data_enhanced(
        parsed, str(req.get("ageGroup") or "4-6"), str(req.get("assessmentMode") or ""), parent_text
    )

    if child_test:
        analysis["child_test"] = {
            "schulte_test": child_test,
            "attention_level": _attention_level_label(child_test),
            "recommendations": _attention_recs(child_test),
            "comprehensive_analysis": _comprehensive_block(child_test),
        }

    if req.get("interactiveResults"):
        analysis["interactive_analysis"] = summarize_interactive_results(req["interactiveResults"])

    if req.get("ageAdaptiveResults"):
        analysis["age_adaptive_summary"] = summarize_age_adaptive(req["ageAdaptiveResults"])

    return analysis


def _attention_level_label(test_results: Dict[str, Any]) -> str:
    perf = (test_results or {}).get("performance")
    mapping = {
        "excellent": "Excellent",
        "good": "Good",
        "average": "Average",
        "needs_improvement": "Needs improvement",
        "poor": "Needs improvement",
    }
    return mapping.get(str(perf), "Not recorded")


def _attention_recs(test_results: Dict[str, Any]) -> List[str]:
    perf = (test_results or {}).get("performance")
    base = {
        "excellent": ["Keep playful challenge high with varied grids or dual tasks."],
        "good": ["Add one weekly timed routine to stabilize speed and accuracy together."],
        "average": ["Use 12–15 minute daily practice with immediate feedback charts the child can color."],
        "needs_improvement": ["Shorten grids, reduce targets, and pair with a movement break every 5 minutes."],
        "poor": ["Prioritize low-pressure repetition; consult a professional if attention strongly interferes with school."],
    }
    return base.get(str(perf), ["Repeat the activity on a calmer day to establish a personal baseline."])


def _comprehensive_block(test_results: Dict[str, Any]) -> Dict[str, Any]:
    ca = (test_results or {}).get("comprehensiveAssessment")
    if not isinstance(ca, dict):
        return {
            "summary": "Structured attention metrics were not fully submitted.",
            "detailed_analysis": {},
            "training_plan": ["Use consistent practice windows and track one metric weekly."],
        }
    return {
        "summary": ca.get("summary", ""),
        "detailed_analysis": {
            "attention_score": f"{ca.get('attentionScore', 0)}/40",
            "consistency_score": f"{ca.get('consistencyScore', 0)}/30",
            "improvement_score": f"{ca.get('improvementScore', 0)}/30",
            "total_score": f"{ca.get('totalScore', 0)}/100",
            "overall_level": ca.get("overallLevel", ""),
        },
        "training_plan": ca.get("recommendations") or [],
    }