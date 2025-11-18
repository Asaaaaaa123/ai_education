"""
AI训练计划生成器
根据孩子的测试结果生成个性化训练计划
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)


@dataclass
class ChildInfo:
    """孩子基本信息"""
    child_id: str
    name: str
    age: int
    gender: str
    birth_date: str
    parent_name: str
    created_at: str
    child_condition: Optional[str] = None  # 孩子状况说明
    main_problems: Optional[List[str]] = None  # 主要问题列表


@dataclass
class TestResult:
    """测试结果"""
    test_id: str
    child_id: str
    test_type: str  # 'schulte', 'attention', 'memory', etc.
    test_data: Dict
    score: float
    performance_level: str  # 'excellent', 'good', 'average', 'needs_improvement'
    timestamp: str


@dataclass
class DailyTask:
    """每日任务"""
    task_id: str
    day: int  # 第几天
    date: str
    activities: List[Dict]  # 具体活动列表
    parent_guidance: str  # 家长指导
    test_required: bool  # 是否需要测试
    test_type: Optional[str]  # 测试类型
    completed: bool = False
    test_completed: bool = False
    test_result: Optional[Dict] = None


@dataclass
class TrainingPlan:
    """训练计划"""
    plan_id: str
    child_id: str
    plan_type: str  # 'weekly' or 'monthly'
    duration_days: int
    start_date: str
    end_date: str
    daily_tasks: List[DailyTask]
    focus_areas: List[str]  # 重点改善领域
    goals: List[str]  # 训练目标
    created_at: str
    status: str = 'active'  # 'active', 'completed', 'paused'


class PlanGenerator:
    """训练计划生成器"""
    
    def __init__(self):
        # Don't load templates in __init__ - load them with language when needed
        self._cached_templates = {}
    
    def _load_activity_templates(self, language: str = 'en') -> Dict:
        """加载活动模板（包含详细说明和可在网站内进行的游戏）"""
        # Use cached templates if available for this language
        if language in self._cached_templates:
            return self._cached_templates[language]
        
        # Import i18n here to avoid circular imports
        from utils.i18n import t
        
        # Create a translation function for this language
        def translate(key: str) -> str:
            return t(key, language=language, request=None)
        
        templates = {
            'attention': {
                'excellent': [
                    {
                        'type': 'online_game',
                        'name': translate('activity.name.schulte_advanced'),
                        'duration': 15,
                        'description': translate('activity.desc.schulte_advanced'),
                        'game_type': 'schulte',
                        'detailed_instructions': translate('activity.instruction.schulte_advanced'),
                        'can_play_online': True,
                        'min_age': 6  # 适合6岁以上
                    },
                    {
                        'type': 'mindfulness',
                        'name': translate('activity.name.mindfulness_breathing'),
                        'duration': 10,
                        'description': translate('activity.desc.mindfulness_breathing'),
                        'detailed_instructions': translate('activity.instruction.mindfulness_breathing'),
                        'can_play_online': False,
                        'min_age': 6  # 适合6岁以上
                    },
                ],
                'good': [
                    {
                        'type': 'online_game',
                        'name': translate('activity.name.attention_tracking'),
                        'duration': 20,
                        'description': translate('activity.desc.attention_tracking'),
                        'game_type': 'attention_tracking',
                        'detailed_instructions': translate('activity.instruction.attention_tracking'),
                        'can_play_online': True
                    },
                    {
                        'type': 'reading',
                        'name': translate('activity.name.focused_reading'),
                        'duration': 15,
                        'description': translate('activity.desc.focused_reading'),
                        'detailed_instructions': translate('activity.instruction.focused_reading'),
                        'can_play_online': False
                    },
                ],
                'average': [
                    {
                        'type': 'online_game',
                        'name': translate('activity.name.simple_attention'),
                        'duration': 15,
                        'description': translate('activity.desc.simple_attention'),
                        'game_type': 'simple_attention',
                        'detailed_instructions': translate('activity.instruction.simple_attention'),
                        'can_play_online': True
                    },
                    {
                        'type': 'task',
                        'name': translate('activity.name.focused_task'),
                        'duration': 10,
                        'description': translate('activity.desc.focused_task'),
                        'detailed_instructions': translate('activity.instruction.focused_task'),
                        'can_play_online': False
                    },
                ],
                'needs_improvement': [
                    {
                        'type': 'online_game',
                        'name': translate('activity.name.guided_attention'),
                        'duration': 10,
                        'description': translate('activity.desc.guided_attention'),
                        'game_type': 'guided_attention',
                        'detailed_instructions': translate('activity.instruction.guided_attention'),
                        'can_play_online': True,
                        'min_age': 3  # 适合3岁以上
                    },
                    {
                        'type': 'online_game',
                        'name': translate('activity.name.color_match'),
                        'duration': 5,
                        'description': translate('activity.desc.color_match'),
                        'game_type': 'color_match',
                        'detailed_instructions': translate('activity.instruction.color_match'),
                        'can_play_online': True,
                        'min_age': 2  # 适合2岁以上
                    },
                    {
                        'type': 'online_game',
                        'name': translate('activity.name.sound_play'),
                        'duration': 5,
                        'description': translate('activity.desc.sound_play'),
                        'game_type': 'sound_play',
                        'detailed_instructions': translate('activity.instruction.sound_play'),
                        'can_play_online': True,
                        'min_age': 2  # 适合2岁以上
                    },
                    {
                        'type': 'guided',
                        'name': translate('activity.name.parent_guided_focus'),
                        'duration': 5,
                        'description': translate('activity.desc.parent_guided_focus'),
                        'detailed_instructions': translate('activity.instruction.parent_guided_focus'),
                        'can_play_online': False,
                        'min_age': 1  # 适合1岁以上
                    },
                ]
            },
            'cognitive': [
                {
                    'type': 'online_game',
                    'name': translate('activity.name.online_puzzle'),
                    'duration': 20,
                    'description': translate('activity.desc.online_puzzle'),
                    'game_type': 'puzzle',
                    'detailed_instructions': translate('activity.instruction.online_puzzle'),
                    'can_play_online': True
                },
                {
                    'type': 'online_game',
                    'name': translate('activity.name.memory_cards'),
                    'duration': 15,
                    'description': translate('activity.desc.memory_cards'),
                    'game_type': 'memory',
                    'detailed_instructions': translate('activity.instruction.memory_cards'),
                    'can_play_online': True
                },
                {
                    'type': 'offline',
                    'name': translate('activity.name.logic_thinking'),
                    'duration': 15,
                    'description': translate('activity.desc.logic_thinking'),
                    'detailed_instructions': translate('activity.instruction.logic_thinking'),
                    'can_play_online': False
                },
            ],
            'social': [
                {
                    'type': 'role_play',
                    'name': translate('activity.name.role_play'),
                    'duration': 20,
                    'description': translate('activity.desc.role_play'),
                    'detailed_instructions': translate('activity.instruction.role_play'),
                    'can_play_online': False
                },
                {
                    'type': 'conversation',
                    'name': translate('activity.name.conversation'),
                    'duration': 15,
                    'description': translate('activity.desc.conversation'),
                    'detailed_instructions': translate('activity.instruction.conversation'),
                    'can_play_online': False
                },
            ],
            'motor': [
                {
                    'type': 'exercise',
                    'name': translate('activity.name.exercise'),
                    'duration': 20,
                    'description': translate('activity.desc.exercise'),
                    'detailed_instructions': translate('activity.instruction.exercise'),
                    'can_play_online': False
                },
                {
                    'type': 'fine_motor',
                    'name': translate('activity.name.fine_motor'),
                    'duration': 15,
                    'description': translate('activity.desc.fine_motor'),
                    'detailed_instructions': translate('activity.instruction.fine_motor'),
                    'can_play_online': False
                },
            ]
        }
        
        # Cache templates for this language
        self._cached_templates[language] = templates
        return templates
    
    def generate_plan(self, child_info: ChildInfo, test_results: List[TestResult], 
                      plan_type: str = 'weekly', language: str = 'en') -> TrainingPlan:
        """生成训练计划"""
        try:
            # Load activity templates for the specified language
            logger.info(f"Loading activity templates for language: {language}")
            self.activity_templates = self._load_activity_templates(language)
            
            # 分析测试结果，确定重点改善领域
            focus_areas = self._analyze_test_results(test_results, child_info)
            
            # 确定计划时长
            duration_days = 7 if plan_type == 'weekly' else 30
            
            # 生成每日任务
            daily_tasks = self._generate_daily_tasks(
                child_info, test_results, focus_areas, duration_days, language
            )
            
            # 生成训练目标
            goals = self._generate_goals(focus_areas, test_results, child_info, language)
            
            # 创建计划
            plan_id = f"plan_{child_info.child_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            start_date = datetime.now().strftime('%Y-%m-%d')
            end_date = (datetime.now() + timedelta(days=duration_days - 1)).strftime('%Y-%m-%d')
            
            plan = TrainingPlan(
                plan_id=plan_id,
                child_id=child_info.child_id,
                plan_type=plan_type,
                duration_days=duration_days,
                start_date=start_date,
                end_date=end_date,
                daily_tasks=daily_tasks,
                focus_areas=focus_areas,
                goals=goals,
                created_at=datetime.now().isoformat(),
                status='active'
            )
            
            logger.info(f"生成训练计划: {plan_id} for child {child_info.child_id}")
            return plan
            
        except Exception as e:
            logger.error(f"生成计划失败: {e}")
            raise
    
    def _analyze_test_results(self, test_results: List[TestResult], child_info: ChildInfo) -> List[str]:
        """分析测试结果和问题，确定重点改善领域"""
        focus_areas = []
        
        # 分析各种测试结果
        attention_scores = []
        cognitive_scores = []
        social_scores = []
        motor_scores = []
        
        for result in test_results:
            # 支持多种测试类型
            if result.test_type in ['schulte', 'attention', 'color_match', 'sound_play', 'simple_attention']:
                attention_scores.append(result.score)
            elif result.test_type in ['cognitive', 'memory', 'memory_cards', 'online_puzzle']:
                cognitive_scores.append(result.score)
            elif result.test_type == 'social':
                social_scores.append(result.score)
            elif result.test_type in ['age_adaptive', 'shape_sort', 'pattern_complete']:
                # 年龄适配游戏根据得分判断
                if result.score >= 70:
                    attention_scores.append(result.score)
                    cognitive_scores.append(result.score)
                else:
                    attention_scores.append(result.score)
        
        # 根据分数和表现水平确定重点领域
        if attention_scores:
            avg_attention = sum(attention_scores) / len(attention_scores)
            # 根据分数区间判断严重程度
            if avg_attention < 50:
                focus_areas.append('attention')  # 严重需要改善
            elif avg_attention < 70:
                focus_areas.append('attention')  # 需要改善
            elif avg_attention >= 85:
                # 如果分数很好，可以考虑增强而不是干预
                pass
        
        if cognitive_scores:
            avg_cognitive = sum(cognitive_scores) / len(cognitive_scores)
            if avg_cognitive < 50:
                focus_areas.append('cognitive')  # 严重需要改善
            elif avg_cognitive < 70:
                focus_areas.append('cognitive')  # 需要改善
        
        # 根据家长描述的问题确定重点领域
        if child_info.main_problems:
            problem_mapping = {
                '注意力不集中': 'attention',
                '多动': 'attention',
                '情绪波动大': 'social',
                '社交困难': 'social',
                '学习困难': 'cognitive',
                '语言发育迟缓': 'cognitive',
                '行为问题': 'social',
                '运动协调性差': 'motor',
                '记忆力差': 'cognitive'
            }
            for problem in child_info.main_problems:
                if problem in problem_mapping:
                    area = problem_mapping[problem]
                    if area not in focus_areas:
                        focus_areas.append(area)
        
        # 如果分数很好（>=85）且没有明显问题，则生成增强计划而不是干预计划
        all_scores = attention_scores + cognitive_scores + social_scores
        if all_scores:
            avg_all = sum(all_scores) / len(all_scores)
            if avg_all >= 85 and not child_info.main_problems:
                # 高分且无问题，生成增强计划
                if not focus_areas:
                    focus_areas = ['attention', 'cognitive']  # 增强计划
        
        # 如果没有明确领域，根据年龄和测试结果推断
        if not focus_areas:
            # 如果没有任何测试结果，根据常见问题推断
            if not test_results and child_info.main_problems:
                focus_areas = ['attention', 'cognitive']
            elif test_results:
                # 有测试结果但分数中等，默认关注注意力
                focus_areas = ['attention']
            else:
                focus_areas = ['attention', 'cognitive']
        
        return focus_areas[:3]  # 最多3个重点领域
    
    def _generate_daily_tasks(self, child_info: ChildInfo, test_results: List[TestResult],
                             focus_areas: List[str], duration_days: int, language: str = 'en') -> List[DailyTask]:
        """生成每日任务"""
        daily_tasks = []
        start_date = datetime.now()
        
        # 根据最新的测试结果确定性能水平
        latest_result = test_results[-1] if test_results else None
        performance_level = latest_result.performance_level if latest_result else 'average'
        
        for day in range(1, duration_days + 1):
            task_date = (start_date + timedelta(days=day - 1)).strftime('%Y-%m-%d')
            
            # 生成每日活动（根据年龄过滤）
            activities = self._generate_day_activities(
                focus_areas, performance_level, day, duration_days, child_info.age
            )
            
            # 生成家长指导
            parent_guidance = self._generate_parent_guidance(
                focus_areas, day, activities, language
            )
            
            # 决定是否需要测试（每天或每隔几天）
            test_required = (day % 2 == 0) or (day == duration_days)  # 偶数天和最后一天测试
            
            # 根据年龄选择测试类型
            test_type = None
            if test_required:
                age = child_info.age
                # 确保年龄是整数
                age = int(age) if age else 6
                
                if age < 3:
                    # 2岁以下：使用简单的观察力测试
                    test_type = 'observation_test'
                elif age < 6:
                    # 3-5岁：使用颜色形状匹配测试
                    test_type = 'color_shape_test'
                else:
                    # 6岁以上：使用舒尔特测试
                    test_type = 'schulte'
                
                # 调试日志
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"第{day}天测试类型设置: 年龄={age}, test_type={test_type}, test_required={test_required}")
            
            task = DailyTask(
                task_id=f"task_{day}",
                day=day,
                date=task_date,
                activities=activities,
                parent_guidance=parent_guidance,
                test_required=test_required,
                test_type=test_type,
                completed=False,
                test_completed=False
            )
            
            daily_tasks.append(task)
        
        return daily_tasks
    
    def _generate_day_activities(self, focus_areas: List[str], performance_level: str,
                                day: int, total_days: int, child_age: int = 6) -> List[Dict]:
        """生成单日活动（根据年龄过滤）"""
        activities = []
        
        # 根据重点领域选择活动
        for area in focus_areas:
            if area == 'attention':
                # 从注意力模板中选择
                area_activities = self.activity_templates['attention'].get(
                    performance_level,
                    self.activity_templates['attention']['average']
                )
                # 根据天数调整难度，并过滤年龄不适合的活动
                selected = self._select_activities_for_day(area_activities, day, total_days, child_age)
                activities.extend(selected)
            else:
                # 其他领域的活动
                if area in self.activity_templates:
                    area_activities = self.activity_templates[area]
                    selected = self._select_activities_for_day(area_activities, day, total_days, child_age)
                    activities.extend(selected)
        
        # 确保每天至少2-3个活动，不超过5个（需要过滤年龄）
        if len(activities) < 2:
            fallback_activities = [a for a in self.activity_templates['attention']['average'] 
                                 if a.get('min_age', 0) <= child_age]
            activities.extend(fallback_activities[:2])
        if len(activities) > 5:
            activities = activities[:5]
        
        return activities
    
    def _select_activities_for_day(self, available_activities: List[Dict], 
                                   day: int, total_days: int, child_age: int = 6) -> List[Dict]:
        """为特定一天选择活动（根据年龄过滤）"""
        # 首先过滤年龄不适合的活动
        age_appropriate = [a for a in available_activities 
                          if a.get('min_age', 0) <= child_age]
        
        # 如果没有年龄适合的活动，使用所有活动（但记录警告）
        if not age_appropriate:
            age_appropriate = available_activities
            logger.warning(f"没有找到适合{child_age}岁的活动，使用所有活动")
        
        # 根据天数选择不同难度的活动
        progress = day / total_days
        
        if progress < 0.33:  # 前期
            selected = age_appropriate[:2] if len(age_appropriate) >= 2 else age_appropriate
        elif progress < 0.67:  # 中期
            selected = age_appropriate[1:3] if len(age_appropriate) >= 3 else age_appropriate
        else:  # 后期
            selected = age_appropriate[-2:] if len(age_appropriate) >= 2 else age_appropriate
        
        return selected[:2]  # 每个领域最多2个活动
    
    def _generate_parent_guidance(self, focus_areas: List[str], day: int,
                                  activities: List[Dict], language: str = 'en') -> str:
        """生成家长指导"""
        from utils.i18n import t
        
        def translate(key: str, **kwargs) -> str:
            return t(key, language=language, request=None, **kwargs)
        
        guidance_parts = []
        
        guidance_parts.append(translate('guidance.day_title', day=day))
        guidance_parts.append("")
        
        if 'attention' in focus_areas:
            guidance_parts.append(translate('guidance.attention_focus'))
            guidance_parts.append(f"- {translate('guidance.quiet_environment')}")
            guidance_parts.append(f"- {translate('guidance.encourage_completion')}")
            guidance_parts.append(f"- {translate('guidance.positive_feedback')}")
            guidance_parts.append("")
        
        guidance_parts.append(translate('guidance.today_activities'))
        for i, activity in enumerate(activities, 1):
            guidance_parts.append(f"{i}. {activity['name']}（{activity['duration']}分钟）")
            guidance_parts.append(f"   {translate('guidance.description')}{activity['description']}")
            
            # 如果是可在网站内进行的游戏，添加提示
            if activity.get('can_play_online', False):
                guidance_parts.append(f"   {translate('guidance.can_play_online')}")
            
            # 添加详细操作步骤
            if activity.get('detailed_instructions'):
                guidance_parts.append(f"   {translate('guidance.detailed_steps')}")
                steps = activity['detailed_instructions'].split('\n')
                for step in steps:
                    if step.strip():
                        guidance_parts.append(f"   {step}")
        
        guidance_parts.append("")
        guidance_parts.append(translate('guidance.notes'))
        guidance_parts.append(f"- {translate('guidance.adjust_time')}")
        guidance_parts.append(f"- {translate('guidance.take_breaks')}")
        guidance_parts.append(f"- {translate('guidance.record_performance')}")
        guidance_parts.append(f"- {translate('guidance.online_game_hint')}")
        
        return "\n".join(guidance_parts)
    
    def _generate_goals(self, focus_areas: List[str], test_results: List[TestResult], 
                       child_info: ChildInfo, language: str = 'en') -> List[str]:
        """根据测试结果、年龄和问题动态生成训练目标"""
        from utils.i18n import t
        
        def translate(key: str, **kwargs) -> str:
            return t(key, language=language, request=None, **kwargs)
        
        goals = []
        
        # 分析测试结果的平均分数
        all_scores = []
        attention_scores = []
        cognitive_scores = []
        social_scores = []
        
        for result in test_results:
            all_scores.append(result.score)
            if result.test_type in ['schulte', 'attention', 'color_match', 'sound_play']:
                attention_scores.append(result.score)
            elif result.test_type in ['cognitive', 'memory', 'memory_cards']:
                cognitive_scores.append(result.score)
            elif result.test_type == 'social':
                social_scores.append(result.score)
        
        # 判断是否需要干预计划还是增强计划
        avg_score = sum(all_scores) / len(all_scores) if all_scores else 70
        needs_intervention = avg_score < 70 or (child_info.main_problems and len(child_info.main_problems) > 0)
        
        # 根据年龄调整目标时长
        age = child_info.age
        if age <= 3:
            attention_duration = "5-10分钟" if language == 'zh' else "5-10 minutes"
            task_duration = translate('duration.short_task')
        elif age <= 5:
            attention_duration = "10-15分钟" if language == 'zh' else "10-15 minutes"
            task_duration = translate('duration.simple_task')
        elif age <= 7:
            attention_duration = "15-20分钟" if language == 'zh' else "15-20 minutes"
            task_duration = translate('duration.medium_task')
        else:
            attention_duration = "20-30分钟" if language == 'zh' else "20-30 minutes"
            task_duration = translate('duration.complex_task')
        
        # 生成个性化目标
        if 'attention' in focus_areas:
            if needs_intervention:
                # 干预计划
                if attention_scores:
                    avg_att = sum(attention_scores) / len(attention_scores)
                    if avg_att < 50:
                        goals.append(translate('goal.attention.improve_focus', duration=attention_duration, task_type=task_duration))
                        goals.append(translate('goal.attention.reduce_distraction'))
                    elif avg_att < 70:
                        goals.append(translate('goal.attention.improve_persistence', duration=attention_duration))
                        goals.append(translate('goal.attention.improve_switching'))
                else:
                    goals.append(translate('goal.attention.establish_basic', duration=attention_duration))
                    goals.append(translate('goal.attention.reduce_hyperactivity'))
            else:
                # 增强计划
                goals.append(translate('goal.attention.enhance_level', duration=attention_duration))
                goals.append(translate('goal.attention.complex_tasks'))
        
        if 'cognitive' in focus_areas:
            if needs_intervention:
                if cognitive_scores:
                    avg_cog = sum(cognitive_scores) / len(cognitive_scores)
                    if avg_cog < 50:
                        goals.append(translate('goal.cognitive.establish_basic'))
                        goals.append(translate('goal.cognitive.improve_memory'))
                    elif avg_cog < 70:
                        goals.append(translate('goal.cognitive.enhance_speed'))
                        goals.append(translate('goal.cognitive.working_memory'))
                else:
                    goals.append(translate('goal.cognitive.improve_basic'))
            else:
                goals.append(translate('goal.cognitive.enhance_processing'))
                goals.append(translate('goal.cognitive.advanced_functions'))
        
        if 'social' in focus_areas:
            if needs_intervention:
                goals.append(translate('goal.social.improve_interaction'))
                goals.append(translate('goal.social.emotion_regulation'))
                if '情绪波动大' in (child_info.main_problems or []):
                    goals.append(translate('goal.social.emotion_management'))
                if '社交困难' in (child_info.main_problems or []):
                    goals.append(translate('goal.social.improve_skills'))
            else:
                goals.append(translate('goal.social.enhance_leadership'))
        
        if 'motor' in focus_areas:
            if needs_intervention:
                goals.append(translate('goal.motor.improve_coordination'))
                goals.append(translate('goal.motor.body_coordination'))
            else:
                goals.append(translate('goal.motor.enhance_skills'))
        
        # 根据具体问题添加目标
        if child_info.main_problems:
            if '学习困难' in child_info.main_problems:
                goals.append(translate('goal.learning.improve_methods'))
            if '语言发育迟缓' in child_info.main_problems:
                goals.append(translate('goal.language.promote_development'))
            if '行为问题' in child_info.main_problems:
                goals.append(translate('goal.behavior.improve_performance'))
        
        if not goals:
            goals = [
                translate('goal.general.overall_cognitive'),
                translate('goal.general.learning_performance'),
                translate('goal.general.self_confidence')
            ]
        
        return goals[:5]  # 最多5个目标
    
    def update_plan_with_test_result(self, plan: TrainingPlan, day: int, 
                                    test_result: TestResult) -> TrainingPlan:
        """根据测试结果更新计划"""
        # 找到对应日期的任务
        task = next((t for t in plan.daily_tasks if t.day == day), None)
        if task:
            task.test_completed = True
            task.test_result = asdict(test_result)
            
            # 根据测试结果调整后续任务难度
            if day < plan.duration_days:
                self._adjust_future_tasks(plan, day, test_result)
        
        return plan
    
    def _adjust_future_tasks(self, plan: TrainingPlan, completed_day: int, 
                           test_result: TestResult):
        """根据测试结果调整未来任务"""
        # 如果测试结果好，可以适当提高难度
        # 如果测试结果差，可以降低难度或增加练习
        if test_result.performance_level in ['excellent', 'good']:
            # 提高后续任务难度
            for task in plan.daily_tasks:
                if task.day > completed_day and not task.completed:
                    # 可以替换为更高级的活动
                    pass
        elif test_result.performance_level == 'needs_improvement':
            # 保持当前难度或增加练习时间
            for task in plan.daily_tasks:
                if task.day > completed_day and not task.completed:
                    # 可以延长活动时间
                    for activity in task.activities:
                        activity['duration'] = min(activity['duration'] + 5, 30)


# 全局计划生成器实例
plan_generator = PlanGenerator()

