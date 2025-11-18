import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation data
const translations = {
  en: {
    // Navigation
    home: 'Home',
    ai: 'AI',
    services: 'Services',
    team: 'Team',
    resources: 'Resources',
    support: 'Support',
    contact: 'Contact',
    login: 'Login',
    logout: 'Logout',
    continueTraining: 'Continue Training',
    loginToStart: 'Login to Start',
    
    // Homepage
    heroTitle: 'Empowering Every Child\'s Journey',
    heroSubtitle: 'AI-powered personalized support for children\'s development and learning',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    
    // Training pages
    progress: 'Progress',
    trainingPlan: 'Training Plan',
    dailyTask: 'Daily Task',
    backToHome: 'Back to Home',
    logOut: 'Log Out',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    
    // Language switcher
    switchToChinese: '中文',
    switchToEnglish: 'English',
    
    // Homepage Hero
    heroTitleLine1: 'Every Child Deserves',
    heroTitleLine2: 'Joyful Support',
    heroDescription: 'MayCare brings together teachers, therapists, and parents to create an engaging and safe learning journey. We provide encouragement and positive feedback for children who need extra care, as well as normal children who want to improve their grades.',
    familiesSupported: 'Families Supported',
    learningGuides: 'Learning Guides',
    improvementSnapshots: 'Improvement Snapshots',
    positiveFeedback: 'Positive Feedback',
    startTraining: 'Start Training',
    meetOurTeam: 'Meet Our Team',
    child: 'Child',
    teacher: 'Teacher',
    therapist: 'Therapist',
    parent: 'Parent',
    learner: 'Learner',
    
    // Progress Page
    noChildAdded: 'No child information added yet',
    addChildInfo: 'Please add child information to view progress',
    addChildButton: 'Add Child Information',
    noTrainingPlan: 'No training plan yet',
    startFirstPlan: 'Start your first training plan to track your child\'s progress',
    createTrainingPlan: 'Create Training Plan',
    loadingProgress: 'Loading progress data...',
    yearsOld: 'years old',
    myActivePlans: 'My Active Plans',
    weeklyPlan: 'Weekly Plan',
    monthlyPlan: 'Monthly Plan',
    active: 'Active',
    completed: 'Completed',
    daysCompleted: 'days completed',
    viewPlan: 'View Plan',
    total: 'Total',
    latestScore: 'Latest Score',
    averageScore: 'Average',
    testSessions: 'Sessions',
    scoreTrend: 'Score Trend',
    dailyMilestones: 'Daily Milestones',
    testCompleted: 'Test Completed',
    day: 'Day',
    activities: 'activities',
    insufficientData: 'Keep going to unlock more insights. Complete 7 days to see improvement chart!',
    achievementMilestones: 'Achievement Milestones',
    startJourney: 'Start Journey',
    persist3Days: 'Persist 3 Days',
    persistWeek: 'Persist One Week',
    steadyProgress: 'Steady Progress',
    planNotFound: 'Plan ID not found',
    loadPlanFailed: 'Failed to load plan',
    planNotExist: 'Plan does not exist',
    comprehensive: 'Comprehensive',
    visitUs: 'Visit Us',
    visitAddress: 'Yunmei Baby Hub, Shenzhen',
    
    // Child Registration
    childInfoEntry: 'Child Information Entry',
    step1Label: 'Basic Information',
    step2Label: 'Condition Description',
    step1Subtitle: 'Please fill in your child\'s basic information. We will select the appropriate test based on age.',
    step2Subtitle: 'Please briefly describe your child\'s current condition and main problems to help us create a personalized training plan',
    childName: 'Child Name',
    childNamePlaceholder: 'Please enter child name',
    age: 'Age',
    agePlaceholder: 'Please enter child age',
    gender: 'Gender',
    selectGender: 'Please select',
    male: 'Male',
    female: 'Female',
    birthDate: 'Birth Date',
    parentName: 'Parent Name',
    parentNamePlaceholder: 'Please enter parent name',
    under6Info: 'Your child is under 6 years old. We will use age-appropriate testing methods (color recognition, shape matching, etc.) instead of number training.',
    over6Info: 'Your child is 6 years or older and will take the Schulte Grid attention test.',
    nextStep: 'Next: Describe Child Condition',
    mainProblems: 'Child\'s Main Problems',
    mainProblemsHint: 'Including normal children who want to improve grades',
    childCondition: 'Child Condition Description',
    conditionHint: '(Briefly describe your child\'s current condition, behavior, your observations, etc.)',
    conditionPlaceholder: 'For example: Child has difficulty concentrating, often gets distracted when reading or doing homework, likes to move around, emotions fluctuate easily...',
    submitAndStart: 'Submit: Start Test',
    
    // Training Plan Page
    overallProgress: 'Overall Progress',
    taskCompletionRate: 'Task Completion Rate',
    testCompletionRate: 'Test Completion Rate',
    improvementTrend: 'Improvement Trend',
    focusAreas: 'Focus Areas',
    attention: 'Attention',
    cognitive: 'Cognitive Ability',
    social: 'Social Skills',
    motor: 'Motor Skills',
    focusPreview: 'Training Goal Visualization',
    focusPreviewSubtitle: 'Overview of training focus and completion status for the first 7 days, helping parents know what is being trained today.',
    inProgress: 'In Progress',
    improvementSchedule: '7-Day Improvement Snapshots',
    improvementNote: 'The system automatically generates an improvement chart every 7 consecutive days completed, making progress visible.',
    chartGenerated: 'Chart Generated',
    completeToGenerate: 'Complete to Generate',
    trainingGoals: 'Training Goals',
    dailyTasks: 'Daily Tasks',
    pendingTest: 'Test Pending',
    
    // Daily Task Page
    taskNotFound: 'Task not found',
    trainingTarget: 'Training Target',
    trainingExpectation: 'Training Expectation',
    parentWish: 'Parent Wish',
    deadline: 'Deadline',
    aiCheer: 'AI Cheer',
    aiNote: 'After completing 7 days of tasks, we will automatically generate an improvement data chart to record every progress.',
    parentTime: 'Parent Time',
    parentTimeDescription: 'Record today\'s time spent with your child to help AI plan a more relaxed learning pace.',
    todayMinutes: 'Today (minutes)',
    independentTask: 'Do you want your child to complete some tasks independently (6+ years old)?',
    yesIndependent: 'Yes, can complete independently',
    noIndependent: 'No, needs parent accompaniment',
    childCompletes: 'Child completes: Mini games, matching tasks',
    parentSupport: 'Parent support: Prepare materials, give hugs after completion',
    parentCollaborate: 'Parent collaborates: Explain steps, accompany practice',
    childTries: 'Child tries: Final step completed independently by child',
    incompleteReason: 'Reason for Incomplete',
    incompleteReasonDescription: 'If the previous day\'s task was not completed, please briefly explain the reason. Our AI will generate a more considerate task for the next day.',
    incompleteReasonPlaceholder: 'For example: Child was sick and resting, went for a medical appointment, etc...',
    parentGuidance: 'Parent Guidance',
    parentGuidanceIntro: 'Please follow these steps to guide your child',
    todayActivities: 'Today\'s Activities',
    minutes: 'minutes',
    onlineGame: 'Online Game',
    markComplete: 'Mark Complete',
    detailedInstructions: 'Detailed Instructions:',
    startGame: 'Start Game',
    backToPlan: 'Back to Plan',
    todayFocus: 'Today\'s Focus',
    dailyTest: 'Daily Test',
    testDescription: 'After completing today\'s activities, please have your child complete the following test to record today\'s progress',
    startTest: 'Start Test',
    testCompletedExclamation: 'Test Completed!',
    score: 'Score',
    performanceLevel: 'Performance Level',
    excellent: 'Excellent',
    good: 'Good',
    average: 'Average',
    needsImprovement: 'Needs Improvement',
    markCompleteToday: 'Mark Today\'s Task Complete',
    dailyAIPraise: 'Daily AI Praise',
    aiPraiseNote: 'Remember to click the button above when done, we\'ll send new encouragement tomorrow! 💙',
    
    // Common problems
    attentionDeficit: 'Difficulty Concentrating',
    hyperactivity: 'Hyperactivity',
    moodSwings: 'Mood Swings',
    socialDifficulty: 'Social Difficulties',
    learningDifficulty: 'Learning Difficulties',
    languageDelay: 'Language Development Delay',
    behaviorIssues: 'Behavior Problems',
    poorCoordination: 'Poor Motor Coordination',
    poorMemory: 'Poor Memory',
    mathImprovement: 'Math Grades Need Improvement',
    chineseImprovement: 'Chinese Grades Need Improvement',
    englishImprovement: 'English Grades Need Improvement',
    lowEfficiency: 'Low Learning Efficiency',
    lackMotivation: 'Lack of Learning Motivation',
    slowHomework: 'Slow Homework Completion',
    weakUnderstanding: 'Weak Understanding Ability',
    other: 'Other',
  },
  zh: {
    // Navigation
    home: '首页',
    ai: 'AI',
    services: '服务',
    team: '团队',
    resources: '资源',
    support: '支持',
    contact: '联系我们',
    login: '登录',
    logout: '登出',
    continueTraining: '继续训练计划',
    loginToStart: '登录开始',
    
    // Homepage
    heroTitle: '助力每个孩子的成长',
    heroSubtitle: 'AI驱动的个性化支持，帮助孩子发展和学习',
    getStarted: '开始使用',
    learnMore: '了解更多',
    
    // Training pages
    progress: '进度',
    trainingPlan: '训练计划',
    dailyTask: '每日任务',
    backToHome: '返回首页',
    logOut: '登出',
    
    // Common
    loading: '加载中...',
    error: '错误',
    success: '成功',
    save: '保存',
    cancel: '取消',
    submit: '提交',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    close: '关闭',
    confirm: '确认',
    yes: '是',
    no: '否',
    
    // Language switcher
    switchToChinese: '中文',
    switchToEnglish: 'English',
    
    // Homepage Hero
    heroTitleLine1: '每个孩子都值得',
    heroTitleLine2: '快乐学习的陪伴',
    heroDescription: '云美宝宝学习站汇聚老师、治疗师与家长，共同打造既有趣又安全的双语训练旅程。无论是需要额外关怀的孩子，还是只是想提升成绩的普通孩子，我们都以积极的口吻给予鼓励与反馈。',
    familiesSupported: '家庭获益',
    learningGuides: '学习引导师',
    improvementSnapshots: '七日可视图',
    positiveFeedback: '正向反馈',
    startTraining: '开始训练',
    meetOurTeam: '认识我们的团队',
    child: '孩子',
    teacher: '老师',
    therapist: '治疗师',
    parent: '家长',
    learner: '学习者',
    
    // Progress Page
    noChildAdded: '还没有添加孩子信息',
    addChildInfo: '请先添加孩子信息以查看进度',
    addChildButton: '添加孩子信息',
    noTrainingPlan: '还没有训练计划',
    startFirstPlan: '开始第一个训练计划以追踪孩子的进步',
    createTrainingPlan: '创建训练计划',
    loadingProgress: '加载进度数据中...',
    yearsOld: '岁',
    myActivePlans: '我的训练计划',
    weeklyPlan: '一周计划',
    monthlyPlan: '一个月计划',
    active: '进行中',
    completed: '已完成',
    daysCompleted: '天完成',
    viewPlan: '查看计划',
    total: '共',
    latestScore: '最近分数',
    averageScore: '平均分数',
    testSessions: '测试次数',
    scoreTrend: '测试分数趋势',
    dailyMilestones: '每日完成情况',
    testCompleted: '测试已完成',
    day: '第',
    activities: '个活动',
    insufficientData: '数据不足，继续完成任务可获得更多分析',
    achievementMilestones: '成就里程碑',
    startJourney: '开始旅程',
    persist3Days: '坚持3天',
    persistWeek: '坚持一周',
    steadyProgress: '稳定进步',
    planNotFound: '未找到计划ID',
    loadPlanFailed: '加载计划失败',
    planNotExist: '计划不存在',
    comprehensive: '综合能力',
    visitUs: '访问我们',
    visitAddress: '云美宝宝成长中心 · 深圳',
    
    // Child Registration
    childInfoEntry: '孩子信息录入',
    step1Label: '基本信息',
    step2Label: '状况说明',
    step1Subtitle: '请填写孩子的基本信息，我们将根据年龄选择合适的测试',
    step2Subtitle: '请简单说明孩子的现状和主要问题，帮助我们制定个性化训练计划',
    childName: '孩子姓名',
    childNamePlaceholder: '请输入孩子姓名',
    age: '年龄',
    agePlaceholder: '请输入孩子年龄',
    gender: '性别',
    selectGender: '请选择',
    male: '男',
    female: '女',
    birthDate: '出生日期',
    parentName: '家长姓名',
    parentNamePlaceholder: '请输入家长姓名',
    under6Info: '您的孩子未满6岁，我们将使用适合低龄儿童的测试方式（颜色识别、形状匹配等），而不是数字训练。',
    over6Info: '您的孩子已满6岁，将进行舒尔特方格注意力测试。',
    nextStep: '下一步：说明孩子状况',
    mainProblems: '孩子当前的主要问题',
    mainProblemsHint: '包括正常孩子想提升成绩的问题',
    childCondition: '孩子状况说明',
    conditionHint: '（简单描述孩子的现状、行为表现、您的观察等）',
    conditionPlaceholder: '例如：孩子平时注意力很难集中，看书或做作业时经常分心，喜欢到处走动，情绪容易波动...',
    submitAndStart: '完成：开始测试',
    
    // Training Plan Page
    overallProgress: '总体进度',
    taskCompletionRate: '任务完成率',
    testCompletionRate: '测试完成率',
    improvementTrend: '改善趋势',
    focusAreas: '重点改善领域',
    attention: '注意力',
    cognitive: '认知能力',
    social: '社交能力',
    motor: '运动能力',
    focusPreview: '训练目标可视化',
    focusPreviewSubtitle: '前七天的训练重点与完成状态一览，帮助家长知道今天训练了哪个地方。',
    inProgress: '进行中',
    improvementSchedule: '改善数据图安排',
    improvementNote: '系统会在每连续完成七天任务后自动生成一张改善图，让正向进步更直观。',
    chartGenerated: '改善图已生成',
    completeToGenerate: '完成本阶段后生成',
    trainingGoals: '训练目标',
    dailyTasks: '每日任务',
    pendingTest: '待测试',
    
    // Daily Task Page
    taskNotFound: '任务不存在',
    trainingTarget: '训练目标',
    trainingExpectation: '训练预期',
    parentWish: '家长期盼',
    deadline: '目标期限',
    aiCheer: 'AI 鼓励',
    aiNote: '完成 7 天任务后，我们会自动生成改善数据图，记录每一次进步。',
    parentTime: '家长陪伴时长',
    parentTimeDescription: '记录今天陪伴的时间，帮助 AI 规划更轻松的学习节奏。',
    todayMinutes: '今日陪伴（分钟）',
    independentTask: '是否希望孩子独立完成部分任务（6 岁以上）?',
    yesIndependent: '可以独立完成',
    noIndependent: '需要家长陪同',
    childCompletes: '孩子自己完成：小游戏、配对任务',
    parentSupport: '家长支持：准备材料、结束后给拥抱',
    parentCollaborate: '家长协作：讲解步骤、陪同练习',
    childTries: '孩子尝试：最后一步由孩子独立完成',
    incompleteReason: '未完成原因',
    incompleteReasonDescription: '如果前一天未完成任务，请简单说明原因，我们的 AI 会生成更贴心的下一天任务。',
    incompleteReasonPlaceholder: '例如：孩子生病休息、外出就诊等……',
    parentGuidance: '家长指导',
    parentGuidanceIntro: '请按照以下步骤指导孩子完成活动',
    todayActivities: '今日活动',
    minutes: '分钟',
    onlineGame: '在线游戏',
    markComplete: '标记完成',
    detailedInstructions: '详细操作步骤：',
    startGame: '开始游戏',
    backToPlan: '返回计划',
    todayFocus: '今日强化',
    dailyTest: '每日测试',
    testDescription: '完成今日活动后，请让孩子完成以下测试，以记录今天的进步',
    startTest: '开始测试',
    testCompletedExclamation: '测试已完成！',
    score: '得分',
    performanceLevel: '表现水平',
    excellent: '优秀',
    good: '良好',
    average: '一般',
    needsImprovement: '需要改进',
    markCompleteToday: '标记今日任务完成',
    dailyAIPraise: 'AI 今日评语',
    aiPraiseNote: '完成后记得点击上方按钮，我们会在明天送上新的鼓励。💙',
    
    // Common problems
    attentionDeficit: '注意力不集中',
    hyperactivity: '多动',
    moodSwings: '情绪波动大',
    socialDifficulty: '社交困难',
    learningDifficulty: '学习困难',
    languageDelay: '语言发育迟缓',
    behaviorIssues: '行为问题',
    poorCoordination: '运动协调性差',
    poorMemory: '记忆力差',
    mathImprovement: '数学成绩需要提升',
    chineseImprovement: '语文成绩需要提升',
    englishImprovement: '英语成绩需要提升',
    lowEfficiency: '学习效率低',
    lackMotivation: '缺乏学习动力',
    slowHomework: '作业完成慢',
    weakUnderstanding: '理解能力需加强',
    other: '其他',
  }
};

// Create context
const LanguageContext = createContext();

// Language provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to 'en'
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation function for use outside components
export const getTranslation = (key, lang = null) => {
  const currentLang = lang || localStorage.getItem('language') || 'en';
  return translations[currentLang]?.[key] || key;
};

