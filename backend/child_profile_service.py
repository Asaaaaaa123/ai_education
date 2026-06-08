"""
Unified ChildProfile storage — single source of truth per Clerk user id.

Migrates legacy rows from user_children.json + user_test_results.json into schema v2 profiles
embedded with assessment_snapshot, test_results[], current_plan_id, and onboarding metadata.

Used by api/children.py (primary) and api/plans.py (training plans; same backing store).

Flow: Dashboard → onboarding wizard saves each step here; plan_generator reads ChildInfo + tests from profiles.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from storage_paths import get_backend_data_dir

logger = logging.getLogger(__name__)

DATA_DIR = get_backend_data_dir()
USER_CHILDREN_FILE = os.path.join(DATA_DIR, "user_children.json")
USER_PLANS_FILE = os.path.join(DATA_DIR, "user_plans.json")
USER_TEST_RESULTS_FILE = os.path.join(DATA_DIR, "user_test_results.json")

SCHEMA_VERSION = 2

_migrated_users: set = set()


def _load(path: str) -> Dict:
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error("Error loading %s: %s", path, e)
    return {}


def _save(path: str, data: Dict) -> None:
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def ensure_user_migrated(user_id: str) -> None:
    """Merge legacy children + loose test_results into v2 profiles once per process."""
    if user_id in _migrated_users:
        return

    children_root = _load(USER_CHILDREN_FILE)
    tests_root = _load(USER_TEST_RESULTS_FILE)
    plans_root = _load(USER_PLANS_FILE)

    raw_children = children_root.get(user_id, {})
    raw_tests = tests_root.get(user_id, {})
    user_plans = plans_root.get(user_id, {})

    changed = False
    for cid, child in list(raw_children.items()):
        if not isinstance(child, dict):
            continue
        if child.get("schema_version") == SCHEMA_VERSION and child.get("test_results") is not None:
            continue

        trs = child.get("test_results")
        if trs is None:
            trs = raw_tests.get(cid, [])
            child["test_results"] = trs if isinstance(trs, list) else []

        child["schema_version"] = SCHEMA_VERSION
        if "assessment_snapshot" not in child:
            child["assessment_snapshot"] = None
        if "current_plan_id" not in child:
            matched = None
            for pid, pdata in user_plans.items():
                if isinstance(pdata, dict) and pdata.get("child_id") == cid:
                    matched = pid
                    break
            child["current_plan_id"] = matched
        if "plan_history" not in child:
            child["plan_history"] = []
        if "onboarding" not in child:
            done = bool(child.get("current_plan_id")) or len(child.get("test_results", [])) > 0
            child["onboarding"] = {"step": 5 if done else 1, "completed": done}
        if "updated_at" not in child:
            child["updated_at"] = datetime.now().isoformat()
        raw_children[cid] = child
        changed = True

    if changed:
        children_root[user_id] = raw_children
        _save(USER_CHILDREN_FILE, children_root)

    _migrated_users.add(user_id)


def _touch(child: Dict) -> None:
    child["updated_at"] = datetime.now().isoformat()


# ----- Public API (plans.py compatibility) -----


def get_user_children(user_id: str) -> Dict[str, Dict]:
    ensure_user_migrated(user_id)
    data = _load(USER_CHILDREN_FILE)
    return dict(data.get(user_id, {}))


def save_user_children(user_id: str, children: Dict[str, Dict]) -> None:
    data = _load(USER_CHILDREN_FILE)
    data[user_id] = children
    _save(USER_CHILDREN_FILE, data)


def get_user_test_results(user_id: str) -> Dict[str, List]:
    ensure_user_migrated(user_id)
    children = get_user_children(user_id)
    out: Dict[str, List] = {}
    for cid, prof in children.items():
        out[cid] = prof.get("test_results") or []
    return out


def save_user_test_results(user_id: str, test_results: Dict[str, List]) -> None:
    """Sync test result map into embedded profiles (and optionally legacy file for backup)."""
    ensure_user_migrated(user_id)
    children = get_user_children(user_id)
    for cid, results in test_results.items():
        if cid not in children:
            continue
        children[cid]["test_results"] = results
        _touch(children[cid])
    save_user_children(user_id, children)
    # Keep legacy mirror for external tools / rollback
    root = _load(USER_TEST_RESULTS_FILE)
    root[user_id] = test_results
    _save(USER_TEST_RESULTS_FILE, root)


def get_user_plans(user_id: str) -> Dict:
    data = _load(USER_PLANS_FILE)
    return dict(data.get(user_id, {}))


def save_user_plans(user_id: str, plans: Dict) -> None:
    data = _load(USER_PLANS_FILE)
    data[user_id] = plans
    _save(USER_PLANS_FILE, data)


# ----- ChildProfile CRUD -----


def list_child_profiles(user_id: str) -> List[Dict[str, Any]]:
    ensure_user_migrated(user_id)
    profiles = get_user_children(user_id)
    return list(profiles.values())


def get_child_profile(user_id: str, child_id: str) -> Optional[Dict[str, Any]]:
    ensure_user_migrated(user_id)
    return get_user_children(user_id).get(child_id)


def delete_child_profile(user_id: str, child_id: str) -> bool:
    children = get_user_children(user_id)
    if child_id not in children:
        return False
    del children[child_id]
    save_user_children(user_id, children)
    tr = get_user_test_results(user_id)
    if child_id in tr:
        del tr[child_id]
        save_user_test_results(user_id, tr)
    return True


def create_child_profile(user_id: str, basic: Dict[str, Any]) -> str:
    ensure_user_migrated(user_id)
    children = get_user_children(user_id)
    child_id = f"child_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    now = datetime.now().isoformat()
    profile = {
        "child_id": child_id,
        "schema_version": SCHEMA_VERSION,
        "name": basic["name"],
        "age": int(basic["age"]),
        "gender": basic.get("gender") or "",
        "birth_date": basic.get("birth_date") or "",
        "parent_name": basic.get("parent_name") or "",
        "child_condition": basic.get("child_condition"),
        "main_problems": basic.get("main_problems") or [],
        "created_at": now,
        "updated_at": now,
        "assessment_snapshot": None,
        "test_results": [],
        "current_plan_id": None,
        "plan_history": [],
        "onboarding": {"step": 1, "completed": False},
    }
    children[child_id] = profile
    save_user_children(user_id, children)
    # Init empty test bucket in legacy file
    tr = get_user_test_results(user_id)
    tr[child_id] = []
    save_user_test_results(user_id, tr)
    return child_id


def patch_child_profile(user_id: str, child_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    children = get_user_children(user_id)
    if child_id not in children:
        return None
    prof = children[child_id]
    for k, v in updates.items():
        if k in ("child_id", "schema_version"):
            continue
        prof[k] = v
    _touch(prof)
    children[child_id] = prof
    save_user_children(user_id, children)
    return prof


def append_test_result_record(user_id: str, child_id: str, result: Dict[str, Any]) -> None:
    children = get_user_children(user_id)
    if child_id not in children:
        raise KeyError("child not found")
    prof = children[child_id]
    lst = prof.get("test_results") or []
    lst.append(result)
    prof["test_results"] = lst
    _touch(prof)
    save_user_children(user_id, children)
    tr = get_user_test_results(user_id)
    tr[child_id] = prof["test_results"]
    save_user_test_results(user_id, tr)


def set_assessment_snapshot(
    user_id: str,
    child_id: str,
    raw_payload: Dict[str, Any],
    analysis: Optional[Dict[str, Any]],
    assessment_id: Optional[str],
) -> None:
    children = get_user_children(user_id)
    if child_id not in children:
        raise KeyError("child not found")
    prof = children[child_id]
    prof["assessment_snapshot"] = {
        "raw": raw_payload,
        "analysis": analysis,
        "assessment_id": assessment_id,
        "captured_at": datetime.now().isoformat(),
    }
    _touch(prof)
    save_user_children(user_id, children)


def set_onboarding(user_id: str, child_id: str, step: int, completed: bool) -> None:
    patch_child_profile(
        user_id,
        child_id,
        {"onboarding": {"step": step, "completed": completed}},
    )


def attach_plan(user_id: str, child_id: str, plan_id: str) -> None:
    children = get_user_children(user_id)
    if child_id not in children:
        raise KeyError("child not found")
    prof = children[child_id]
    prof["current_plan_id"] = plan_id
    hist = prof.get("plan_history") or []
    hist.append({"plan_id": plan_id, "created_at": datetime.now().isoformat()})
    prof["plan_history"] = hist[-20:]
    _touch(prof)
    save_user_children(user_id, children)
