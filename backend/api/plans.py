"""
训练计划API端点
"""

import logging
from datetime import datetime
from typing import List, Optional, Dict
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel

import sys
import os
import json

# 添加backend目录到路径
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from models.plan_generator import (
    ChildInfo, TestResult, TrainingPlan, DailyTask,
    plan_generator
)
from dataclasses import asdict
from auth import get_current_user, UserResponse
from utils.i18n import t, get_language_from_request

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/plans", tags=["plans"])

# ==================== 用户数据存储文件 ====================
DATA_DIR = "data"
USER_CHILDREN_FILE = os.path.join(DATA_DIR, "user_children.json")
USER_PLANS_FILE = os.path.join(DATA_DIR, "user_plans.json")
USER_TEST_RESULTS_FILE = os.path.join(DATA_DIR, "user_test_results.json")

# 确保数据目录存在
os.makedirs(DATA_DIR, exist_ok=True)

# ==================== 数据存储函数（基于用户ID） ====================

def load_user_data_file(file_path: str) -> Dict:
    """加载用户数据文件"""
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading {file_path}: {e}")
            return {}
    return {}

def save_user_data_file(file_path: str, data: Dict):
    """保存用户数据文件"""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error saving {file_path}: {e}")
        raise

def get_user_children(user_id: str) -> Dict:
    """获取用户的所有孩子"""
    data = load_user_data_file(USER_CHILDREN_FILE)
    return data.get(user_id, {})

def save_user_children(user_id: str, children: Dict):
    """保存用户的孩子数据"""
    data = load_user_data_file(USER_CHILDREN_FILE)
    data[user_id] = children
    save_user_data_file(USER_CHILDREN_FILE, data)

def get_user_plans(user_id: str) -> Dict:
    """获取用户的所有计划"""
    data = load_user_data_file(USER_PLANS_FILE)
    return data.get(user_id, {})

def save_user_plans(user_id: str, plans: Dict):
    """保存用户的计划数据"""
    data = load_user_data_file(USER_PLANS_FILE)
    data[user_id] = plans
    save_user_data_file(USER_PLANS_FILE, data)

def get_user_test_results(user_id: str) -> Dict:
    """获取用户的所有测试结果"""
    data = load_user_data_file(USER_TEST_RESULTS_FILE)
    return data.get(user_id, {})

def save_user_test_results(user_id: str, test_results: Dict):
    """保存用户的测试结果数据"""
    data = load_user_data_file(USER_TEST_RESULTS_FILE)
    data[user_id] = test_results
    save_user_data_file(USER_TEST_RESULTS_FILE, data)


# ==================== Request/Response Models ====================

class ChildInfoRequest(BaseModel):
    name: str
    age: int
    gender: str
    birth_date: str
    parent_name: str
    child_condition: Optional[str] = None  # 孩子状况说明
    main_problems: Optional[List[str]] = None  # 主要问题列表


class TestResultRequest(BaseModel):
    child_id: str
    test_type: str
    test_data: dict
    score: float
    performance_level: str


class DailyTaskUpdate(BaseModel):
    task_id: str
    completed: bool = False
    test_result: Optional[dict] = None


class PlanCreateRequest(BaseModel):
    child_id: str
    plan_type: str = "weekly"  # 'weekly' or 'monthly'
    test_results: List[dict]


# ==================== API Endpoints ====================

@router.post("/children", response_model=dict)
async def create_child(
    child_info: ChildInfoRequest,
    request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """创建孩子信息（关联到当前用户）"""
    try:
        logger.info(f"用户 {user.id} 创建孩子信息: {child_info.name}")
        child_id = f"child_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        child = ChildInfo(
            child_id=child_id,
            name=child_info.name,
            age=child_info.age,
            gender=child_info.gender,
            birth_date=child_info.birth_date,
            parent_name=child_info.parent_name,
            created_at=datetime.now().isoformat(),
            child_condition=child_info.child_condition,
            main_problems=child_info.main_problems or []
        )
        
        # 保存到用户数据
        children = get_user_children(user.id)
        children[child_id] = asdict(child)
        save_user_children(user.id, children)
        
        # 初始化测试结果
        test_results = get_user_test_results(user.id)
        test_results[child_id] = []
        save_user_test_results(user.id, test_results)
        
        logger.info(f"孩子信息创建成功: {child_id} for user {user.id}")
        return {
            "success": True,
            "data": {
                "child_id": child_id,
                "child_info": {
                    "name": child.name,
                    "age": child.age,
                    "gender": child.gender,
                    "birth_date": child.birth_date,
                    "parent_name": child.parent_name
                }
            },
            "message": t("success.child_created", request=request)
        }
    except Exception as e:
        logger.error(f"创建孩子信息失败: {e}", exc_info=True)
        error_msg = t("error.create_child_failed", request=request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.get("/children", response_model=dict)
async def get_children(
    request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """获取当前用户的所有孩子"""
    try:
        children = get_user_children(user.id)
        children_list = list(children.values())
        
        return {
            "success": True,
            "data": {
                "children": children_list
            }
        }
    except Exception as e:
        logger.error(f"获取孩子列表失败: {e}")
        error_msg = t("error.get_children_failed", request=request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")

@router.get("/children/{child_id}", response_model=dict)
async def get_child(
    child_id: str,
    request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """获取孩子信息（只返回属于当前用户的孩子）"""
    try:
        children = get_user_children(user.id)
        if child_id not in children:
            error_msg = t("error.child_access_denied", request=request)
            raise HTTPException(status_code=404, detail=error_msg)
        
        child_data = children[child_id]
        return {
            "success": True,
            "data": {
                "child_id": child_data.get("child_id"),
                "name": child_data.get("name"),
                "age": child_data.get("age"),
                "gender": child_data.get("gender"),
                "birth_date": child_data.get("birth_date"),
                "parent_name": child_data.get("parent_name"),
                "created_at": child_data.get("created_at"),
                "child_condition": child_data.get("child_condition"),
                "main_problems": child_data.get("main_problems", [])
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取孩子信息失败: {e}")
        error_msg = t("error.get_child_failed", request=request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.post("/test-results", response_model=dict)
async def submit_test_result(
    test_result: TestResultRequest,
    request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """提交测试结果（关联到当前用户）"""
    try:
        # 验证孩子属于当前用户
        children = get_user_children(user.id)
        if test_result.child_id not in children:
            error_msg = t("error.child_access_denied", request=request)
            raise HTTPException(status_code=404, detail=error_msg)
        
        result = TestResult(
            test_id=f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            child_id=test_result.child_id,
            test_type=test_result.test_type,
            test_data=test_result.test_data,
            score=test_result.score,
            performance_level=test_result.performance_level,
            timestamp=datetime.now().isoformat()
        )
        
        # 保存到用户数据
        test_results = get_user_test_results(user.id)
        if test_result.child_id not in test_results:
            test_results[test_result.child_id] = []
        test_results[test_result.child_id].append(asdict(result))
        save_user_test_results(user.id, test_results)
        
        return {
            "success": True,
            "data": {
                "test_id": result.test_id,
                "score": result.score,
                "performance_level": result.performance_level
            },
            "message": t("success.test_result_submitted", request=request)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"提交测试结果失败: {e}")
        error_msg = t("error.create_test_result_failed", request=request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.get("/children/{child_id}/test-results", response_model=dict)
async def get_test_results(
    child_id: str,
    request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """获取孩子的测试结果历史（只返回属于当前用户的孩子）"""
    try:
        # 验证孩子属于当前用户
        children = get_user_children(user.id)
        if child_id not in children:
            error_msg = t("error.child_access_denied", request=request)
            raise HTTPException(status_code=404, detail=error_msg)
        
        test_results = get_user_test_results(user.id)
        results = test_results.get(child_id, [])
        
        return {
            "success": True,
            "data": {
                "child_id": child_id,
                "test_results": results
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取测试结果失败: {e}")
        error_msg = t("error.get_test_results_failed", request=request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.post("/plans", response_model=dict)
async def create_plan(
    request: PlanCreateRequest,
    http_request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """创建训练计划（关联到当前用户）"""
    try:
        # 验证孩子属于当前用户
        children = get_user_children(user.id)
        if request.child_id not in children:
            error_msg = t("error.child_access_denied", request=http_request)
            raise HTTPException(status_code=404, detail=error_msg)
        
        child_data = children[request.child_id]
        # 将字典转换为ChildInfo对象
        child = ChildInfo(**child_data)
        
        # 转换测试结果
        test_results = []
        for tr_data in request.test_results:
            result = TestResult(
                test_id=tr_data.get('test_id', f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}"),
                child_id=request.child_id,
                test_type=tr_data['test_type'],
                test_data=tr_data.get('test_data', {}),
                score=tr_data['score'],
                performance_level=tr_data['performance_level'],
                timestamp=tr_data.get('timestamp', datetime.now().isoformat())
            )
            test_results.append(result)
        
        # 如果没有测试结果，创建一个默认的
        if not test_results:
            default_result = TestResult(
                test_id=f"default_test_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                child_id=request.child_id,
                test_type="initial",
                test_data={},
                score=60.0,
                performance_level="average",
                timestamp=datetime.now().isoformat()
            )
            test_results.append(default_result)
        
        # Get language from request
        from utils.i18n import get_language_from_request
        language = get_language_from_request(http_request)
        logger.info(f"Language detected from request: {language} (X-Language: {http_request.headers.get('X-Language', 'not set')}, Accept-Language: {http_request.headers.get('Accept-Language', 'not set')})")
        
        # 生成计划
        plan = plan_generator.generate_plan(child, test_results, request.plan_type, language=language)
        
        # 保存到用户数据
        plans = get_user_plans(user.id)
        plans[plan.plan_id] = asdict(plan)
        save_user_plans(user.id, plans)
        
        # 返回计划数据
        return {
            "success": True,
            "data": {
                "plan_id": plan.plan_id,
                "child_id": plan.child_id,
                "plan_type": plan.plan_type,
                "duration_days": plan.duration_days,
                "start_date": plan.start_date,
                "end_date": plan.end_date,
                "focus_areas": plan.focus_areas,
                "goals": plan.goals,
                "daily_tasks": [
                    {
                        "task_id": task.task_id,
                        "day": task.day,
                        "date": task.date,
                        "activities": task.activities,
                        "parent_guidance": task.parent_guidance,
                        "test_required": task.test_required,
                        "test_type": task.test_type,
                        "completed": task.completed,
                        "test_completed": task.test_completed
                    }
                    for task in plan.daily_tasks
                ],
                "status": plan.status,
                "created_at": plan.created_at
            },
            "message": t("success.plan_generated", request=http_request)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建计划失败: {e}")
        error_msg = t("error.create_plan_failed", request=http_request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.get("/plans", response_model=dict)
async def get_all_plans(
    request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """获取当前用户的所有计划"""
    try:
        plans = get_user_plans(user.id)
        plans_list = []
        
        # Get language from request
        language = get_language_from_request(request)
        
        for plan_id, plan_data in plans.items():
            # Translate plan data
            translated_plan = _translate_plan_data(plan_data, language)
            # 计算进度
            progress = _calculate_progress_from_dict(translated_plan)
            plans_list.append({
                **translated_plan,
                "progress": progress
            })
        
        return {
            "success": True,
            "data": {
                "plans": plans_list
            }
        }
    except Exception as e:
        logger.error(f"获取计划列表失败: {e}")
        error_msg = t("error.get_plans_failed", request=request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")

@router.get("/plans/{plan_id}", response_model=dict)
async def get_plan(
    plan_id: str,
    request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """获取训练计划（只返回属于当前用户的计划）"""
    try:
        plans = get_user_plans(user.id)
        if plan_id not in plans:
            error_msg = t("error.plan_access_denied", request=request)
            raise HTTPException(status_code=404, detail=error_msg)
        
        plan_data = plans[plan_id]
        
        # Get language from request and translate plan data
        language = get_language_from_request(request)
        logger.info(f"[GET /plans/{plan_id}] Language detected: {language}, X-Language header: {request.headers.get('X-Language', 'not set')}, Accept-Language header: {request.headers.get('Accept-Language', 'not set')}")
        translated_plan = _translate_plan_data(plan_data, language)
        
        return {
            "success": True,
            "data": translated_plan
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取计划失败: {e}")
        error_msg = t("error.get_plan_failed", request=request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.get("/children/{child_id}/plans", response_model=dict)
async def get_child_plans(
    child_id: str,
    request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """获取孩子的所有计划（只返回属于当前用户的孩子）"""
    try:
        # 验证孩子属于当前用户
        children = get_user_children(user.id)
        if child_id not in children:
            error_msg = t("error.child_access_denied", request=request)
            raise HTTPException(status_code=404, detail=error_msg)
        
        plans = get_user_plans(user.id)
        child_plans = [
            plan_data for plan_data in plans.values()
            if plan_data.get("child_id") == child_id
        ]
        
        # Get language from request and translate plans
        language = get_language_from_request(request)
        
        # 为每个计划计算进度并翻译
        translated_plans = []
        for plan in child_plans:
            translated_plan = _translate_plan_data(plan, language)
            translated_plan["progress"] = _calculate_progress_from_dict(translated_plan)
            translated_plans.append(translated_plan)
        
        return {
            "success": True,
            "data": {
                "child_id": child_id,
                "plans": translated_plans
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取计划列表失败: {e}")
        error_msg = t("error.get_plans_failed", request=request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.put("/plans/{plan_id}/tasks/{day}", response_model=dict)
async def update_daily_task(
    plan_id: str,
    day: int,
    update: DailyTaskUpdate,
    request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """更新每日任务状态（只更新属于当前用户的计划）"""
    try:
        plans = get_user_plans(user.id)
        if plan_id not in plans:
            error_msg = t("error.plan_access_denied", request=request)
            raise HTTPException(status_code=404, detail=error_msg)
        
        plan_data = plans[plan_id]
        daily_tasks = plan_data.get("daily_tasks", [])
        
        # 找到对应的任务
        task = None
        task_index = None
        for i, task_item in enumerate(daily_tasks):
            if task_item.get("day") == day:
                task = task_item
                task_index = i
                break
        
        if not task:
            error_msg = t("error.task_not_found", request=request)
            raise HTTPException(status_code=404, detail=error_msg)
        
        # 更新任务状态
        task["completed"] = update.completed
        
        # 如果有测试结果，更新测试状态
        if update.test_result:
            # 将字典转换为TrainingPlan对象用于更新
            plan_obj = TrainingPlan(**plan_data)
            daily_task_obj = DailyTask(**task)
            
            test_result = TestResult(
                test_id=f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                child_id=plan_obj.child_id,
                test_type=daily_task_obj.test_type or "general",
                test_data=update.test_result.get('test_data', {}),
                score=update.test_result.get('score', 0),
                performance_level=update.test_result.get('performance_level', 'average'),
                timestamp=datetime.now().isoformat()
            )
            
            # 更新计划
            updated_plan = plan_generator.update_plan_with_test_result(plan_obj, day, test_result)
            plan_data = asdict(updated_plan)
            
            task["test_completed"] = True
            task["test_result"] = update.test_result
        
        # 更新daily_tasks
        plan_data["daily_tasks"] = daily_tasks
        
        # 保存更新
        plans[plan_id] = plan_data
        save_user_plans(user.id, plans)
        
        return {
            "success": True,
            "data": {
                "task_id": task.get("task_id"),
                "day": task.get("day"),
                "completed": task.get("completed"),
                "test_completed": task.get("test_completed", False)
            },
            "message": t("success.task_updated", request=request)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新任务失败: {e}", exc_info=True)
        error_msg = t("error.update_task_failed", request=request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


@router.get("/plans/{plan_id}/progress", response_model=dict)
async def get_plan_progress(
    plan_id: str,
    request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """获取计划进度（只返回属于当前用户的计划）"""
    try:
        plans = get_user_plans(user.id)
        if plan_id not in plans:
            error_msg = t("error.plan_access_denied", request=request)
            raise HTTPException(status_code=404, detail=error_msg)
        
        plan_data = plans[plan_id]
        daily_tasks = plan_data.get("daily_tasks", [])
        
        completed_tasks = sum(1 for task in daily_tasks if task.get("completed", False))
        completed_tests = sum(1 for task in daily_tasks if task.get("test_completed", False))
        total_tasks = len(daily_tasks)
        total_tests = sum(1 for task in daily_tasks if task.get("test_required", False))
        
        # 计算测试分数趋势
        test_scores = []
        for task in daily_tasks:
            test_result = task.get("test_result")
            if test_result and 'score' in test_result:
                test_scores.append({
                    "day": task.get("day"),
                    "score": test_result['score'],
                    "performance_level": test_result.get('performance_level', 'average')
                })
        
        return {
            "success": True,
            "data": {
                "plan_id": plan_id,
                "progress": {
                    "tasks_completed": completed_tasks,
                    "tasks_total": total_tasks,
                    "tasks_percentage": round(completed_tasks / total_tasks * 100, 1) if total_tasks > 0 else 0,
                    "tests_completed": completed_tests,
                    "tests_total": total_tests,
                    "tests_percentage": round(completed_tests / total_tests * 100, 1) if total_tests > 0 else 0
                },
                "test_scores": test_scores,
                "improvement_trend": _calculate_improvement_trend(test_scores, request)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取进度失败: {e}")
        error_msg = t("error.get_progress_failed", request=request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")


def _translate_plan_data(plan_data: dict, language: str) -> dict:
    """翻译计划数据到指定语言"""
    from utils.i18n import t, get_language_from_request
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Translating plan data to language: {language}")
    
    def translate_text(key: str, **kwargs) -> str:
        return t(key, language=language, request=None, **kwargs)
    
    translated_plan = plan_data.copy()
    
    # Translate goals
    if "goals" in translated_plan and isinstance(translated_plan["goals"], list):
        # Goals are already translated when created, but we need to re-translate them
        # Since we don't have the original keys, we'll keep them as-is for now
        # In a production system, you'd store translation keys with the plan
        pass
    
    # Translate daily tasks
    if "daily_tasks" in translated_plan and isinstance(translated_plan["daily_tasks"], list):
        translated_tasks = []
        for task in translated_plan["daily_tasks"]:
            translated_task = task.copy()
            
            # Translate activities
            if "activities" in translated_task and isinstance(translated_task["activities"], list):
                translated_activities = []
                for activity in translated_task["activities"]:
                    translated_activity = activity.copy()
                    
                    # Translate activity name, description, and instructions based on activity type
                    activity_type = activity.get("type", "")
                    game_type = activity.get("game_type", "")
                    
                    # Map activity types to translation keys
                    if activity_type == "online_game":
                        if game_type == "schulte" or "schulte" in activity.get("name", "").lower():
                            if "advanced" in activity.get("name", "").lower():
                                translated_activity["name"] = translate_text("activity.name.schulte_advanced")
                                translated_activity["description"] = translate_text("activity.desc.schulte_advanced")
                                translated_activity["detailed_instructions"] = translate_text("activity.instruction.schulte_advanced")
                            else:
                                translated_activity["name"] = translate_text("activity.name.schulte_basic")
                                translated_activity["description"] = translate_text("activity.desc.schulte_basic")
                                translated_activity["detailed_instructions"] = translate_text("activity.instruction.schulte_basic")
                        elif game_type == "attention_tracking" or "attention" in activity.get("name", "").lower():
                            translated_activity["name"] = translate_text("activity.name.attention_tracking")
                            translated_activity["description"] = translate_text("activity.desc.attention_tracking")
                            translated_activity["detailed_instructions"] = translate_text("activity.instruction.attention_tracking")
                        elif game_type == "puzzle" or "puzzle" in activity.get("name", "").lower():
                            translated_activity["name"] = translate_text("activity.name.online_puzzle")
                            translated_activity["description"] = translate_text("activity.desc.online_puzzle")
                            translated_activity["detailed_instructions"] = translate_text("activity.instruction.online_puzzle")
                        elif game_type == "memory" or "memory" in activity.get("name", "").lower():
                            translated_activity["name"] = translate_text("activity.name.memory_cards")
                            translated_activity["description"] = translate_text("activity.desc.memory_cards")
                            translated_activity["detailed_instructions"] = translate_text("activity.instruction.memory_cards")
                        elif game_type == "color_match" or "color" in activity.get("name", "").lower():
                            translated_activity["name"] = translate_text("activity.name.color_match")
                            translated_activity["description"] = translate_text("activity.desc.color_match")
                            translated_activity["detailed_instructions"] = translate_text("activity.instruction.color_match")
                        elif game_type == "sound_play" or "sound" in activity.get("name", "").lower():
                            translated_activity["name"] = translate_text("activity.name.sound_play")
                            translated_activity["description"] = translate_text("activity.desc.sound_play")
                            translated_activity["detailed_instructions"] = translate_text("activity.instruction.sound_play")
                    elif activity_type == "reading":
                        translated_activity["name"] = translate_text("activity.name.focused_reading")
                        translated_activity["description"] = translate_text("activity.desc.focused_reading")
                        translated_activity["detailed_instructions"] = translate_text("activity.instruction.focused_reading")
                    elif activity_type == "role_play":
                        translated_activity["name"] = translate_text("activity.name.role_play")
                        translated_activity["description"] = translate_text("activity.desc.role_play")
                        translated_activity["detailed_instructions"] = translate_text("activity.instruction.role_play")
                    elif activity_type == "conversation":
                        translated_activity["name"] = translate_text("activity.name.conversation_practice")
                        translated_activity["description"] = translate_text("activity.desc.conversation_practice")
                        translated_activity["detailed_instructions"] = translate_text("activity.instruction.conversation_practice")
                    
                    translated_activities.append(translated_activity)
                translated_task["activities"] = translated_activities
            
            # Regenerate parent guidance with correct language
            if "parent_guidance" in translated_task and "activities" in translated_task:
                # Extract focus areas from plan data if available
                focus_areas = translated_plan.get("focus_areas", [])
                if not focus_areas:
                    # Infer from activities
                    focus_areas = []
                    for act in translated_task["activities"]:
                        act_type = act.get("type", "")
                        if act_type == "online_game" and "attention" in act.get("name", "").lower():
                            if "attention" not in focus_areas:
                                focus_areas.append("attention")
                
                # Regenerate parent guidance using plan generator
                day = translated_task.get("day", 1)
                activities = translated_task["activities"]
                translated_task["parent_guidance"] = plan_generator._generate_parent_guidance(
                    focus_areas, day, activities, language
                )
            
            translated_tasks.append(translated_task)
        translated_plan["daily_tasks"] = translated_tasks
    
    return translated_plan


def _calculate_progress_from_dict(plan_data: dict) -> dict:
    """从字典计算计划进度"""
    daily_tasks = plan_data.get("daily_tasks", [])
    completed = sum(1 for task in daily_tasks if task.get("completed", False))
    total = len(daily_tasks)
    return {
        "completed": completed,
        "total": total,
        "percentage": round(completed / total * 100, 1) if total > 0 else 0
    }

def _calculate_progress(plan: TrainingPlan) -> dict:
    """计算计划进度"""
    completed = sum(1 for task in plan.daily_tasks if task.completed)
    total = len(plan.daily_tasks)
    return {
        "completed": completed,
        "total": total,
        "percentage": round(completed / total * 100, 1) if total > 0 else 0
    }


def _calculate_improvement_trend(test_scores: List[dict], request: Request = None) -> str:
    """计算改善趋势"""
    from utils.i18n import t, get_language_from_request
    
    if len(test_scores) < 2:
        return t("trend.insufficient_data", request=request)
    
    scores = [s['score'] for s in test_scores]
    if scores[-1] > scores[0]:
        improvement = ((scores[-1] - scores[0]) / scores[0]) * 100
        if improvement > 10:
            return t("trend.significant_improvement", request=request)
        elif improvement > 5:
            return t("trend.steady_improvement", request=request)
        else:
            return t("trend.slight_improvement", request=request)
    elif scores[-1] < scores[0]:
        return t("trend.needs_attention", request=request)
    else:
        return t("trend.stable", request=request)

# ==================== 用户数据获取API ====================

@router.get("/user-data", response_model=dict)
async def get_user_all_data(
    request: Request,
    user: UserResponse = Depends(get_current_user)
):
    """获取当前用户的所有数据（孩子、测试结果、计划）"""
    try:
        children = get_user_children(user.id)
        test_results = get_user_test_results(user.id)
        plans = get_user_plans(user.id)
        
        return {
            "success": True,
            "data": {
                "user_id": user.id,
                "children": list(children.values()),
                "test_results": test_results,
                "plans": list(plans.values())
            },
            "message": t("success.user_data_retrieved", request=request)
        }
    except Exception as e:
        logger.error(f"获取用户数据失败: {e}", exc_info=True)
        error_msg = t("error.get_user_data_failed", request=request)
        raise HTTPException(status_code=500, detail=f"{error_msg}: {str(e)}")

