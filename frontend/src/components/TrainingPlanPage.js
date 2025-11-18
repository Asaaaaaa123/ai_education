import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../utils/i18n';
import { api } from '../utils/apiClient';
import './TrainingPlanPage.css';

const TrainingPlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const { planId } = location.state || {};
  
  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, setCurrentDay] = useState(null);

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
    if (planId) {
      loadPlan();
      loadProgress();
    } else {
      setError(t('planNotFound') || 'Plan ID not found');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, t]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const response = await api.getPlan(planId);
      if (response.data.success) {
        setPlan(response.data.data);
        // 设置当前天数为第一个未完成的任务
        const firstUncompleted = response.data.data.daily_tasks.find(
          task => !task.completed
        );
        if (firstUncompleted) {
          setCurrentDay(firstUncompleted.day);
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || t('loadPlanFailed') || 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await api.getPlanProgress(planId);
      if (response.data.success) {
        setProgress(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
  };

  const handleDayClick = (day) => {
    // 检查是否完成前一天任务（除了第一天）
    if (day > 1) {
      const previousDay = day - 1;
      const previousTask = plan.daily_tasks.find(t => t.day === previousDay);
      
      if (!previousTask || !previousTask.completed) {
        const currentLang = language || localStorage.getItem('language') || 'en';
        const message = currentLang === 'zh' 
          ? `请先完成第 ${previousDay} 天的任务再继续。`
          : `Please complete Day ${previousDay} before continuing.`;
        alert(message);
        return;
      }
    }
    
    setCurrentDay(day);
    navigate('/daily-task', { state: { planId, day, task: plan.daily_tasks.find(t => t.day === day) } });
  };

  if (loading) {
    return (
      <div className="training-plan-page">
        <div className="loading">{t('loading')}</div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="training-plan-page">
        <div className="error">{error || t('planNotExist') || 'Plan does not exist'}</div>
      </div>
    );
  }

    const focusLabelMap = {
      attention: t('attention'),
      cognitive: t('cognitive'),
      social: t('social'),
      motor: t('motor'),
    };

  const focusPreview = plan.daily_tasks.slice(0, 7).map(taskItem => ({
    day: taskItem.day,
        focus: focusLabelMap[taskItem.focus_area] || focusLabelMap[taskItem.activities?.[0]?.focus] || t('comprehensive') || 'Comprehensive',
    completed: taskItem.completed,
  }));

  const improvementSnapshots = [];
  for (let i = 0; i < plan.daily_tasks.length; i += 7) {
    const chunk = plan.daily_tasks.slice(i, i + 7);
    if (chunk.length > 0) {
      improvementSnapshots.push({
        label: `${chunk[0].day} - ${chunk[chunk.length - 1].day} ${t('day')}`,
        ready: chunk.every(item => item.completed),
        summary: chunk.filter(item => item.completed).length,
        total: chunk.length
      });
    }
  }

  return (
    <div className="training-plan-page">
      <div className="plan-container">
        <div className="plan-header">
          <div className="header-left">
            <button className="btn-back" onClick={() => navigate('/progress')}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h1>{t('trainingPlan')}</h1>
              <div className="plan-meta">
                <span>{plan.plan_type === 'weekly' ? 'Weekly Plan' : 'Monthly Plan'}</span>
                <span>Start: {plan.start_date}</span>
                <span>End: {plan.end_date}</span>
              </div>
            </div>
          </div>
          <button className="btn btn-outline logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            {t('logOut')}
          </button>
        </div>

        {progress && (
          <div className="progress-section">
            <h2>{t('overallProgress')}</h2>
            <div className="progress-cards">
              <div className="progress-card">
                <div className="progress-label">{t('taskCompletionRate')}</div>
                <div className="progress-value">{progress.progress.tasks_percentage}%</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress.progress.tasks_percentage}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {progress.progress.tasks_completed} / {progress.progress.tasks_total}
                </div>
              </div>
              <div className="progress-card">
                <div className="progress-label">{t('testCompletionRate')}</div>
                <div className="progress-value">{progress.progress.tests_percentage}%</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress.progress.tests_percentage}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {progress.progress.tests_completed} / {progress.progress.tests_total}
                </div>
              </div>
            </div>
            {progress.improvement_trend && (
              <div className="improvement-trend">
                <span>{t('improvementTrend')}:</span>
                <strong className={`trend-${progress.improvement_trend}`}>
                  {progress.improvement_trend}
                </strong>
              </div>
            )}
          </div>
        )}

        <div className="focus-areas">
          <h2>{t('focusAreas')}</h2>
          <div className="areas-list">
            {plan.focus_areas.map((area, index) => (
              <div key={index} className="area-tag">
                {area === 'attention' && t('attention')}
                {area === 'cognitive' && t('cognitive')}
                {area === 'social' && t('social')}
                {area === 'motor' && t('motor')}
              </div>
            ))}
          </div>
        </div>

        <div className="focus-visualization">
          <h2>{t('focusPreview')}</h2>
          <p className="focus-subtitle">{t('focusPreviewSubtitle')}</p>
          <div className="focus-grid">
            {focusPreview.map((item) => (
              <div key={item.day} className={`focus-card ${item.completed ? 'completed' : ''}`}>
                <span className="focus-day">{t('day')} {item.day}</span>
                <span className="focus-label">{item.focus}</span>
                <span className="focus-status">{item.completed ? t('completed') : t('inProgress')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="improvement-schedule">
          <h2>{t('improvementSchedule')}</h2>
          <p className="improvement-note">{t('improvementNote')}</p>
          <div className="snapshot-grid">
            {improvementSnapshots.map((snapshot, index) => (
              <div key={index} className={`snapshot-card ${snapshot.ready ? 'ready' : ''}`}>
                <h3>{snapshot.label}</h3>
                <p>{snapshot.summary}/{snapshot.total} {t('daysCompleted')}</p>
                <span className="snapshot-status">
                  {snapshot.ready ? t('chartGenerated') : t('completeToGenerate')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="goals">
          <h2>{t('trainingGoals')}</h2>
          <ul className="goals-list">
            {plan.goals.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </div>

        <div className="daily-tasks-section">
          <h2>{t('dailyTasks')}</h2>
          <div className="tasks-grid">
            {plan.daily_tasks.map((task) => (
              <div
                key={task.task_id}
                className={`task-card ${task.completed ? 'completed' : ''} ${task.test_completed ? 'test-done' : ''} ${task.day > 1 && !plan.daily_tasks.find(t => t.day === task.day - 1)?.completed ? 'locked' : ''}`}
                onClick={() => handleDayClick(task.day)}
              >
                <div className="task-header">
                  <span className="task-day">{t('day')} {task.day}</span>
                  <span className="task-date">{task.date}</span>
                </div>
                <div className="task-status">
                  {task.completed && <span className="status-badge completed">✓ {t('completed')}</span>}
                  {task.test_required && (
                    <span className={`status-badge test ${task.test_completed ? 'done' : 'pending'}`}>
                      {task.test_completed ? `✓ ${t('testCompleted')}` : t('pendingTest')}
                    </span>
                  )}
                </div>
                <div className="task-activities">
                  <div className="activities-count">
                    {task.activities.length} {t('activities')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingPlanPage;



