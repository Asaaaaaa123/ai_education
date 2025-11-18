import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../utils/i18n';
import SchulteTest from './SchulteTest';
import AgeAppropriateTest from './AgeAppropriateTest';
import { api } from '../utils/apiClient';
import './DailyTaskPage.css';

const DailyTaskPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const { planId, day, task: initialTask } = location.state || {};
  
  const [task, setTask] = useState(initialTask);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState('');
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [childAge, setChildAge] = useState(6); // Default 6 years old
  const [parentTime, setParentTime] = useState(initialTask?.parent_time_minutes || 30);
  const [prefersIndependent, setPrefersIndependent] = useState(childAge >= 6 ? true : false);
  const [incompleteReason, setIncompleteReason] = useState('');

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout? Your session will be cleared.')) {
      // Clear all authentication and user data
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('userChildren');
      localStorage.removeItem('userPlans');
      localStorage.removeItem('userTestResults');
      localStorage.removeItem('currentChildId');
      localStorage.removeItem('testType');
      localStorage.removeItem('childAge');
      sessionStorage.removeItem('assessmentData');
      sessionStorage.removeItem('assessmentResult');
      navigate('/');
    }
  };

  useEffect(() => {
    if (!task && planId && day) {
      loadTask();
    }
    // 从localStorage获取孩子年龄
    const age = parseInt(localStorage.getItem('childAge') || 6);
    setChildAge(age);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, day]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const response = await api.getPlan(planId);
      if (response.data.success) {
        const foundTask = response.data.data.daily_tasks.find(t => t.day === day);
        if (foundTask) {
          // 调试日志
          console.log('加载任务数据:', {
            day: day,
            task_id: foundTask.task_id,
            test_required: foundTask.test_required,
            test_type: foundTask.test_type,
            childAge: childAge
          });
          setTask(foundTask);
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || t('loadTaskFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (task) {
      setParentTime(task.parent_time_minutes || 30);
      if (childAge >= 6) {
        setPrefersIndependent(task.independent_learning ?? true);
      } else {
        setPrefersIndependent(false);
      }
    }
  }, [task, childAge]);

  const handleActivityComplete = (activityIndex) => {
    // 标记活动完成（前端状态，实际应在后端更新）
    const updatedActivities = [...task.activities];
    if (!updatedActivities[activityIndex].completed) {
      updatedActivities[activityIndex].completed = true;
      setTask({ ...task, activities: updatedActivities });
    }
  };

  const handlePlayOnlineGame = (gameName, gameType) => {
    // 直接开始游戏，不需要ID
    console.log(`开始游戏: ${gameName}`);
    
    // 获取计划ID和孩子的年龄（从localStorage或其他地方）
    const planId = location.state?.planId || new URLSearchParams(window.location.search).get('planId');
    const childAge = parseInt(localStorage.getItem('childAge') || 6);
    
    // 跳转到游戏页面
    navigate('/online-game', { 
      state: { 
        gameName,
        gameType: gameType || (childAge < 6 ? 'color_match' : 'schulte'),
        fromDailyTask: true, 
        taskDay: day,
        planId: planId,
        childAge: childAge
      } 
    });
  };

  const handleMarkTaskComplete = async () => {
    try {
      setLoading(true);
      localStorage.setItem(`parentTime-${planId}-${day}`, String(parentTime));
      localStorage.setItem(`independent-${planId}-${day}`, prefersIndependent ? 'yes' : 'no');
      if (incompleteReason.trim()) {
        localStorage.setItem(`incompleteReason-${planId}-${day}`, incompleteReason.trim());
      }
      await api.updateDailyTask(planId, day, { 
        task_id: task.task_id,
        completed: true 
      });
      alert(t('taskMarkedComplete'));
      navigate('/training-plan', { state: { planId } });
    } catch (err) {
      alert(t('updateTaskFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleTestComplete = async (result) => {
    try {
      setLoading(true);
      
      // 计算分数
      const score = calculateScore(result);
      const performanceLevel = result.performance;
      
      // 更新任务测试结果
      await api.updateDailyTask(planId, day, {
        task_id: task.task_id,
        completed: true,
        test_result: {
          test_type: task.test_type || (childAge < 6 ? 'age_adaptive' : 'schulte'),
          test_data: result,
          score: score,
          performance_level: performanceLevel
        }
      });
      
      setTestCompleted(true);
      alert(t('testCompletedRecorded'));
    } catch (err) {
      alert(t('submitTestFailed'));
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (result) => {
    const averageTime = result.averageTime;
    if (averageTime < 30) return 90 + (30 - averageTime) * 0.5;
    if (averageTime < 45) return 75 + (45 - averageTime) * 0.5;
    if (averageTime < 60) return 60 + (60 - averageTime) * 0.5;
    return Math.max(30, 60 - (averageTime - 60) * 0.5);
  };

  if (loading && !task) {
    return (
      <div className="daily-task-page">
        <div className="loading">{t('loading')}</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="daily-task-page">
        <div className="error">{t('taskNotFound')}</div>
      </div>
    );
  }

  const allActivitiesCompleted = task.activities.every(a => a.completed);
  const canMarkComplete = allActivitiesCompleted && (!task.test_required || testCompleted || task.test_completed);
  // 处理双语内容，根据当前语言提取对应文本
  const extractTextByLanguage = (text) => {
    if (!text) return '';
    const textStr = String(text).trim();
    if (!textStr) return '';
    
    // 检查是否包含中英文分隔符 ·
    if (textStr.includes('·')) {
      const parts = textStr.split('·').map(p => p.trim()).filter(p => p);
      if (parts.length === 0) return textStr;
      
      if (language === 'zh') {
        const chinesePart = parts.find(p => /[\u4e00-\u9fff]/.test(p));
        return chinesePart || parts[0];
      } else {
        const englishPart = parts.find(p => !/[\u4e00-\u9fff]/.test(p) && /[a-zA-Z]/.test(p));
        return englishPart || parts[parts.length - 1];
      }
    }
    
    const hasChinese = /[\u4e00-\u9fff]/.test(textStr);
    const hasEnglish = /[a-zA-Z]/.test(textStr);
    
    if (language === 'zh') {
      // 中文模式：优先显示中文，如果没有中文则显示英文
      return hasChinese ? textStr : (hasEnglish ? textStr : textStr);
    } else {
      // 英文模式：优先显示英文，如果有中文则必须翻译
      if (hasEnglish && !hasChinese) return textStr;
      if (hasChinese) {
        // 如果有中文（无论是否混合），必须翻译
        return translateToEnglish(textStr);
      }
      return textStr;
    }
  };

  // 中文到英文翻译映射
  const translateToEnglish = (chineseText) => {
    if (!chineseText) return '';
    
    const translations = {
      // 标题和常见短语
      '第': 'Day ',
      '天训练指导：': ' Training Guidance:',
      '天训练指导': ' Training Guidance',
      '注意力训练重点：': 'Attention Training Focus:',
      '今日活动：': 'Today\'s Activities:',
      '说明：': 'Description: ',
      '详细步骤：': 'Detailed Steps:',
      '注意事项：': 'Important Notes:',
      '操作步骤：': 'Steps:',
      'Steps:': 'Steps:',
      
      // 常见指导内容
      '确保环境安静，减少干扰': 'Ensure a quiet environment and minimize distractions',
      '鼓励孩子完成每个活动': 'Encourage your child to complete each activity',
      '给予积极反馈和鼓励': 'Provide positive feedback and encouragement',
      '可在网站上直接进行此游戏': 'Can play directly on the website',
      '根据孩子实际情况调整活动时间': 'Adjust activity duration based on your child\'s actual situation',
      '如孩子感到疲劳，可适当休息': 'If your child feels tired, allow appropriate rest',
      '记录孩子的表现，便于后续分析': 'Record your child\'s performance for later analysis',
      '对于可在网站进行的游戏，点击活动卡片上的\'开始游戏\'按钮': 'For games that can be played on the website, click the \'Start Game\' button on the activity card',
      '分钟': 'minutes',
      '准备活动材料，确保环境安静舒适': 'Prepare activity materials and ensure a quiet, comfortable environment',
      '向孩子介绍今天的活动，保持积极正面的语气': 'Introduce today\'s activities to your child with a positive tone',
      '陪伴孩子完成每个活动，给予鼓励和支持': 'Accompany your child through each activity, providing encouragement and support',
      '观察孩子的表现，记录完成情况': 'Observe your child\'s performance and record completion status',
      '活动结束后，给予孩子积极的反馈和表扬': 'After activities, provide positive feedback and praise to your child',
      
      // 游戏相关翻译
      '选择适合的拼图难度（建议从9片开始）': 'Choose an appropriate puzzle difficulty (recommended starting with 9 pieces)',
      '观察完整图片': 'Observe the complete picture',
      '拖动拼图片到正确位置': 'Drag puzzle pieces to the correct position',
      '完成后可以挑战更高难度': 'After completion, you can challenge higher difficulty levels',
      '记录完成时间': 'Record completion time',
      '拼图游戏': 'Puzzle Game',
      '记忆游戏': 'Memory Game',
      '注意力训练': 'Attention Training',
      '认知训练': 'Cognitive Training',
      '视觉训练': 'Visual Training',
      '手眼协调': 'Hand-Eye Coordination',
      '专注力训练': 'Focus Training',
      '观察力训练': 'Observation Training',
    };
    
    let translated = chineseText;
    
    // 先处理完整匹配
    for (const [key, value] of Object.entries(translations)) {
      if (translated === key) {
        return value;
      }
    }
    
    // 处理包含关系（按长度从长到短排序，优先匹配长短语）
    const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (translated.includes(key)) {
        translated = translated.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), translations[key]);
      }
    }
    
    // 处理数字+天的格式
    translated = translated.replace(/(\d+)天/g, 'Day $1');
    
    // 处理活动列表格式 "1. 活动名称（10分钟）"
    translated = translated.replace(/(\d+)\.\s*([^（(]+)（(\d+)分钟）/g, '$1. $2 ($3 minutes)');
    translated = translated.replace(/(\d+)\.\s*([^(]+)\((\d+)分钟\)/g, '$1. $2 ($3 minutes)');
    
    // 处理步骤格式 "1. 中文内容" -> "1. English content"
    // 如果还有中文，尝试逐句翻译
    if (/[\u4e00-\u9fff]/.test(translated)) {
      // 先处理完整的步骤句子（保留数字和标点）
      const stepTranslations = {
        '选择适合的拼图难度（建议从9片开始）': 'Choose an appropriate puzzle difficulty (recommended starting with 9 pieces)',
        '观察完整图片': 'Observe the complete picture',
        '拖动拼图片到正确位置': 'Drag puzzle pieces to the correct position',
        '完成后可以挑战更高难度': 'After completion, you can challenge higher difficulty levels',
        '记录完成时间': 'Record completion time',
        '选择适合的难度': 'Choose an appropriate difficulty',
        '从9片开始': 'Start with 9 pieces',
        '建议从9片开始': 'Recommended starting with 9 pieces',
        '挑战更高难度': 'Challenge higher difficulty levels',
        '可以挑战更高难度': 'You can challenge higher difficulty levels',
      };
      
      // 尝试完整匹配
      for (const [key, value] of Object.entries(stepTranslations)) {
        if (translated.includes(key)) {
          translated = translated.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        }
      }
      
      // 如果还有中文，尝试翻译常见的步骤模式
      if (/[\u4e00-\u9fff]/.test(translated)) {
        const stepPatterns = [
          { pattern: /选择(.+)/g, replacement: 'Choose $1' },
          { pattern: /观察(.+)/g, replacement: 'Observe $1' },
          { pattern: /拖动(.+)/g, replacement: 'Drag $1' },
          { pattern: /完成(.+)/g, replacement: 'Complete $1' },
          { pattern: /记录(.+)/g, replacement: 'Record $1' },
          { pattern: /点击(.+)/g, replacement: 'Click $1' },
          { pattern: /开始(.+)/g, replacement: 'Start $1' },
          { pattern: /挑战(.+)/g, replacement: 'Challenge $1' },
          { pattern: /建议(.+)/g, replacement: 'Recommended: $1' },
          { pattern: /从(.+)开始/g, replacement: 'Start with $1' },
          { pattern: /到(.+)位置/g, replacement: 'to $1 position' },
          { pattern: /正确位置/g, replacement: 'the correct position' },
          { pattern: /拼图片/g, replacement: 'puzzle pieces' },
          { pattern: /拼图难度/g, replacement: 'puzzle difficulty' },
          { pattern: /完整图片/g, replacement: 'the complete picture' },
          { pattern: /更高难度/g, replacement: 'higher difficulty levels' },
          { pattern: /完成时间/g, replacement: 'completion time' },
        ];
        
        for (const { pattern, replacement } of stepPatterns) {
          translated = translated.replace(pattern, replacement);
        }
      }
      
      // 如果还有中文，返回原文本（至少用户能看到内容）
      if (/[\u4e00-\u9fff]/.test(translated)) {
        console.warn('Unable to fully translate:', chineseText);
        return translated;
      }
    }
    
    return translated;
  };

  // 解析parent_guidance并生成步骤化的教程
  const parseParentGuidance = (guidanceText) => {
    if (!guidanceText) return generateDefaultGuidance();
    
    const lines = guidanceText.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) return generateDefaultGuidance();
    
    const steps = [];
    let currentSection = null;
    let currentSteps = [];
    let hasContent = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let extractedLine = extractTextByLanguage(line);
      
      // 如果提取后为空，尝试翻译原文本
      if (!extractedLine || extractedLine.trim() === '') {
        if (language === 'en' && /[\u4e00-\u9fff]/.test(line)) {
          extractedLine = translateToEnglish(line);
        } else {
          continue;
        }
      }
      
      if (!extractedLine || extractedLine.trim() === '') continue;
      
      hasContent = true;
      
      // 检查是否是标题（以：或:结尾）
      if (extractedLine.endsWith('：') || extractedLine.endsWith(':')) {
        // 如果之前有步骤，先保存
        if (currentSteps.length > 0 && currentSection) {
          steps.push({ type: 'section', title: currentSection, items: currentSteps });
          currentSteps = [];
        }
        currentSection = extractedLine.replace(/[：:]$/, '').trim();
        // 如果标题后面没有内容，跳过这个标题
        if (i === lines.length - 1 || (i < lines.length - 1 && lines[i + 1].trim() === '')) {
          currentSection = null;
        }
      } 
      // 检查是否是列表项（以-、•、数字开头，或缩进文本）
      else if (/^[-•\d]/.test(extractedLine) || extractedLine.startsWith('   ') || extractedLine.startsWith('    ')) {
        const cleanLine = extractedLine.replace(/^[-•\d.\s]+/, '').trim();
        if (cleanLine) {
          currentSteps.push(cleanLine);
        }
      }
      // 普通文本，作为步骤
      else {
        currentSteps.push(extractedLine);
      }
    }
    
    // 保存最后的步骤
    if (currentSteps.length > 0) {
      if (currentSection) {
        steps.push({ type: 'section', title: currentSection, items: currentSteps });
      } else {
        // 如果没有标题，直接作为步骤
        currentSteps.forEach(step => {
          steps.push({ type: 'step', content: step });
        });
      }
    }
    
    // 如果只有标题没有内容，或者完全没有解析出内容，生成默认指导
    if (!hasContent || steps.length === 0 || (steps.length === 1 && steps[0].type === 'section' && steps[0].items.length === 0)) {
      return generateDefaultGuidance();
    }
    
    return steps;
  };

  // 生成默认的步骤化指导
  const generateDefaultGuidance = () => {
    if (language === 'zh') {
      return [
        { type: 'step', content: '准备活动材料，确保环境安静舒适' },
        { type: 'step', content: '向孩子介绍今天的活动，保持积极正面的语气' },
        { type: 'step', content: '陪伴孩子完成每个活动，给予鼓励和支持' },
        { type: 'step', content: '观察孩子的表现，记录完成情况' },
        { type: 'step', content: '活动结束后，给予孩子积极的反馈和表扬' }
      ];
    } else {
      return [
        { type: 'step', content: 'Prepare activity materials and ensure a quiet, comfortable environment' },
        { type: 'step', content: 'Introduce today\'s activities to your child with a positive tone' },
        { type: 'step', content: 'Accompany your child through each activity, providing encouragement and support' },
        { type: 'step', content: 'Observe your child\'s performance and record completion status' },
        { type: 'step', content: 'After activities, provide positive feedback and praise to your child' }
      ];
    }
  };

  const parentGuidanceItems = task.parent_guidance
    ? parseParentGuidance(task.parent_guidance)
    : generateDefaultGuidance();
  
  // 处理其他可能包含双语内容的字段
  const trainingGoal = extractTextByLanguage(task.training_goal || task.goal || (language === 'zh' ? '保持专注完成今日的趣味任务' : 'Stay focused and enjoy today\'s fun tasks'));
  const trainingExpectation = extractTextByLanguage(task.training_expectation || (language === 'zh' ? '预计今日完成 3 个小游戏，保持微笑与专注' : 'Expected to complete 3 mini games with smiles and focus'));
  const parentWish = extractTextByLanguage(task.parent_expectation || (language === 'zh' ? '希望孩子在两周内提升课堂专注力，每天保持好心情' : 'Hope the child improves classroom focus within 2 weeks, staying happy daily'));
  const parentWishDeadline = extractTextByLanguage(task.parent_expectation_deadline || (language === 'zh' ? '两周内达成小目标' : 'Achieve small goals within 2 weeks'));
  const focusArea = extractTextByLanguage(task.focus_area || task.skill_focus || (task.activities[0]?.focus || (language === 'zh' ? '注意力' : 'Attention')));
  
  // 生成正面的AI评语
  const getPositiveAIPraise = () => {
    if (task.ai_praise) return extractTextByLanguage(task.ai_praise);
    
    const positiveMessages = language === 'zh' ? [
      '今天的坚持让你更棒，继续加油！🌟',
      '你做得很好，每一次尝试都是进步！💪',
      '太棒了！继续保持这样的努力！👍',
      '你的努力让我们很骄傲，继续加油！🎉',
      '今天表现很棒，明天会更好！⭐'
    ] : [
      'Today\'s persistence makes you amazing, keep it up! 🌟',
      'You\'re doing great, every attempt is progress! 💪',
      'Amazing! Keep up this effort! 👍',
      'Your effort makes us proud, keep going! 🎉',
      'Great performance today, tomorrow will be even better! ⭐'
    ];
    return positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
  };
  
  const aiPraise = getPositiveAIPraise();

  return (
    <div className="daily-task-page">
      <div className="task-container">
        <div className="task-header">
          <div className="header-left">
            <button 
              className="back-btn"
              onClick={() => navigate('/training-plan', { state: { planId } })}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h1>{t('dailyTask')} - Day {day}</h1>
              <div className="task-date">{task.date}</div>
            </div>
          </div>
          <button className="btn btn-outline logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            {t('logOut')}
          </button>
        </div>

        <div className="training-overview">
          <div className="goal-card highlight">
            <h3>{t('trainingTarget')}</h3>
            <p>{trainingGoal}</p>
            <span className="focus-badge">{t('todayFocus')}: {focusArea}</span>
          </div>
          <div className="goal-card">
            <h3>{t('trainingExpectation')}</h3>
            <p>{trainingExpectation}</p>
          </div>
          <div className="goal-card">
            <h3>{t('parentWish')}</h3>
            <p>{parentWish}</p>
            <span className="timeline">{t('deadline')}: {parentWishDeadline}</span>
          </div>
          <div className="goal-card encouragement">
            <h3>{t('aiCheer')}</h3>
            <p>{aiPraise}</p>
            <p className="ai-note">{t('aiNote')}</p>
          </div>
        </div>

        <div className="parent-time-card">
          <div className="time-info">
            <h3>{t('parentTime')}</h3>
            <p>{t('parentTimeDescription')}</p>
          </div>
          <div className="time-inputs">
            <label>
              {t('todayMinutes')}
              <input
                type="number"
                min="0"
                max="240"
                value={parentTime}
                onChange={(e) => setParentTime(Number(e.target.value))}
              />
            </label>
            {childAge >= 6 && (
              <div className="independent-toggle">
                <span>{t('independentTask')}</span>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-btn ${prefersIndependent ? 'active' : ''}`}
                    onClick={() => setPrefersIndependent(true)}
                  >
                    {t('yesIndependent')}
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${!prefersIndependent ? 'active' : ''}`}
                    onClick={() => setPrefersIndependent(false)}
                  >
                    {t('noIndependent')}
                  </button>
                </div>
                <div className="independent-tips">
                  {prefersIndependent ? (
                    <ul>
                      <li>{t('childCompletes')}</li>
                      <li>{t('parentSupport')}</li>
                    </ul>
                  ) : (
                    <ul>
                      <li>{t('parentCollaborate')}</li>
                      <li>{t('childTries')}</li>
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {day > 1 && !task.completed && (
          <div className="reason-card">
            <h3>{t('incompleteReason')}</h3>
            <p>{t('incompleteReasonDescription')}</p>
            <textarea
              value={incompleteReason}
              onChange={(e) => setIncompleteReason(e.target.value)}
              placeholder={t('incompleteReasonPlaceholder')}
            />
          </div>
        )}

        {parentGuidanceItems.length > 0 && (
          <div className="parent-guidance">
            <h2>{t('parentGuidance')}</h2>
            <p className="guidance-intro">{t('parentGuidanceIntro')}</p>
            <div className="guidance-grid">
              {parentGuidanceItems.map((item, index) => {
                if (item.type === 'section') {
                  // 确保标题在英文模式下被翻译
                  const sectionTitle = language === 'en' && /[\u4e00-\u9fff]/.test(item.title) 
                    ? translateToEnglish(item.title) 
                    : item.title;
                  
                  return (
                    <div key={`section-${index}`} className="guidance-section">
                      <h3 className="guidance-section-title">{sectionTitle}</h3>
                      <div className="guidance-section-items">
                        {item.items.map((step, stepIndex) => {
                          // 确保步骤内容在英文模式下被翻译
                          const stepContent = language === 'en' && /[\u4e00-\u9fff]/.test(step)
                            ? translateToEnglish(step)
                            : step;
                          
                          return (
                            <div key={stepIndex} className="guidance-card">
                              <div className="guidance-card-header">
                                <span className="guidance-index">{stepIndex + 1}</span>
                              </div>
                              <p>{stepContent}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                } else {
                  // 确保步骤内容在英文模式下被翻译
                  const stepContent = language === 'en' && /[\u4e00-\u9fff]/.test(item.content)
                    ? translateToEnglish(item.content)
                    : item.content;
                  
                  return (
                    <div key={`step-${index}`} className="guidance-card">
                      <div className="guidance-card-header">
                        <span className="guidance-index">{index + 1}</span>
                      </div>
                      <p>{stepContent}</p>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        <div className="activities-section">
          <h2>{t('todayActivities')}</h2>
          <div className="activities-list">
            {task.activities.map((activity, index) => (
              <div 
                key={index} 
                className={`activity-card ${activity.completed ? 'completed' : ''} ${activity.can_play_online ? 'online-game' : ''}`}
              >
                <div className="activity-header">
                  <div className="activity-info">
                    <h3>
                      {(() => {
                        let name = extractTextByLanguage(activity.name);
                        // 确保在英文模式下翻译所有中文内容
                        if (language === 'en' && /[\u4e00-\u9fff]/.test(name)) {
                          name = translateToEnglish(name);
                        }
                        return name;
                      })()}
                      {activity.can_play_online && (
                        <span className="online-badge">📱 {t('onlineGame')}</span>
                      )}
                    </h3>
                    <span className="activity-duration">{activity.duration} {t('minutes')}</span>
                  </div>
                  <button
                    className={`complete-btn ${activity.completed ? 'done' : ''}`}
                    onClick={() => handleActivityComplete(index)}
                    disabled={activity.completed}
                  >
                    {activity.completed ? `✓ ${t('completed')}` : t('markComplete')}
                  </button>
                </div>
                <p className="activity-description">{(() => {
                  let desc = extractTextByLanguage(activity.description);
                  // 确保在英文模式下翻译所有中文内容
                  if (language === 'en' && /[\u4e00-\u9fff]/.test(desc)) {
                    desc = translateToEnglish(desc);
                  }
                  return desc;
                })()}</p>
                
                {activity.detailed_instructions && (
                  <div className="detailed-instructions">
                    <h4>{t('detailedInstructions')}</h4>
                    <div className="instructions-content">
                      {activity.detailed_instructions.split('\n')
                        .map(line => {
                          const trimmed = line.trim();
                          if (!trimmed) return null;
                          // 确保在英文模式下翻译所有中文内容
                          let extracted = extractTextByLanguage(trimmed);
                          // 如果提取后还有中文，再次翻译
                          if (language === 'en' && /[\u4e00-\u9fff]/.test(extracted)) {
                            extracted = translateToEnglish(extracted);
                          }
                          return extracted;
                        })
                        .filter(line => line)
                        .map((step, stepIndex) => (
                          <p key={stepIndex} className="instruction-step">
                            {step}
                          </p>
                        ))}
                    </div>
                  </div>
                )}
                
                {activity.can_play_online && (
                  <button
                    className="play-online-btn"
                    onClick={() => handlePlayOnlineGame(activity.name, activity.game_type || activity.online_game_type)}
                  >
                    <i className="fas fa-gamepad"></i>
                    {t('startGame')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {task.test_required && (
          <div className="test-section">
            <h2>{t('dailyTest')}</h2>
            {!testStarted && !testCompleted && !task.test_completed ? (
              <div className="test-start">
                <p className="test-description">
                  {t('testDescription')}
                </p>
                <button
                  className="start-test-btn"
                  onClick={() => setTestStarted(true)}
                  disabled={!allActivitiesCompleted}
                >
                  {t('startTest')}
                </button>
              </div>
            ) : testStarted && !testCompleted ? (
              <div className="test-in-progress">
                {/* 根据年龄和测试类型选择不同的测试组件 */}
                {(() => {
                  // 调试日志
                  console.log('测试类型判断:', {
                    task_test_type: task.test_type,
                    childAge: childAge,
                    test_required: task.test_required
                  });
                  
                  // 优先使用task.test_type，如果不存在或不符合年龄，则根据年龄判断
                  if (task.test_type === 'schulte') {
                    // 如果test_type是schulte，但孩子年龄小于6岁，应该使用年龄适配测试
                    if (childAge < 6) {
                      console.log('警告: 3岁孩子不应该使用舒尔特测试，改用年龄适配测试');
                      return <AgeAppropriateTest childAge={childAge} onComplete={handleTestComplete} />;
                    }
                    return <SchulteTest onComplete={handleTestComplete} />;
                  } else if (task.test_type === 'observation_test' || task.test_type === 'color_shape_test' || task.test_type === 'simple_pattern_test') {
                    return <AgeAppropriateTest childAge={childAge} onComplete={handleTestComplete} />;
                  } else if (childAge < 6) {
                    // 如果test_type未设置或未知，根据年龄判断
                    return <AgeAppropriateTest childAge={childAge} onComplete={handleTestComplete} />;
                  } else {
                    return <SchulteTest onComplete={handleTestComplete} />;
                  }
                })()}
              </div>
            ) : (
              <div className="test-completed">
                <div className="success-icon">✓</div>
                <p>{t('testCompletedExclamation')}</p>
                {task.test_result && (
                  <div className="test-result">
                    <div className="result-item">
                      <span>{t('score')}:</span>
                      <strong>{task.test_result.score.toFixed(1)}</strong>
                    </div>
                    <div className="result-item">
                      <span>{t('performanceLevel')}:</span>
                      <strong className={`level-${task.test_result.performance_level}`}>
                        {task.test_result.performance_level === 'excellent' && t('excellent')}
                        {task.test_result.performance_level === 'good' && t('good')}
                        {task.test_result.performance_level === 'average' && t('average')}
                        {task.test_result.performance_level === 'needs_improvement' && t('needsImprovement')}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="task-actions">
          <button
            className="complete-task-btn"
            onClick={handleMarkTaskComplete}
            disabled={!canMarkComplete || loading}
          >
            {loading ? t('loading') : t('markCompleteToday')}
          </button>
        </div>

        <div className="daily-ai-note">
          <h3>{t('dailyAIPraise')}</h3>
          <p className="ai-praise-text">"{aiPraise}"</p>
          <span>{t('aiPraiseNote')}</span>
        </div>
      </div>
    </div>
  );
};

export default DailyTaskPage;

