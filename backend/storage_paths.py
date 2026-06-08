"""
Resolve a writable directory for backend JSON stores (users, sessions, plans, etc.).

When ./data exists but is root-owned (common after Docker bind mounts), local dev fails
with EACCES unless we fall back (mirrors assessment_store fallback idea).
"""
from __future__ import annotations

import logging
import os
import tempfile
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

_cached_dir: Optional[str] = None


def get_backend_data_dir() -> str:
    """Return absolute path to a directory we can create and write files in."""
    global _cached_dir
    if _cached_dir is not None:
        return _cached_dir

    raw = (
        os.environ.get("BACKEND_DATA_DIR")
        or os.environ.get("SPECIALCARE_DATA_DIR")
        or os.environ.get("AUTH_DATA_DIR")
    )
    if raw:
        p = Path(raw).expanduser().resolve()
        try:
            p.mkdir(parents=True, exist_ok=True)
            _probe_write(p)
            _cached_dir = str(p)
            logger.info("Backend data directory (env): %s", _cached_dir)
            return _cached_dir
        except OSError as e:
            logger.warning("Configured data dir unusable (%s): %s — trying defaults", raw, e)

    here = Path(__file__).resolve().parent
    candidates = [
        here / "data",
        Path.cwd() / "data",
        Path.home() / ".specialcare" / "data",
        Path(tempfile.gettempdir()) / "specialcare_backend_data",
    ]

    for path in candidates:
        try:
            path.mkdir(parents=True, exist_ok=True)
            _probe_write(path)
            _cached_dir = str(path.resolve())
            logger.info("Backend data directory: %s", _cached_dir)
            return _cached_dir
        except OSError as e:
            logger.debug("Backend data candidate not usable %s: %s", path, e)

    fallback = Path(tempfile.gettempdir()) / "specialcare_backend_data"
    fallback.mkdir(parents=True, exist_ok=True)
    _cached_dir = str(fallback.resolve())
    logger.warning("Using last-resort backend data directory: %s", _cached_dir)
    return _cached_dir


def _probe_write(directory: Path) -> None:
    probe = directory / ".specialcare_write_probe"
    probe.write_text("ok", encoding="utf-8")
    probe.unlink(missing_ok=True)
