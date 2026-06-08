"""
Persistent assessment history (JSON file, atomic replace).

Resolution order for the history file:
1. `ASSESSMENT_STORE_PATH` (absolute path to the JSON file) if set — **recommended in Docker** when the
   repo's `backend/data` volume is read-only or root-owned.
2. `backend/data/assessment_history.json` if that directory can be created and is writable
3. `~/.specialcare/assessment_history.json`
4. `/tmp/specialcare_assessment_history.json`
"""
from __future__ import annotations

import json
import logging
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent / "data"
_DEFAULT_HISTORY = DATA_DIR / "assessment_history.json"
_MAX_RECORDS = 2500
_CACHED_HISTORY_PATH: Optional[Path] = None
_WARNED_DATA_DIR_UNUSABLE = False


def _try_create_default_data_dir() -> None:
    """Create ``backend/data`` with sane permissions when missing and the parent dir is writable."""
    try:
        if DATA_DIR.exists():
            return
        parent = DATA_DIR.parent
        if not os.access(parent, os.W_OK):
            return
        DATA_DIR.mkdir(mode=0o755, exist_ok=True)
        logger.info("Created writable assessment data directory: %s", DATA_DIR)
    except OSError as e:
        logger.debug("Could not create default data directory %s: %s", DATA_DIR, e)


def _resolved_history_path() -> Path:
    global _CACHED_HISTORY_PATH, _WARNED_DATA_DIR_UNUSABLE
    if _CACHED_HISTORY_PATH is not None:
        return _CACHED_HISTORY_PATH

    if os.environ.get("ASSESSMENT_STORE_PATH"):
        _CACHED_HISTORY_PATH = Path(os.environ["ASSESSMENT_STORE_PATH"]).expanduser().resolve()
        logger.info("Assessment history file (env): %s", _CACHED_HISTORY_PATH)
        return _CACHED_HISTORY_PATH

    _try_create_default_data_dir()

    candidates = [
        _DEFAULT_HISTORY,
        Path.home() / ".specialcare" / "assessment_history.json",
        Path(tempfile.gettempdir()) / "specialcare_assessment_history.json",
    ]
    for path in candidates:
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            probe = path.parent / ".specialcare_write_probe"
            probe.write_text("ok", encoding="utf-8")
            probe.unlink(missing_ok=True)  # type: ignore[arg-type]
            _CACHED_HISTORY_PATH = path
            logger.info("Assessment history file: %s", path)
            return path
        except OSError as e:
            if path == _DEFAULT_HISTORY and not _WARNED_DATA_DIR_UNUSABLE:
                _WARNED_DATA_DIR_UNUSABLE = True
                logger.warning(
                    "Default assessment history path not writable (%s). Using a fallback location. "
                    "Set ASSESSMENT_STORE_PATH to a writable JSON file path to pin storage.",
                    e,
                )
            else:
                logger.debug("History path not usable %s: %s", path, e)
            continue

    _CACHED_HISTORY_PATH = Path(tempfile.gettempdir()) / "specialcare_assessment_history.json"
    logger.warning("Using last-resort assessment history path: %s", _CACHED_HISTORY_PATH)
    return _CACHED_HISTORY_PATH


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _load_all() -> List[Dict[str, Any]]:
    path = _resolved_history_path()
    if not path.exists():
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except Exception as e:
        logger.error("Failed to read assessment history: %s", e)
        return []


def _atomic_write(records: List[Dict[str, Any]]) -> None:
    path = _resolved_history_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_dir = path.parent if os.access(path.parent, os.W_OK) else tempfile.gettempdir()
    fd, tmp = tempfile.mkstemp(prefix="assess_", suffix=".json", dir=tmp_dir)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
        os.replace(tmp, path)
    except Exception:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def save_assessment(
    assessment_id: str,
    request_payload: Dict[str, Any],
    result_payload: Dict[str, Any],
    user_id: Optional[str] = None,
) -> None:
    entry = {
        "id": assessment_id,
        "timestamp": _now_iso(),
        "user_id": user_id,
        "request": request_payload,
        "result": result_payload,
    }
    try:
        hist = _load_all()
        hist.append(entry)
        if len(hist) > _MAX_RECORDS:
            hist = hist[-_MAX_RECORDS:]
        _atomic_write(hist)
        logger.info("Saved assessment %s to %s", assessment_id, _resolved_history_path())
    except Exception as e:
        logger.error("Failed to persist assessment: %s", e, exc_info=True)
        raise


def list_assessments(limit: int = 50, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    limit = max(1, min(limit, 200))
    hist = _load_all()
    if user_id:
        hist = [r for r in hist if (r.get("user_id") or "") == user_id]
    if not hist:
        return []
    tail = hist[-limit:] if len(hist) > limit else hist
    return list(reversed(tail))


def count_assessments(user_id: Optional[str] = None) -> int:
    hist = _load_all()
    if user_id:
        hist = [r for r in hist if (r.get("user_id") or "") == user_id]
    return len(hist)


def aggregate_statistics(user_id: Optional[str] = None) -> Dict[str, Any]:
    rows = _load_all()
    if user_id:
        rows = [r for r in rows if (r.get("user_id") or "") == user_id]
    age_distribution: Dict[int, int] = {}
    scores: List[float] = []
    for row in rows:
        req = row.get("request") or {}
        res = row.get("result") or {}
        age = req.get("childAge")
        if isinstance(age, int):
            age_distribution[age] = age_distribution.get(age, 0) + 1
        ov = res.get("overall_score")
        if isinstance(ov, (int, float)):
            scores.append(float(ov))
    return {
        "total_assessments": len(rows),
        "age_distribution": age_distribution,
        "average_score": round(sum(scores) / len(scores), 2) if scores else 0.0,
    }
