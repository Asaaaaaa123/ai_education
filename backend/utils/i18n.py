"""
Internationalization (i18n) support for backend API
Provides translation functions for API responses and messages
"""

from typing import Dict, Optional
from fastapi import Request

# Translation dictionaries
TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "en": {
        # API Messages
        "api.message": "SpecialCare Connect API",
        "api.version": "1.0.0",
        "api.health": "healthy",
        
        # Success Messages
        "success.child_added": "Child added successfully",
        "success.child_created": "Child information created successfully",
        "success.test_result_added": "Test result added successfully",
        "success.test_result_submitted": "Test result submitted successfully",
        "success.plan_created": "Training plan created successfully",
        "success.plan_generated": "Training plan generated successfully",
        "success.task_updated": "Task updated successfully",
        "success.user_data_retrieved": "User data retrieved successfully",
        "success.assessment_completed": "Assessment analysis completed",
        "success.model_training_started": "Model training started, please check status later",
        
        # Error Messages
        "error.child_not_found": "Child not found",
        "error.child_access_denied": "Child information does not exist or access denied",
        "error.plan_not_found": "Plan not found",
        "error.plan_access_denied": "Plan does not exist or access denied",
        "error.task_not_found": "Task not found",
        "error.no_active_plan": "No active plan or no task for today",
        "error.assessment_failed": "Assessment analysis failed",
        "error.history_retrieval_failed": "Failed to retrieve history records",
        "error.training_failed": "Failed to start training",
        "error.create_child_failed": "Failed to create child",
        "error.get_children_failed": "Failed to get children",
        "error.get_child_failed": "Failed to get child",
        "error.create_test_result_failed": "Failed to create test result",
        "error.get_test_results_failed": "Failed to get test results",
        "error.create_plan_failed": "Failed to create plan",
        "error.get_plans_failed": "Failed to get plans",
        "error.get_plan_failed": "Failed to get plan",
        "error.update_task_failed": "Failed to update task",
        "error.get_current_task_failed": "Failed to get current task",
        "error.get_progress_failed": "Failed to get progress",
        "error.get_user_data_failed": "Failed to get user data",
        "error.insufficient_data": "Insufficient data",
        
        # Activity Types and Names
        "activity.online_game": "Online Game",
        "activity.mindfulness": "Mindfulness Practice",
        "activity.offline": "Offline Activity",
        "activity.role_play": "Role Play Game",
        "activity.conversation": "Conversation Practice",
        "activity.exercise": "Physical Exercise",
        "activity.fine_motor": "Fine Motor Training",
        
        # Activity Names
        "activity.name.schulte_advanced": "Schulte Grid Advanced Training",
        "activity.name.mindfulness_breathing": "Mindfulness Breathing Practice",
        "activity.name.attention_tracking": "Attention Tracking Game",
        "activity.name.focused_reading": "Focused Reading Practice",
        "activity.name.simple_attention": "Simple Attention Game",
        "activity.name.focused_task": "Focused Task Practice",
        "activity.name.guided_attention": "Guided Attention Game",
        "activity.name.color_match": "Color Matching Game",
        "activity.name.sound_play": "Sound Recognition Game",
        "activity.name.parent_guided_focus": "Parent-Guided Focus Practice",
        "activity.name.online_puzzle": "Online Puzzle Game",
        "activity.name.memory_cards": "Memory Card Game",
        "activity.name.logic_thinking": "Logic Thinking Practice",
        "activity.name.role_play": "Role Play Game",
        "activity.name.conversation": "Conversation Practice",
        "activity.name.exercise": "Physical Exercise",
        "activity.name.fine_motor": "Fine Motor Training",
        
        # Activity Descriptions
        "activity.desc.schulte_advanced": "Schulte Grid advanced training (6×6 grid), click numbers 1-36 in order on the website to train attention and visual search abilities",
        "activity.desc.mindfulness_breathing": "Practice mindfulness meditation to improve focus and emotional regulation",
        "activity.desc.attention_tracking": "Attention training game on the website, improve attention through color matching and shape recognition",
        "activity.desc.focused_reading": "Read designated picture books or stories, requiring the child to sit quietly and focus on reading content, parents can ask questions to check comprehension",
        "activity.desc.simple_attention": "Basic attention training game on the website, suitable for children who need to improve attention",
        "activity.desc.focused_task": "Complete simple tasks that require focus, such as coloring, building blocks, etc., with parents observing and encouraging",
        "activity.desc.guided_attention": "Simple guided attention game on the website, parents can assist in completion",
        "activity.desc.color_match": "Simple color matching game on the website, suitable for young children",
        "activity.desc.sound_play": "Sound recognition game on the website, listen to sounds and select corresponding animals",
        "activity.desc.parent_guided_focus": "Brief focus practice under parent guidance, cultivate basic attention habits",
        "activity.desc.online_puzzle": "Puzzle game on the website, choose puzzles with different piece counts based on difficulty, improve spatial thinking and problem-solving abilities",
        "activity.desc.memory_cards": "Memory card matching game on the website, exercise short-term memory and working memory",
        "activity.desc.logic_thinking": "Complete logic thinking problems, from simple to complex sequences, classification, reasoning, etc.",
        "activity.desc.role_play": "Role play with family members, simulate daily social scenarios, practice conversation and interaction",
        "activity.desc.conversation": "Practice daily conversation, parent and child engage in themed dialogue to improve language expression and communication skills",
        "activity.desc.exercise": "Engage in appropriate exercise such as running, jumping, ball throwing, etc., to improve body coordination and gross motor development",
        "activity.desc.fine_motor": "Practice fine motor skills such as beading, paper folding, using chopsticks, etc., to improve hand-eye coordination",
        
        # Activity Instructions
        "activity.instruction.schulte_advanced": "Steps: 1. Click 'Start Game' button 2. Quickly click numbers 1-36 in order 3. Try to complete within 30 seconds 4. View results and progress after completion",
        "activity.instruction.mindfulness_breathing": "Steps: 1. Find a quiet place to sit 2. Close eyes, take deep breaths 3. Focus on breathing sensation 4. Gently bring attention back when mind wanders 5. Continue for 10 minutes",
        "activity.instruction.attention_tracking": "Steps: 1. Game will show a series of colors or shapes 2. Remember the order of appearance 3. Click corresponding colors/shapes in order 4. Difficulty will gradually increase",
        "activity.instruction.focused_reading": "Steps: 1. Choose age-appropriate books 2. Set 15-minute reading time 3. Ensure quiet, distraction-free environment 4. Ask 2-3 questions after reading 5. Record how long child can focus",
        "activity.instruction.simple_attention": "Steps: 1. Click 'Start Game' 2. Complete simple matching tasks as prompted 3. Complete 3 rounds of games 4. Record completion time for each round",
        "activity.instruction.focused_task": "Steps: 1. Prepare simple coloring books or building blocks 2. Set 10-minute task time 3. Require child to complete task quietly 4. Check every 2 minutes, give positive feedback 5. Record how long child can maintain focus",
        "activity.instruction.guided_attention": "Steps: 1. Parent accompanies child 2. Click 'Start Game' 3. Parent guides child to find correct answer 4. Give encouragement after each step 5. Gradually let child complete independently",
        "activity.instruction.color_match": "Steps: 1. Click 'Start Game' 2. Click blocks matching target color 3. Give encouragement after each match 4. Complete 5 matches 5. Record completion time",
        "activity.instruction.sound_play": "Steps: 1. Click 'Start Game' 2. Listen to played sounds 3. Click corresponding animal 4. Complete 5 identifications 5. Record accuracy rate",
        "activity.instruction.parent_guided_focus": "Steps: 1. Choose items child is interested in (toys, pictures, etc.) 2. Parent guides child to observe item for 3 minutes 3. Ask child what they saw 4. Give praise and encouragement 5. Record child's reaction",
        "activity.instruction.online_puzzle": "Steps: 1. Choose appropriate puzzle difficulty (suggest starting with 9 pieces) 2. Observe complete picture 3. Drag puzzle pieces to correct position 4. Challenge higher difficulty after completion 5. Record completion time",
        "activity.instruction.memory_cards": "Steps: 1. Click cards to flip and view patterns 2. Remember card positions and patterns 3. Find matching card pairs 4. Complete all pairs 5. Challenge harder levels",
        "activity.instruction.logic_thinking": "Steps: 1. Prepare age-appropriate logic problems 2. Complete 2-3 problems daily 3. Parent guides thinking process 4. Encourage child to explain reasoning 5. Record accuracy and thinking time",
        "activity.instruction.role_play": "Steps: 1. Choose a daily scenario (shopping, visiting, etc.) 2. Assign roles 3. Perform role play 4. Practice polite language and social skills 5. Discuss performance after completion",
        "activity.instruction.conversation": "Steps: 1. Choose a topic (what did today, favorite toys, etc.) 2. Parent guides conversation 3. Encourage complete expression 4. Practice taking turns speaking 5. Record conversation duration",
        "activity.instruction.exercise": "Steps: 1. Choose a safe activity area 2. Warm-up for 2 minutes 3. Main exercise for 15 minutes 4. Cool-down for 3 minutes 5. Record child's participation and performance",
        "activity.instruction.fine_motor": "Steps: 1. Prepare appropriate fine motor materials 2. Demonstrate correct operation 3. Let child practice 4. Encourage completion 5. Record completion quality and time",
        
        # Performance Levels
        "performance.excellent": "Excellent",
        "performance.good": "Good",
        "performance.average": "Average",
        "performance.needs_improvement": "Needs Improvement",
        
        # Improvement Trends
        "trend.insufficient_data": "Insufficient data",
        "trend.significant_improvement": "Significant improvement",
        "trend.steady_improvement": "Steady improvement",
        "trend.slight_improvement": "Slight improvement",
        "trend.needs_attention": "Needs attention",
        "trend.stable": "Stable",
        
        # Focus Areas
        "focus.attention": "Attention",
        "focus.cognitive": "Cognitive Ability",
        "focus.social": "Social Skills",
        "focus.motor": "Motor Skills",
        
        # Plan Types
        "plan.weekly": "Weekly Plan",
        "plan.monthly": "Monthly Plan",
        
        # Plan Status
        "status.active": "Active",
        "status.completed": "Completed",
        "status.paused": "Paused",
        
        # Assessment
        "assessment.performance_summary": "Interactive game performance is good",
        "assessment.skill_insights": "Shows good cognitive and attention abilities",
        
        # Training Goals
        "goal.attention.improve_focus": "Improve attention focus, able to complete {duration} of {task_type} tasks in a quiet environment",
        "goal.attention.reduce_distraction": "Reduce distractions, improve attention persistence, establish basic focus habits",
        "goal.attention.improve_persistence": "Improve attention persistence, able to focus continuously for {duration} without distraction",
        "goal.attention.improve_switching": "Improve task switching ability, reduce attention dispersion",
        "goal.attention.establish_basic": "Establish basic attention habits, able to complete {duration} focus activities under guidance",
        "goal.attention.reduce_hyperactivity": "Reduce hyperactive behavior, improve sitting still and focus ability",
        "goal.attention.enhance_level": "Further improve attention level, extend focus time to {duration} or more",
        "goal.attention.complex_tasks": "Improve attention allocation ability in complex tasks",
        
        "goal.cognitive.establish_basic": "Establish basic cognitive abilities, improve information processing and understanding",
        "goal.cognitive.improve_memory": "Improve memory ability, able to remember and recall simple information",
        "goal.cognitive.enhance_speed": "Enhance cognitive processing speed, improve information processing efficiency",
        "goal.cognitive.working_memory": "Improve working memory ability, able to process multiple pieces of information simultaneously",
        "goal.cognitive.improve_basic": "Improve basic cognitive abilities, enhance understanding and analysis of things",
        "goal.cognitive.enhance_processing": "Further improve cognitive processing ability, increase complex information processing speed",
        "goal.cognitive.advanced_functions": "Enhance advanced cognitive functions such as reasoning, judgment, and problem-solving",
        
        "goal.social.improve_interaction": "Improve social interaction ability, learn basic communication skills",
        "goal.social.emotion_regulation": "Enhance emotion regulation ability, reduce emotional fluctuations",
        "goal.social.emotion_management": "Establish emotion management strategies, learn to identify and express emotions",
        "goal.social.improve_skills": "Improve social skills, learn to interact and cooperate with others",
        "goal.social.enhance_leadership": "Further improve social ability, enhance leadership and teamwork",
        
        "goal.motor.improve_coordination": "Improve motor coordination ability, enhance fine motor skills",
        "goal.motor.body_coordination": "Enhance body coordination, improve balance and control ability",
        "goal.motor.enhance_skills": "Further improve motor skills, enhance body flexibility and coordination",
        
        "goal.learning.improve_methods": "Improve learning methods and strategies, increase learning efficiency",
        "goal.language.promote_development": "Promote language development, improve vocabulary and expression ability",
        "goal.behavior.improve_performance": "Improve behavioral performance, establish good behavioral habits",
        
        "goal.general.overall_cognitive": "Improve overall cognitive ability",
        "goal.general.learning_performance": "Improve learning performance",
        "goal.general.self_confidence": "Enhance self-confidence",
        
        # Parent Guidance
        "guidance.day_title": "Day {day} Training Guidance:",
        "guidance.attention_focus": "Attention Training Focus:",
        "guidance.quiet_environment": "Ensure a quiet environment, reduce distractions",
        "guidance.encourage_completion": "Encourage child to complete each activity",
        "guidance.positive_feedback": "Provide positive feedback and encouragement",
        "guidance.today_activities": "Today's Activities:",
        "guidance.description": "Description:",
        "guidance.can_play_online": "📱 Can play directly on the website",
        "guidance.detailed_steps": "Detailed Steps:",
        "guidance.notes": "Notes:",
        "guidance.adjust_time": "Adjust activity time according to child's actual situation",
        "guidance.take_breaks": "If child feels tired, take appropriate breaks",
        "guidance.record_performance": "Record child's performance for subsequent analysis",
        "guidance.online_game_hint": "For games that can be played on the website, click the 'Start Game' button on the activity card",
        
        # Duration labels
        "duration.short_task": "short tasks",
        "duration.simple_task": "simple tasks",
        "duration.medium_task": "medium tasks",
        "duration.complex_task": "complex tasks",
    },
    "zh": {
        # API Messages
        "api.message": "SpecialCare Connect API",
        "api.version": "1.0.0",
        "api.health": "健康",
        
        # Success Messages
        "success.child_added": "孩子信息添加成功",
        "success.child_created": "孩子信息创建成功",
        "success.test_result_added": "测试结果添加成功",
        "success.test_result_submitted": "测试结果提交成功",
        "success.plan_created": "训练计划创建成功",
        "success.plan_generated": "训练计划生成成功",
        "success.task_updated": "任务更新成功",
        "success.user_data_retrieved": "用户数据获取成功",
        "success.assessment_completed": "评估分析完成",
        "success.model_training_started": "模型训练已开始，请稍后查看状态",
        
        # Error Messages
        "error.child_not_found": "孩子信息不存在",
        "error.child_access_denied": "孩子信息不存在或无权限访问",
        "error.plan_not_found": "计划不存在",
        "error.plan_access_denied": "计划不存在或无权限访问",
        "error.task_not_found": "任务不存在",
        "error.no_active_plan": "没有活动计划或今天没有任务",
        "error.assessment_failed": "评估分析失败",
        "error.history_retrieval_failed": "获取历史记录失败",
        "error.training_failed": "启动训练失败",
        "error.create_child_failed": "创建孩子信息失败",
        "error.get_children_failed": "获取孩子列表失败",
        "error.get_child_failed": "获取孩子信息失败",
        "error.create_test_result_failed": "创建测试结果失败",
        "error.get_test_results_failed": "获取测试结果失败",
        "error.create_plan_failed": "创建计划失败",
        "error.get_plans_failed": "获取计划列表失败",
        "error.get_plan_failed": "获取计划失败",
        "error.update_task_failed": "更新任务失败",
        "error.get_current_task_failed": "获取当前任务失败",
        "error.get_progress_failed": "获取进度失败",
        "error.get_user_data_failed": "获取用户数据失败",
        "error.insufficient_data": "数据不足",
        
        # Activity Types and Names
        "activity.online_game": "在线游戏",
        "activity.mindfulness": "正念练习",
        "activity.offline": "线下活动",
        "activity.role_play": "角色扮演游戏",
        "activity.conversation": "对话练习",
        "activity.exercise": "运动锻炼",
        "activity.fine_motor": "精细动作训练",
        
        # Activity Names
        "activity.name.schulte_advanced": "舒尔特方格高级训练",
        "activity.name.mindfulness_breathing": "正念呼吸练习",
        "activity.name.attention_tracking": "注意力追踪游戏",
        "activity.name.focused_reading": "专注阅读练习",
        "activity.name.simple_attention": "简单注意力游戏",
        "activity.name.focused_task": "专注任务练习",
        "activity.name.guided_attention": "引导式注意力游戏",
        "activity.name.color_match": "颜色匹配游戏",
        "activity.name.sound_play": "声音识别游戏",
        "activity.name.parent_guided_focus": "家长引导专注练习",
        "activity.name.online_puzzle": "在线拼图游戏",
        "activity.name.memory_cards": "记忆卡片游戏",
        "activity.name.logic_thinking": "逻辑思维练习",
        "activity.name.role_play": "角色扮演游戏",
        "activity.name.conversation": "对话练习",
        "activity.name.exercise": "运动锻炼",
        "activity.name.fine_motor": "精细动作训练",
        
        # Activity Descriptions
        "activity.desc.schulte_advanced": "在网站上进行舒尔特方格游戏（6×6网格），按顺序点击数字1-36，训练注意力和视觉搜索能力",
        "activity.desc.mindfulness_breathing": "进行正念冥想，提高专注力和情绪调节能力",
        "activity.desc.attention_tracking": "在网站上进行注意力训练游戏，通过颜色匹配和形状识别来提升注意力",
        "activity.desc.focused_reading": "阅读指定的绘本或故事，要求孩子安静地坐着，专注于阅读内容，家长可以提问检查理解程度",
        "activity.desc.simple_attention": "在网站上进行基础注意力训练游戏，适合注意力需要提升的孩子",
        "activity.desc.focused_task": "完成需要专注的简单任务，如涂色、拼积木等，家长在一旁观察并给予鼓励",
        "activity.desc.guided_attention": "在网站上进行简单的引导式注意力游戏，家长可以协助完成",
        "activity.desc.color_match": "在网站上进行简单的颜色匹配游戏，适合低龄儿童",
        "activity.desc.sound_play": "在网站上进行声音识别游戏，听声音选择对应的动物",
        "activity.desc.parent_guided_focus": "在家长引导下进行简短的专注练习，培养基本的注意力习惯",
        "activity.desc.online_puzzle": "在网站上进行拼图游戏，根据难度选择不同片数的拼图，提高空间思维和问题解决能力",
        "activity.desc.memory_cards": "在网站上进行记忆卡片匹配游戏，锻炼短时记忆和工作记忆",
        "activity.desc.logic_thinking": "完成逻辑思维题目，可以是从简单到复杂的序列、分类、推理等题目",
        "activity.desc.role_play": "与家人进行角色扮演游戏，模拟日常社交场景，练习对话和互动",
        "activity.desc.conversation": "练习日常对话，家长与孩子进行主题对话，提高语言表达和沟通能力",
        "activity.desc.exercise": "进行适当运动，如跑步、跳跃、投球等，提高身体协调性和大肌肉群发展",
        "activity.desc.fine_motor": "练习精细动作，如穿珠子、折纸、用筷子等，提高手眼协调能力",
        
        # Activity Instructions
        "activity.instruction.schulte_advanced": "操作步骤：1. 点击\"开始游戏\"按钮 2. 按照1-36的顺序快速点击数字 3. 尽量在30秒内完成 4. 完成后查看成绩和进步情况",
        "activity.instruction.mindfulness_breathing": "操作步骤：1. 找个安静的地方坐下 2. 闭上眼睛，深呼吸 3. 专注于呼吸的感觉 4. 当思绪飘走时，温柔地拉回注意力 5. 持续10分钟",
        "activity.instruction.attention_tracking": "操作步骤：1. 游戏会显示一系列颜色或形状 2. 记住出现的顺序 3. 按照顺序点击对应的颜色/形状 4. 难度会逐渐增加",
        "activity.instruction.focused_reading": "操作步骤：1. 选择适合孩子年龄的书籍 2. 设定15分钟阅读时间 3. 确保环境安静无干扰 4. 阅读后提问2-3个问题 5. 记录孩子能专注的时间",
        "activity.instruction.simple_attention": "操作步骤：1. 点击\"开始游戏\" 2. 按照提示完成简单的匹配任务 3. 完成3轮游戏 4. 记录每次的完成时间",
        "activity.instruction.focused_task": "操作步骤：1. 准备简单的涂色本或积木 2. 设定10分钟任务时间 3. 要求孩子安静地完成任务 4. 每2分钟检查一次，给予积极反馈 5. 记录孩子能持续专注的时间",
        "activity.instruction.guided_attention": "操作步骤：1. 家长陪同孩子一起进行 2. 点击\"开始游戏\" 3. 家长引导孩子找到正确的答案 4. 每完成一步给予鼓励 5. 逐步让孩子独立完成",
        "activity.instruction.color_match": "操作步骤：1. 点击\"开始游戏\" 2. 点击与目标颜色相同的方块 3. 每完成一个给予鼓励 4. 完成5个匹配 5. 记录完成时间",
        "activity.instruction.sound_play": "操作步骤：1. 点击\"开始游戏\" 2. 听播放的声音 3. 点击对应的动物 4. 完成5个识别 5. 记录正确率",
        "activity.instruction.parent_guided_focus": "操作步骤：1. 选择孩子感兴趣的物品（如玩具、图片） 2. 家长引导孩子观察物品3分钟 3. 询问孩子看到了什么 4. 给予表扬和鼓励 5. 记录孩子的反应",
        "activity.instruction.online_puzzle": "操作步骤：1. 选择适合的拼图难度（建议从9片开始）2. 观察完整图片 3. 拖动拼图片到正确位置 4. 完成后可以挑战更高难度 5. 记录完成时间",
        "activity.instruction.memory_cards": "操作步骤：1. 点击卡片翻转查看图案 2. 记住卡片位置和图案 3. 找到匹配的卡片对 4. 完成所有配对 5. 挑战更难的关卡",
        "activity.instruction.logic_thinking": "操作步骤：1. 准备适合年龄的逻辑题目 2. 每天完成2-3题 3. 家长引导思考过程 4. 鼓励孩子说出推理思路 5. 记录正确率和思考时间",
        "activity.instruction.role_play": "操作步骤：1. 选择一个日常场景（如购物、做客等）2. 分配角色 3. 进行角色扮演 4. 练习礼貌用语和社交技能 5. 结束后讨论表现",
        "activity.instruction.conversation": "操作步骤：1. 选择一个话题（如今天做了什么、喜欢的玩具等）2. 家长引导对话 3. 鼓励孩子完整表达 4. 练习轮流说话 5. 记录对话时长",
        "activity.instruction.exercise": "操作步骤：1. 选择安全的活动场所 2. 进行热身活动2分钟 3. 主要运动15分钟 4. 放松活动3分钟 5. 记录孩子参与度和表现",
        "activity.instruction.fine_motor": "操作步骤：1. 准备适合的精细动作材料 2. 示范正确的操作方法 3. 让孩子练习 4. 鼓励坚持完成 5. 记录完成质量和时间",
        
        # Performance Levels
        "performance.excellent": "优秀",
        "performance.good": "良好",
        "performance.average": "一般",
        "performance.needs_improvement": "需要改进",
        
        # Improvement Trends
        "trend.insufficient_data": "数据不足",
        "trend.significant_improvement": "显著改善",
        "trend.steady_improvement": "稳步改善",
        "trend.slight_improvement": "轻微改善",
        "trend.needs_attention": "需要关注",
        "trend.stable": "保持稳定",
        
        # Focus Areas
        "focus.attention": "注意力",
        "focus.cognitive": "认知能力",
        "focus.social": "社交能力",
        "focus.motor": "运动能力",
        
        # Plan Types
        "plan.weekly": "一周计划",
        "plan.monthly": "一个月计划",
        
        # Plan Status
        "status.active": "进行中",
        "status.completed": "已完成",
        "status.paused": "已暂停",
        
        # Assessment
        "assessment.performance_summary": "互动游戏表现良好",
        "assessment.skill_insights": "展现了良好的认知和注意力能力",
        
        # Training Goals
        "goal.attention.improve_focus": "提高注意力集中度，能够在安静环境下专注完成{duration}的{task_type}",
        "goal.attention.reduce_distraction": "减少分心次数，提高注意力持久性，建立基本专注习惯",
        "goal.attention.improve_persistence": "改善注意力持久性，能够连续专注{duration}而不分心",
        "goal.attention.improve_switching": "提高任务切换能力，减少注意力分散",
        "goal.attention.establish_basic": "建立基本注意力习惯，能够在指导下完成{duration}的专注活动",
        "goal.attention.reduce_hyperactivity": "减少多动行为，提高静坐和专注能力",
        "goal.attention.enhance_level": "进一步提升注意力水平，延长专注时间至{duration}以上",
        "goal.attention.complex_tasks": "提高复杂任务下的注意力分配能力",
        
        "goal.cognitive.establish_basic": "建立基本认知能力，提高信息处理和理解能力",
        "goal.cognitive.improve_memory": "改善记忆能力，能够记住简单信息并回忆",
        "goal.cognitive.enhance_speed": "增强认知处理速度，提高信息加工效率",
        "goal.cognitive.working_memory": "改善工作记忆能力，能够同时处理多个信息",
        "goal.cognitive.improve_basic": "提高基础认知能力，增强对事物的理解和分析能力",
        "goal.cognitive.enhance_processing": "进一步提升认知处理能力，提高复杂信息处理速度",
        "goal.cognitive.advanced_functions": "增强高级认知功能，如推理、判断和问题解决",
        
        "goal.social.improve_interaction": "改善社交互动能力，学会基本沟通技巧",
        "goal.social.emotion_regulation": "增强情绪调节能力，减少情绪波动",
        "goal.social.emotion_management": "建立情绪管理策略，学会识别和表达情绪",
        "goal.social.improve_skills": "提高社交技能，学会与他人互动和合作",
        "goal.social.enhance_leadership": "进一步提升社交能力，增强领导力和团队合作",
        
        "goal.motor.improve_coordination": "改善运动协调能力，提高精细动作技能",
        "goal.motor.body_coordination": "增强身体协调性，提高平衡和控制能力",
        "goal.motor.enhance_skills": "进一步提升运动技能，增强身体灵活性和协调性",
        
        "goal.learning.improve_methods": "改善学习方法和策略，提高学习效率",
        "goal.language.promote_development": "促进语言发展，提高词汇量和表达能力",
        "goal.behavior.improve_performance": "改善行为表现，建立良好行为习惯",
        
        "goal.general.overall_cognitive": "提升整体认知能力",
        "goal.general.learning_performance": "改善学习表现",
        "goal.general.self_confidence": "增强自信心",
        
        # Parent Guidance
        "guidance.day_title": "第{day}天训练指导：",
        "guidance.attention_focus": "注意力训练重点：",
        "guidance.quiet_environment": "确保环境安静，减少干扰",
        "guidance.encourage_completion": "鼓励孩子完成每个活动",
        "guidance.positive_feedback": "给予积极反馈和鼓励",
        "guidance.today_activities": "今日活动：",
        "guidance.description": "说明：",
        "guidance.can_play_online": "📱 可在网站上直接进行此游戏",
        "guidance.detailed_steps": "详细步骤：",
        "guidance.notes": "注意事项：",
        "guidance.adjust_time": "根据孩子实际情况调整活动时间",
        "guidance.take_breaks": "如孩子感到疲劳，可适当休息",
        "guidance.record_performance": "记录孩子的表现，便于后续分析",
        "guidance.online_game_hint": "对于可在网站进行的游戏，点击活动卡片上的'开始游戏'按钮",
        
        # Duration labels
        "duration.short_task": "简短任务",
        "duration.simple_task": "简单任务",
        "duration.medium_task": "中等任务",
        "duration.complex_task": "复杂任务",
    }
}

# Default language
DEFAULT_LANGUAGE = "en"

# Supported languages
SUPPORTED_LANGUAGES = ["en", "zh"]


def get_language_from_request(request: Optional[Request] = None) -> str:
    """
    Get language preference from request headers or default to 'en'
    
    Args:
        request: FastAPI Request object (optional)
        
    Returns:
        Language code ('en' or 'zh')
    """
    if request is None:
        return DEFAULT_LANGUAGE
    
    # Check custom header FIRST (most explicit, set by frontend)
    # FastAPI headers are case-insensitive, but try both cases
    custom_lang = request.headers.get("X-Language", "") or request.headers.get("x-language", "")
    if custom_lang and custom_lang.lower() in SUPPORTED_LANGUAGES:
        return custom_lang.lower()
    
    # Check Accept-Language header as fallback
    accept_language = request.headers.get("Accept-Language", "")
    
    # Parse Accept-Language header (e.g., "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7")
    if accept_language:
        # Extract language codes
        languages = []
        for lang_part in accept_language.split(","):
            lang_code = lang_part.split(";")[0].strip().lower()
            # Extract base language (e.g., 'zh' from 'zh-cn')
            base_lang = lang_code.split("-")[0]
            if base_lang in SUPPORTED_LANGUAGES:
                languages.append(base_lang)
        
        if languages:
            return languages[0]
    
    return DEFAULT_LANGUAGE


def t(key: str, language: Optional[str] = None, request: Optional[Request] = None, **kwargs) -> str:
    """
    Translate a key to the appropriate language
    
    Args:
        key: Translation key (e.g., "success.child_added")
        language: Language code ('en' or 'zh'). If None, will try to get from request
        request: FastAPI Request object (optional, used if language is None)
        **kwargs: Format arguments for string formatting
        
    Returns:
        Translated string, or the key if translation not found
    """
    # Determine language
    if language is None:
        language = get_language_from_request(request)
    
    # Ensure language is supported
    if language not in SUPPORTED_LANGUAGES:
        language = DEFAULT_LANGUAGE
    
    # Get translation
    translation = TRANSLATIONS.get(language, {}).get(key, key)
    
    # Format if kwargs provided
    if kwargs:
        try:
            translation = translation.format(**kwargs)
        except (KeyError, ValueError):
            # If formatting fails, return translation as-is
            pass
    
    return translation


def get_translations(language: Optional[str] = None, request: Optional[Request] = None) -> Dict[str, str]:
    """
    Get all translations for a language
    
    Args:
        language: Language code ('en' or 'zh'). If None, will try to get from request
        request: FastAPI Request object (optional, used if language is None)
        
    Returns:
        Dictionary of all translations for the language
    """
    # Determine language
    if language is None:
        language = get_language_from_request(request)
    
    # Ensure language is supported
    if language not in SUPPORTED_LANGUAGES:
        language = DEFAULT_LANGUAGE
    
    return TRANSLATIONS.get(language, {})


# Convenience function for dependency injection
def get_t_function(request: Request):
    """
    Create a translation function bound to a request
    Useful for dependency injection in FastAPI routes
    
    Usage:
        @app.get("/example")
        async def example(t = Depends(get_t_function)):
            return {"message": t("success.child_added")}
    """
    def translate(key: str, **kwargs) -> str:
        return t(key, request=request, **kwargs)
    
    return translate

