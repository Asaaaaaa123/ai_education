"""
Evidence-informed condition → training focus and game mapping.

Sources (non-exhaustive):
- Serious games for ADHD: attention, EF, inhibitory control (PMC12093074, BMC Psychiatry 2025)
- Game-based EF in neurodiverse children (JMIR Serious Games 2024, e59053)
- Digital game-based training in NDD meta-analysis (Ren 2023, Res Dev Disabil)
- Vineland-3 / ABAS-3 adaptive domains for parent monitoring (PMC9659140, PMC7248125)
- Video games + motor skills in NDD (PMC12982429)
"""

from __future__ import annotations

from typing import Dict, List, Optional, Tuple

# Condition → primary training domains (ICF / adaptive-behavior aligned)
CONDITION_FOCUS: Dict[str, List[str]] = {
    "adhd": ["attention", "cognitive"],
    "autism": ["social", "cognitive", "attention"],
    "speech_delay": ["cognitive", "motor"],
    "learning": ["cognitive", "attention"],
    "sensory": ["motor", "attention"],
    "other": ["attention", "cognitive"],
    "": ["attention", "cognitive"],
}

# Condition → preferred child training games (mechanic should match target skill)
CONDITION_GAMES: Dict[str, List[str]] = {
    "adhd": ["schulte", "go_no_go", "attention_tracking"],
    "autism": ["emotion_match", "memory_cards", "turn_taking"],
    "speech_delay": ["color_match", "sound_play", "picture_naming"],
    "learning": ["memory_cards", "puzzle", "sequence_order"],
    "sensory": ["trace_path", "color_match", "calm_sort"],
    "other": ["schulte", "memory_cards", "color_match"],
    "": ["schulte", "memory_cards"],
}

# Age-based fallback when condition is unknown
AGE_TEST_TYPE: Dict[str, Tuple[int, int, str]] = {
    "observation_test": (0, 3),
    "color_shape_test": (3, 6),
    "schulte": (6, 18),
}

CONDITION_TEST_TYPE: Dict[str, str] = {
    "adhd": "schulte",
    "autism": "emotion_match",
    "speech_delay": "color_match",
    "learning": "memory_cards",
    "sensory": "trace_path",
    "other": "schulte",
    "": "schulte",
}

# Parent check-in domains (Vineland-inspired structure; original item wording)
PARENT_CHECKIN_DOMAINS: Dict[str, List[dict]] = {
    "communication": [
        {"id": "follow_instructions", "en": "Follows simple one-step instructions", "zh": "能听懂并执行简单的一步指令"},
        {"id": "express_needs", "en": "Uses words or gestures to express needs", "zh": "会用语言或手势表达需要"},
        {"id": "name_objects", "en": "Names familiar people or objects", "zh": "能说出熟悉的人或物品名称"},
    ],
    "socialization": [
        {"id": "joint_attention", "en": "Looks when you point at something interesting", "zh": "当你指向有趣事物时会看向那里"},
        {"id": "turn_taking", "en": "Takes turns in simple play with you", "zh": "在简单游戏中能轮流进行"},
        {"id": "peer_interest", "en": "Shows interest in other children nearby", "zh": "对附近的其他孩子表现出兴趣"},
    ],
    "daily_living": [
        {"id": "self_feed", "en": "Feeds self with spoon or fingers", "zh": "能用勺子或手指自己进食"},
        {"id": "wash_hands", "en": "Washes hands with help", "zh": "在帮助下能洗手"},
        {"id": "dress_help", "en": "Helps with dressing (arms/legs)", "zh": "穿衣时愿意配合抬手抬脚"},
    ],
    "motor": [
        {"id": "stack_blocks", "en": "Stacks 3+ blocks or cups", "zh": "能叠起3块以上积木或杯子"},
        {"id": "copy_stroke", "en": "Copies a line or circle when shown", "zh": "能模仿画直线或圆圈"},
        {"id": "gross_motor", "en": "Runs or climbs without frequent falls", "zh": "跑或爬时较少摔倒"},
    ],
}


def normalize_condition(raw: Optional[str]) -> str:
    if not raw:
        return ""
    key = str(raw).strip().lower().replace(" ", "_")
    if key in CONDITION_FOCUS:
        return key
    aliases = {
        "asd": "autism",
        "add": "adhd",
        "speech": "speech_delay",
        "language_delay": "speech_delay",
        "ld": "learning",
        "sensory_processing": "sensory",
    }
    return aliases.get(key, "other" if key else "")


def focus_areas_for_condition(condition: Optional[str], existing: List[str]) -> List[str]:
    """Merge condition-based focus with test-derived areas; cap at 3."""
    cond = normalize_condition(condition)
    merged: List[str] = []
    for area in CONDITION_FOCUS.get(cond, CONDITION_FOCUS[""]) + (existing or []):
        if area not in merged:
            merged.append(area)
    return merged[:3]


def test_type_for_child(condition: Optional[str], age: int) -> str:
    cond = normalize_condition(condition)
    preferred = CONDITION_TEST_TYPE.get(cond, "schulte")
    if age < 3:
        return "observation_test"
    if age < 6 and cond in ("speech_delay", "sensory", "autism"):
        return CONDITION_TEST_TYPE.get(cond, "color_shape_test")
    if age < 6:
        return "color_shape_test"
    return preferred


def primary_games_for_condition(condition: Optional[str]) -> List[str]:
    cond = normalize_condition(condition)
    return list(CONDITION_GAMES.get(cond, CONDITION_GAMES[""]))


def game_type_for_activity(condition: Optional[str], focus_area: str, day: int) -> Optional[str]:
    """Pick a condition-appropriate online game for an activity slot."""
    games = primary_games_for_condition(condition)
    if not games:
        return None
    idx = (day - 1) % len(games)
    if focus_area == "social" and "emotion_match" in games:
        return "emotion_match"
    if focus_area == "motor" and "trace_path" in games:
        return "trace_path"
    return games[idx]
