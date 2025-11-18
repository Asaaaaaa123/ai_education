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
  const { t } = useLanguage();
  const { planId, day, task: initialTask } = location.state || {};
  
  const [task, setTask] = useState(initialTask);
  const [loading, setLoading] = useState(false);
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
      setError(err.response?.data?.detail || '加载任务失败');
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
      alert('任务标记为已完成！');
      navigate('/training-plan', { state: { planId } });
    } catch (err) {
      alert('更新任务失败，请重试');
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
      alert('测试完成！结果已记录');
    } catch (err) {
      alert('提交测试结果失败，请重试');
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
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="daily-task-page">
        <div className="error">任务不存在</div>
      </div>
    );
  }

  const allActivitiesCompleted = task.activities.every(a => a.completed);
  const canMarkComplete = allActivitiesCompleted && (!task.test_required || testCompleted || task.test_completed);
  const parentGuidanceItems = task.parent_guidance
    ? task.parent_guidance.split('\n').map(line => line.trim()).filter(line => line)
    : [];
  const trainingGoal = task.training_goal || task.goal || '保持专注完成今日的趣味任务 · Stay focused and enjoy today\'s fun tasks';
  const trainingExpectation = task.training_expectation || '预计今日完成 3 个小游戏，保持微笑与专注 · Expected to complete 3 mini games with smiles and focus';
  const parentWish = task.parent_expectation || '希望孩子在两周内提升课堂专注力，每天保持好心情 · Hope the child improves classroom focus within 2 weeks, staying happy daily';
  const parentWishDeadline = task.parent_expectation_deadline || '两周内达成小目标 · Achieve small goals within 2 weeks';
  const focusArea = task.focus_area || task.skill_focus || (task.activities[0]?.focus || '注意力');
  
  // 生成正面的AI评语
  const getPositiveAIPraise = () => {
    if (task.ai_praise) return task.ai_praise;
    
    const positiveMessages = [
      '今天的坚持让你更棒，继续加油！· Today\'s persistence makes you amazing, keep it up! 🌟',
      '你做得很好，每一次尝试都是进步！· You\'re doing great, every attempt is progress! 💪',
      '太棒了！继续保持这样的努力！· Amazing! Keep up this effort! 👍',
      '你的努力让我们很骄傲，继续加油！· Your effort makes us proud, keep going! 🎉',
      '今天表现很棒，明天会更好！· Great performance today, tomorrow will be even better! ⭐'
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
              {parentGuidanceItems.map((item, index) => (
                <div key={index} className="guidance-card">
                  <span className="guidance-index">{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
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
                      {activity.name}
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
                <p className="activity-description">{activity.description}</p>
                
                {activity.detailed_instructions && (
                  <div className="detailed-instructions">
                    <h4>{t('detailedInstructions')}</h4>
                    <div className="instructions-content">
                      {activity.detailed_instructions.split('\n').map((step, stepIndex) => (
                        <p key={stepIndex} className="instruction-step">
                          {step.trim() && (
                            <>
                              {step.trim().startsWith('操作步骤：') || step.trim().startsWith('Steps:') ? (
                                <strong>{step.trim()}</strong>
                              ) : (
                                step.trim()
                              )}
                            </>
                          )}
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

