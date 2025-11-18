import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/i18n';
import apiClient from '../utils/apiClient';
import './ProgressPage.css';

const ProgressPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [plans, setPlans] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    loadChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadProgressData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChild]);

  const loadChildren = async () => {
    try {
      // 先尝试从localStorage加载
      const cachedChildren = localStorage.getItem('userChildren');
      if (cachedChildren) {
        try {
          const childrenList = JSON.parse(cachedChildren);
          setChildren(childrenList);
          if (childrenList.length > 0 && !selectedChild) {
            setSelectedChild(childrenList[0]);
          }
        } catch (e) {
          console.error('解析localStorage中的孩子数据失败:', e);
        }
      }
      
      // 然后从API加载最新数据
      const response = await apiClient.get('/api/plans/children');
      if (response.data.success) {
        const childrenList = response.data.data.children || [];
        setChildren(childrenList);
        // 更新localStorage
        localStorage.setItem('userChildren', JSON.stringify(childrenList));
        if (childrenList.length > 0 && !selectedChild) {
          setSelectedChild(childrenList[0]);
        }
      }
    } catch (err) {
      console.error('加载孩子列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProgressData = async () => {
    if (!selectedChild) {
      return;
    }
    try {
      setLoading(true);
      
      // 先尝试从localStorage加载
      const cachedPlans = localStorage.getItem('userPlans');
      const cachedTestResults = localStorage.getItem('userTestResults');
      if (cachedPlans && cachedTestResults) {
        try {
          const allPlans = JSON.parse(cachedPlans);
          const allTestResults = JSON.parse(cachedTestResults);
          // 过滤出当前孩子的计划
          const childPlans = allPlans.filter(p => p.child_id === selectedChild.child_id || p.child_id === selectedChild.id);
          const childTestResults = allTestResults[selectedChild.child_id] || allTestResults[selectedChild.id] || [];
          
          if (childPlans.length > 0) {
            setPlans(childPlans);
            const progress = analyzeProgress(childPlans, childTestResults);
            setProgressData(progress);
          }
        } catch (e) {
          console.error('解析localStorage中的进度数据失败:', e);
        }
      }
      
      // 然后从API加载最新数据
      const childId = selectedChild.child_id || selectedChild.id;
      const plansResponse = await apiClient.get(`/api/plans/children/${childId}/plans`);
      const testResultsResponse = await apiClient.get(`/api/plans/children/${childId}/test-results`);
      
      if (plansResponse.data.success && testResultsResponse.data.success) {
        const childPlans = plansResponse.data.data.plans || [];
        const childTestResults = testResultsResponse.data.data.test_results || [];
        setPlans(childPlans);
        
        // 更新localStorage
        const allPlans = JSON.parse(localStorage.getItem('userPlans') || '[]');
        const allTestResults = JSON.parse(localStorage.getItem('userTestResults') || '{}');
        // 更新计划
        childPlans.forEach(plan => {
          const index = allPlans.findIndex(p => p.plan_id === plan.plan_id);
          if (index >= 0) {
            allPlans[index] = plan;
          } else {
            allPlans.push(plan);
          }
        });
        // 更新测试结果
        allTestResults[childId] = childTestResults;
        localStorage.setItem('userPlans', JSON.stringify(allPlans));
        localStorage.setItem('userTestResults', JSON.stringify(allTestResults));
        
        const progress = analyzeProgress(childPlans, childTestResults);
        setProgressData(progress);
      }
    } catch (err) {
      console.error('加载进度数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeProgress = (plans, testResults) => {
    if (!plans || plans.length === 0) {
      return null;
    }

    // 分析每日完成情况
    const dailyProgress = [];
    const completedDays = [];
    
    plans.forEach(plan => {
      plan.daily_tasks.forEach(task => {
        if (task.completed) {
          const dayDate = new Date(task.date);
          dailyProgress.push({
            day: task.day,
            date: dayDate.toISOString().split('T')[0],
            completed: true,
            testCompleted: task.test_completed,
            activitiesCount: task.activities?.length || 0,
            activitiesCompleted: task.activities?.filter(a => a.completed).length || 0
          });
          if (!completedDays.includes(task.day)) {
            completedDays.push(task.day);
          }
        }
      });
    });

    // 分析测试趋势
    const testTrends = [];
    testResults.forEach(result => {
      if (result.test_type === 'schulte' && result.test_result) {
        testTrends.push({
          date: result.test_result.date || result.timestamp.split('T')[0],
          score: result.test_result.score || 0,
          time: result.test_result.time || 0,
          accuracy: result.test_result.accuracy || 0
        });
      }
    });

    // 按日期排序
    testTrends.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 计算整体进度
    const totalDays = Math.min(7, plans[0]?.daily_tasks?.length || 0);
    const completionRate = (completedDays.length / totalDays) * 100;

    // 分析改善情况
    const improvement = analyzeImprovement(testTrends);

    return {
      dailyProgress,
      testTrends,
      completedDays,
      totalDays,
      completionRate,
      improvement,
      lastUpdated: new Date().toISOString()
    };
  };

  const analyzeImprovement = (trends) => {
    if (trends.length < 2) {
      return {
        status: 'not_enough_data',
        message: t('insufficientData') || (language === 'zh' ? '数据不足，继续完成任务可获得更多分析' : 'Keep going to unlock more insights. Complete 7 days to see improvement chart!'),
        scoreChange: 0,
        scoreTrend: 'neutral'
      };
    }

    // 每7天生成一个改善图
    const completed7DayPeriods = Math.floor(trends.length / 7);
    // Removed unused variables: last7DaysScore, previous7DaysScore

    const firstScore = trends[0].score;
    const lastScore = trends[trends.length - 1].score;
    const scoreChange = lastScore - firstScore;
    const percentChange = (scoreChange / firstScore) * 100;

    let status, message, trend;
    const currentLang = language || localStorage.getItem('language') || 'en';
    if (scoreChange > 10) {
      status = 'excellent';
      trend = 'up';
      message = currentLang === 'zh' 
        ? `太棒了！分数提高了 ${scoreChange.toFixed(0)} 分 (${percentChange.toFixed(1)}%) 🌟`
        : `Amazing progress! Score increased by ${scoreChange.toFixed(0)} points (${percentChange.toFixed(1)}%)! Keep it up! 🌟`;
    } else if (scoreChange > 5) {
      status = 'good';
      trend = 'up';
      message = currentLang === 'zh'
        ? `很好！分数提高了 ${scoreChange.toFixed(0)} 分 (${percentChange.toFixed(1)}%) 👍`
        : `Great job! Score increased by ${scoreChange.toFixed(0)} points (${percentChange.toFixed(1)}%)! You're doing well! 👍`;
    } else if (scoreChange > 0) {
      status = 'neutral';
      trend = 'up';
      message = currentLang === 'zh'
        ? `有进步！分数提高了 ${scoreChange.toFixed(0)} 分 💪`
        : `We see your effort! Score increased by ${scoreChange.toFixed(0)} points! Every step counts! 💪`;
    } else if (scoreChange === 0) {
      status = 'neutral';
      trend = 'neutral';
      message = currentLang === 'zh'
        ? '保持稳定的表现，继续加油！🎯'
        : 'Steady and ready for the next breakthrough! Consistency is key! 🎯';
    } else {
      status = 'warning';
      trend = 'down';
      message = currentLang === 'zh'
        ? `我们会一起调整策略，分数波动 ${Math.abs(scoreChange).toFixed(0)} 分。让我们再试试！💙`
        : `We will adapt together and cheer you on! Score changed by ${Math.abs(scoreChange).toFixed(0)} points. Let's try again! 💙`;
    }

      // If completed 7-day periods, show improvement chart notification
    if (completed7DayPeriods > 0 && trends.length % 7 === 0) {
      const currentLang = language || localStorage.getItem('language') || 'en';
      if (currentLang === 'zh') {
        message += ` · 已完成 ${completed7DayPeriods * 7} 天，改善图已生成！`;
      } else {
        message += ` · Completed ${completed7DayPeriods * 7} days, improvement chart generated!`;
      }
    }

    return {
      status,
      message,
      scoreChange,
      scoreTrend: trend,
      percentChange,
      completed7DayPeriods
    };
  };

  if (loading && !progressData) {
    return (
      <div className="progress-page">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>{t('loadingProgress')}</p>
        </div>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="progress-page">
        <div className="no-data-container">
          <i className="fas fa-child"></i>
          <h2>{t('noChildAdded')}</h2>
          <p>{t('addChildInfo')}</p>
          <button className="btn btn-primary" onClick={() => navigate('/child-registration')}>
            {t('addChildButton')}
          </button>
        </div>
      </div>
    );
  }

  if (!progressData || progressData.totalDays === 0) {
    return (
      <div className="progress-page">
        <div className="no-data-container">
          <i className="fas fa-chart-line"></i>
          <h2>{t('noTrainingPlan')}</h2>
          <p>{t('startFirstPlan')}</p>
          <button className="btn btn-primary" onClick={() => navigate('/training-plan')}>
            {t('createTrainingPlan')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-page">
      <div className="progress-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/')}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1>Progress Tracker</h1>
        </div>
        <button className="btn btn-outline logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          {t('logOut')}
        </button>
      </div>

      {/* 孩子选择器 */}
      {children.length > 1 && (
        <div className="child-selector">
          {children.map(child => (
            <button
              key={child.id}
              className={`child-card ${selectedChild.id === child.id ? 'active' : ''}`}
              onClick={() => setSelectedChild(child)}
            >
              <i className="fas fa-child"></i>
              <span>{child.name}</span>
              <span className="age-badge">{child.age} {t('yearsOld')}</span>
            </button>
          ))}
        </div>
      )}

      {/* 活动训练计划 */}
      {plans.length > 0 && (
        <div className="progress-section">
          <h2>
            <i className="fas fa-calendar-alt"></i>
            {t('myActivePlans')}
          </h2>
          <div className="plans-grid">
            {plans.map((plan) => {
              const completedTasks = plan.daily_tasks?.filter(t => t.completed).length || 0;
              const totalTasks = plan.daily_tasks?.length || 0;
              const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
              const isActive = new Date() <= new Date(plan.end_date);
              
              return (
                <div key={plan.plan_id} className="plan-card">
                  <div className="plan-card-header">
                    <div className="plan-title">
                      <h3>{plan.plan_type === 'weekly' ? t('weeklyPlan') : t('monthlyPlan')}</h3>
                      <span className={`plan-status ${isActive ? 'active' : 'completed'}`}>
                        {isActive ? t('active') : t('completed')}
                      </span>
                    </div>
                  </div>
                  <div className="plan-progress">
                    <div className="plan-progress-bar">
                      <div 
                        className="plan-progress-fill" 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <span className="plan-progress-text">
                      {completedTasks}/{totalTasks} {t('daysCompleted')}
                    </span>
                  </div>
                  <div className="plan-dates">
                    <span><i className="fas fa-calendar"></i> {plan.start_date} - {plan.end_date}</span>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/training-plan', { state: { planId: plan.plan_id, childId: selectedChild.id } })}
                  >
                    <i className="fas fa-play"></i>
                    {t('continueTraining')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 总体进度概览 */}
      <div className="progress-summary">
        <div className="summary-card completion">
          <div className="card-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="card-content">
            <div className="card-value">{progressData.completedDays.length}</div>
            <div className="card-label">{t('completed')} {t('daysCompleted')}</div>
            <div className="card-sublabel">{t('total')} {progressData.totalDays} {t('daysCompleted')}</div>
          </div>
          <div className="progress-ring">
            <svg width="80" height="80">
              <circle
                className="progress-ring-background"
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="8"
              />
              <circle
                className="progress-ring-foreground"
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="#ff6b6b"
                strokeWidth="8"
                strokeDasharray={`${progressData.completionRate * 2.26} 226`}
                transform="rotate(-90 40 40)"
              />
            </svg>
            <span className="progress-percentage">{Math.round(progressData.completionRate)}%</span>
          </div>
        </div>

        {/* 改善状态卡片 */}
        {progressData.improvement && (
          <div className={`summary-card improvement ${progressData.improvement.status}`}>
            <div className="card-icon">
              <i className={`fas ${progressData.improvement.scoreTrend === 'up' ? 'fa-arrow-up' : progressData.improvement.scoreTrend === 'down' ? 'fa-arrow-down' : 'fa-minus'}`}></i>
            </div>
            <div className="card-content">
              <div className="card-label">{t('improvementTrend')}</div>
              <div className="card-message">{progressData.improvement.message}</div>
              <div className="card-sublabel">{t('improvementNote')}</div>
            </div>
          </div>
        )}
      </div>

      {/* 测试分数趋势图 */}
      {progressData.testTrends.length > 0 && (
        <div className="progress-section">
          <h2>
            <i className="fas fa-chart-line"></i>
            {t('scoreTrend')}
          </h2>
          <div className="test-trend-chart">
            <div className="chart-container">
              {progressData.testTrends.map((point, index) => {
                const maxScore = 100;
                const height = (point.score / maxScore) * 100;
                const isLast = index === progressData.testTrends.length - 1;
                const width = 100 / progressData.testTrends.length;
                
                return (
                  <div key={index} className="chart-bar-container" style={{ width: `${width}%` }}>
                    <div className="chart-bar-wrapper">
                      <div 
                        className={`chart-bar ${isLast ? 'latest' : ''}`}
                        style={{ height: `${height}%` }}
                      >
                        <span className="bar-value">{point.score}</span>
                      </div>
                      <div className="bar-label">
                        {new Date(point.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">{t('latestScore')}</span>
                <span className="stat-value">{progressData.testTrends[progressData.testTrends.length - 1]?.score || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t('averageScore')}</span>
                <span className="stat-value">
                  {Math.round(progressData.testTrends.reduce((sum, t) => sum + t.score, 0) / progressData.testTrends.length)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">{t('testSessions')}</span>
                <span className="stat-value">{progressData.testTrends.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 每日完成情况 */}
      <div className="progress-section">
        <h2>
          <i className="fas fa-tasks"></i>
          {t('dailyMilestones')}
        </h2>
        <div className="daily-progress-grid">
          {progressData.dailyProgress.map((day, index) => (
            <div key={index} className="day-card">
              <div className="day-header">
                <span className="day-label">{t('day')} {day.day}</span>
                <span className="day-date">{day.date}</span>
              </div>
              <div className="day-status">
                {day.completed && <i className="fas fa-check-circle"></i>}
              </div>
              <div className="day-details">
                {day.activitiesCount > 0 && (
                  <div className="activity-progress">
                    <span>{day.activitiesCompleted}/{day.activitiesCount} {t('activities')}</span>
                    <div className="mini-progress-bar">
                      <div 
                        className="mini-progress-fill" 
                        style={{ width: `${(day.activitiesCompleted / day.activitiesCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {day.testCompleted && (
                  <div className="test-badge">
                    <i className="fas fa-clipboard-check"></i>
                    {t('testCompleted')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Milestones */}
      <div className="progress-section">
        <h2>
          <i className="fas fa-trophy"></i>
          {t('achievementMilestones')}
        </h2>
        <div className="milestones-grid">
          {[
            { id: 1, nameKey: 'startJourney', icon: '🎯', achieved: progressData.completedDays.length >= 1 },
            { id: 2, nameKey: 'persist3Days', icon: '⭐', achieved: progressData.completedDays.length >= 3 },
            { id: 3, nameKey: 'persistWeek', icon: '🏆', achieved: progressData.completedDays.length >= 7 },
            { id: 4, nameKey: 'steadyProgress', icon: '📈', achieved: progressData.improvement?.scoreTrend === 'up' }
          ].map(milestone => (
            <div key={milestone.id} className={`milestone-card ${milestone.achieved ? 'achieved' : ''}`}>
              <div className="milestone-icon">{milestone.icon}</div>
              <div className="milestone-name">{t(milestone.nameKey)}</div>
              {milestone.achieved && (
                <div className="milestone-badge">
                  <i className="fas fa-check"></i>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;

