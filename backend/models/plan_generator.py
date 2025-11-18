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
        self.activity_templates = self._load_activity_templates()
    
    def _load_activity_templates(self) -> Dict:
        """加载活动模板（包含详细说明和可在网站内进行的游戏）"""
        return {
            'attention': {
                'excellent': [
                    {
                        'type': 'online_game',
                        'name': '舒尔特方格高级训练',
                        'duration': 15,
                        'description': '在网站上进行舒尔特方格游戏（6×6网格），按顺序点击数字1-36，训练注意力和视觉搜索能力',
                        'game_type': 'schulte',
                        'detailed_instructions': '操作步骤：1. 点击"开始游戏"按钮 2. 按照1-36的顺序快速点击数字 3. 尽量在30秒内完成 4. 完成后查看成绩和进步情况',
                        'can_play_online': True,
                        'min_age': 6  # 适合6岁以上
                    },
                    {
                        'type': 'mindfulness',
                        'name': '正念呼吸练习',
                        'duration': 10,
                        'description': '进行正念冥想，提高专注力和情绪调节能力',
                        'detailed_instructions': '操作步骤：1. 找个安静的地方坐下 2. 闭上眼睛，深呼吸 3. 专注于呼吸的感觉 4. 当思绪飘走时，温柔地拉回注意力 5. 持续10分钟',
                        'can_play_online': False,
                        'min_age': 6  # 适合6岁以上
                    },
                ],
                'good': [
                    {
                        'type': 'online_game',
                        'name': '注意力追踪游戏',
                        'duration': 20,
                        'description': '在网站上进行注意力训练游戏，通过颜色匹配和形状识别来提升注意力',
                        'game_type': 'attention_tracking',
                        'detailed_instructions': '操作步骤：1. 游戏会显示一系列颜色或形状 2. 记住出现的顺序 3. 按照顺序点击对应的颜色/形状 4. 难度会逐渐增加',
                        'can_play_online': True
                    },
                    {
                        'type': 'reading',
                        'name': '专注阅读练习',
                        'duration': 15,
                        'description': '阅读指定的绘本或故事，要求孩子安静地坐着，专注于阅读内容，家长可以提问检查理解程度',
                        'detailed_instructions': '操作步骤：1. 选择适合孩子年龄的书籍 2. 设定15分钟阅读时间 3. 确保环境安静无干扰 4. 阅读后提问2-3个问题 5. 记录孩子能专注的时间',
                        'can_play_online': False
                    },
                ],
                'average': [
                    {
                        'type': 'online_game',
                        'name': '简单注意力游戏',
                        'duration': 15,
                        'description': '在网站上进行基础注意力训练游戏，适合注意力需要提升的孩子',
                        'game_type': 'simple_attention',
                        'detailed_instructions': '操作步骤：1. 点击"开始游戏" 2. 按照提示完成简单的匹配任务 3. 完成3轮游戏 4. 记录每次的完成时间',
                        'can_play_online': True
                    },
                    {
                        'type': 'task',
                        'name': '专注任务练习',
                        'duration': 10,
                        'description': '完成需要专注的简单任务，如涂色、拼积木等，家长在一旁观察并给予鼓励',
                        'detailed_instructions': '操作步骤：1. 准备简单的涂色本或积木 2. 设定10分钟任务时间 3. 要求孩子安静地完成任务 4. 每2分钟检查一次，给予积极反馈 5. 记录孩子能持续专注的时间',
                        'can_play_online': False
                    },
                ],
                'needs_improvement': [
                    {
                        'type': 'online_game',
                        'name': '引导式注意力游戏',
                        'duration': 10,
                        'description': '在网站上进行简单的引导式注意力游戏，家长可以协助完成',
                        'game_type': 'guided_attention',
                        'detailed_instructions': '操作步骤：1. 家长陪同孩子一起进行 2. 点击"开始游戏" 3. 家长引导孩子找到正确的答案 4. 每完成一步给予鼓励 5. 逐步让孩子独立完成',
                        'can_play_online': True,
                        'min_age': 3  # 适合3岁以上
                    },
                    {
                        'type': 'online_game',
                        'name': '颜色匹配游戏',
                        'duration': 5,
                        'description': '在网站上进行简单的颜色匹配游戏，适合低龄儿童',
                        'game_type': 'color_match',
                        'detailed_instructions': '操作步骤：1. 点击"开始游戏" 2. 点击与目标颜色相同的方块 3. 每完成一个给予鼓励 4. 完成5个匹配 5. 记录完成时间',
                        'can_play_online': True,
                        'min_age': 2  # 适合2岁以上
                    },
                    {
                        'type': 'online_game',
                        'name': '声音识别游戏',
                        'duration': 5,
                        'description': '在网站上进行声音识别游戏，听声音选择对应的动物',
                        'game_type': 'sound_play',
                        'detailed_instructions': '操作步骤：1. 点击"开始游戏" 2. 听播放的声音 3. 点击对应的动物 4. 完成5个识别 5. 记录正确率',
                        'can_play_online': True,
                        'min_age': 2  # 适合2岁以上
                    },
                    {
                        'type': 'guided',
                        'name': '家长引导专注练习',
                        'duration': 5,
                        'description': '在家长引导下进行简短的专注练习，培养基本的注意力习惯',
                        'detailed_instructions': '操作步骤：1. 选择孩子感兴趣的物品（如玩具、图片） 2. 家长引导孩子观察物品3分钟 3. 询问孩子看到了什么 4. 给予表扬和鼓励 5. 记录孩子的反应',
                        'can_play_online': False,
                        'min_age': 1  # 适合1岁以上
                    },
                ]
            },
            'cognitive': [
                {
                    'type': 'online_game',
                    'name': '在线拼图游戏',
                    'duration': 20,
                    'description': '在网站上进行拼图游戏，根据难度选择不同片数的拼图，提高空间思维和问题解决能力',
                    'game_type': 'puzzle',
                    'detailed_instructions': '操作步骤：1. 选择适合的拼图难度（建议从9片开始）2. 观察完整图片 3. 拖动拼图片到正确位置 4. 完成后可以挑战更高难度 5. 记录完成时间',
                    'can_play_online': True
                },
                {
                    'type': 'online_game',
                    'name': '记忆卡片游戏',
                    'duration': 15,
                    'description': '在网站上进行记忆卡片匹配游戏，锻炼短时记忆和工作记忆',
                    'game_type': 'memory',
                    'detailed_instructions': '操作步骤：1. 点击卡片翻转查看图案 2. 记住卡片位置和图案 3. 找到匹配的卡片对 4. 完成所有配对 5. 挑战更难的关卡',
                    'can_play_online': True
                },
                {
                    'type': 'offline',
                    'name': '逻辑思维练习',
                    'duration': 15,
                    'description': '完成逻辑思维题目，可以是从简单到复杂的序列、分类、推理等题目',
                    'detailed_instructions': '操作步骤：1. 准备适合年龄的逻辑题目 2. 每天完成2-3题 3. 家长引导思考过程 4. 鼓励孩子说出推理思路 5. 记录正确率和思考时间',
                    'can_play_online': False
                },
            ],
            'social': [
                {
                    'type': 'role_play',
                    'name': '角色扮演游戏',
                    'duration': 20,
                    'description': '与家人进行角色扮演游戏，模拟日常社交场景，练习对话和互动',
                    'detailed_instructions': '操作步骤：1. 选择一个日常场景（如购物、做客等）2. 分配角色 3. 进行角色扮演 4. 练习礼貌用语和社交技能 5. 结束后讨论表现',
                    'can_play_online': False
                },
                {
                    'type': 'conversation',
                    'name': '对话练习',
                    'duration': 15,
                    'description': '练习日常对话，家长与孩子进行主题对话，提高语言表达和沟通能力',
                    'detailed_instructions': '操作步骤：1. 选择一个话题（如今天做了什么、喜欢的玩具等）2. 家长引导对话 3. 鼓励孩子完整表达 4. 练习轮流说话 5. 记录对话时长',
                    'can_play_online': False
                },
            ],
            'motor': [
                {
                    'type': 'exercise',
                    'name': '运动锻炼',
                    'duration': 20,
                    'description': '进行适当运动，如跑步、跳跃、投球等，提高身体协调性和大肌肉群发展',
                    'detailed_instructions': '操作步骤：1. 选择安全的活动场所 2. 进行热身活动2分钟 3. 主要运动15分钟 4. 放松活动3分钟 5. 记录孩子参与度和表现',
                    'can_play_online': False
                },
                {
                    'type': 'fine_motor',
                    'name': '精细动作训练',
                    'duration': 15,
                    'description': '练习精细动作，如穿珠子、折纸、用筷子等，提高手眼协调能力',
                    'detailed_instructions': '操作步骤：1. 准备适合的精细动作材料 2. 示范正确的操作方法 3. 让孩子练习 4. 鼓励坚持完成 5. 记录完成质量和时间',
                    'can_play_online': False
                },
            ]
        }
    
    def generate_plan(self, child_info: ChildInfo, test_results: List[TestResult], 
                      plan_type: str = 'weekly') -> TrainingPlan:
        """生成训练计划"""
        try:
            # 分析测试结果，确定重点改善领域
            focus_areas = self._analyze_test_results(test_results, child_info)
            
            # 确定计划时长
            duration_days = 7 if plan_type == 'weekly' else 30
            
            # 生成每日任务
            daily_tasks = self._generate_daily_tasks(
                child_info, test_results, focus_areas, duration_days
            )
            
            # 生成训练目标
            goals = self._generate_goals(focus_areas, test_results, child_info)
            
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
                             focus_areas: List[str], duration_days: int) -> List[DailyTask]:
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
                focus_areas, day, activities
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
                                  activities: List[Dict]) -> str:
        """生成家长指导"""
        guidance_parts = []
        
        guidance_parts.append(f"第{day}天训练指导：")
        guidance_parts.append("")
        
        if 'attention' in focus_areas:
            guidance_parts.append("注意力训练重点：")
            guidance_parts.append("- 确保环境安静，减少干扰")
            guidance_parts.append("- 鼓励孩子完成每个活动")
            guidance_parts.append("- 给予积极反馈和鼓励")
            guidance_parts.append("")
        
        guidance_parts.append("今日活动：")
        for i, activity in enumerate(activities, 1):
            guidance_parts.append(f"{i}. {activity['name']}（{activity['duration']}分钟）")
            guidance_parts.append(f"   说明：{activity['description']}")
            
            # 如果是可在网站内进行的游戏，添加提示
            if activity.get('can_play_online', False):
                guidance_parts.append(f"   📱 可在网站上直接进行此游戏 · Can play directly on the website")
            
            # 添加详细操作步骤
            if activity.get('detailed_instructions'):
                guidance_parts.append(f"   详细步骤：")
                steps = activity['detailed_instructions'].split('\n')
                for step in steps:
                    if step.strip():
                        guidance_parts.append(f"   {step}")
        
        guidance_parts.append("")
        guidance_parts.append("注意事项：")
        guidance_parts.append("- 根据孩子实际情况调整活动时间")
        guidance_parts.append("- 如孩子感到疲劳，可适当休息")
        guidance_parts.append("- 记录孩子的表现，便于后续分析")
        guidance_parts.append("- 对于可在网站进行的游戏，点击活动卡片上的'开始游戏'按钮")
        
        return "\n".join(guidance_parts)
    
    def _generate_goals(self, focus_areas: List[str], test_results: List[TestResult], 
                       child_info: ChildInfo) -> List[str]:
        """根据测试结果、年龄和问题动态生成训练目标"""
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
            attention_duration = "5-10分钟"
            task_duration = "简短任务"
        elif age <= 5:
            attention_duration = "10-15分钟"
            task_duration = "简单任务"
        elif age <= 7:
            attention_duration = "15-20分钟"
            task_duration = "中等任务"
        else:
            attention_duration = "20-30分钟"
            task_duration = "复杂任务"
        
        # 生成个性化目标
        if 'attention' in focus_areas:
            if needs_intervention:
                # 干预计划
                if attention_scores:
                    avg_att = sum(attention_scores) / len(attention_scores)
                    if avg_att < 50:
                        goals.append(f"提高注意力集中度，能够在安静环境下专注完成{attention_duration}的{task_duration}")
                        goals.append("减少分心次数，提高注意力持久性，建立基本专注习惯")
                    elif avg_att < 70:
                        goals.append(f"改善注意力持久性，能够连续专注{attention_duration}而不分心")
                        goals.append("提高任务切换能力，减少注意力分散")
                else:
                    goals.append(f"建立基本注意力习惯，能够在指导下完成{attention_duration}的专注活动")
                    goals.append("减少多动行为，提高静坐和专注能力")
            else:
                # 增强计划
                goals.append(f"进一步提升注意力水平，延长专注时间至{attention_duration}以上")
                goals.append("提高复杂任务下的注意力分配能力")
        
        if 'cognitive' in focus_areas:
            if needs_intervention:
                if cognitive_scores:
                    avg_cog = sum(cognitive_scores) / len(cognitive_scores)
                    if avg_cog < 50:
                        goals.append("建立基本认知能力，提高信息处理和理解能力")
                        goals.append("改善记忆能力，能够记住简单信息并回忆")
                    elif avg_cog < 70:
                        goals.append("增强认知处理速度，提高信息加工效率")
                        goals.append("改善工作记忆能力，能够同时处理多个信息")
                else:
                    goals.append("提高基础认知能力，增强对事物的理解和分析能力")
            else:
                goals.append("进一步提升认知处理能力，提高复杂信息处理速度")
                goals.append("增强高级认知功能，如推理、判断和问题解决")
        
        if 'social' in focus_areas:
            if needs_intervention:
                goals.append("改善社交互动能力，学会基本沟通技巧")
                goals.append("增强情绪调节能力，减少情绪波动")
                if '情绪波动大' in (child_info.main_problems or []):
                    goals.append("建立情绪管理策略，学会识别和表达情绪")
                if '社交困难' in (child_info.main_problems or []):
                    goals.append("提高社交技能，学会与他人互动和合作")
            else:
                goals.append("进一步提升社交能力，增强领导力和团队合作")
        
        if 'motor' in focus_areas:
            if needs_intervention:
                goals.append("改善运动协调能力，提高精细动作技能")
                goals.append("增强身体协调性，提高平衡和控制能力")
            else:
                goals.append("进一步提升运动技能，增强身体灵活性和协调性")
        
        # 根据具体问题添加目标
        if child_info.main_problems:
            if '学习困难' in child_info.main_problems:
                goals.append("改善学习方法和策略，提高学习效率")
            if '语言发育迟缓' in child_info.main_problems:
                goals.append("促进语言发展，提高词汇量和表达能力")
            if '行为问题' in child_info.main_problems:
                goals.append("改善行为表现，建立良好行为习惯")
        
        if not goals:
            goals = [
                "提升整体认知能力",
                "改善学习表现",
                "增强自信心"
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

