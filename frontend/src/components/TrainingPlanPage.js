import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../utils/i18n';
import { api } from '../utils/apiClient';
import { toast } from '../utils/toast';
import EducationalDisclaimer from './EducationalDisclaimer';
import AppShell from './AppShell';
import './TrainingPlanPage.css';

export default function TrainingPlanPage() {
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const childId = searchParams.get('childId');
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState(null);
  const [childName, setChildName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planId) return;
    (async () => {
      setLoading(true);
      try {
        const [planRes, progRes, childRes] = await Promise.all([
          api.getPlan(planId),
          api.getPlanProgress(planId),
          childId ? api.getChildProfile(childId).catch(() => null) : Promise.resolve(null),
        ]);
        setPlan(planRes.data?.data || null);
        setProgress(progRes.data?.data || null);
        if (childRes?.data?.data?.child?.name) {
          setChildName(childRes.data.data.child.name);
        }
      } catch (e) {
        console.error(e);
        toast.error(t('loadPlanFailed') || 'Could not load training plan');
      } finally {
        setLoading(false);
      }
    })();
  }, [planId, childId, t]);

  const qs = childId ? `?childId=${encodeURIComponent(childId)}` : '';
  const tasks = plan?.daily_tasks || [];
  const firstOpen = tasks.find((item) => !item.completed);
  const currentDay = firstOpen?.day ?? tasks[tasks.length - 1]?.day;

  const openDay = (day) => {
    if (day > 1) {
      const prev = tasks.find((item) => item.day === day - 1);
      if (prev && !prev.completed) {
        const msg =
          language === 'zh'
            ? `请先完成第 ${day - 1} 天的任务再继续。`
            : `Please complete Day ${day - 1} before continuing.`;
        toast.error(msg);
        return;
      }
    }
    navigate(`/training-plan/${planId}/day/${day}${qs}`);
  };

  const focusLabel = (area) => {
    const map = {
      attention: t('attention'),
      cognitive: t('cognitive'),
      social: t('social'),
      motor: t('motor'),
    };
    return map[area] || area || t('comprehensive') || 'Comprehensive';
  };

  if (loading) {
    return (
      <AppShell title={t('trainingPlan')}>
        <p className="plan-muted">{t('loading')}</p>
      </AppShell>
    );
  }

  if (!plan) {
    return (
      <AppShell title={t('trainingPlan')}>
        <p className="plan-muted">{t('planNotExist') || 'Plan not found'}</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={t('trainingPlan')}
      subtitle={childName ? `${childName} · ${plan.plan_type === 'weekly' ? 'Weekly' : 'Monthly'}` : undefined}
    >
      <EducationalDisclaimer compact />

      {progress?.progress && (
        <section className="plan-progress-section">
          <div className="plan-progress-label">{t('overallProgress')}</div>
          <div className="plan-progress-bar">
            <div
              className="plan-progress-fill"
              style={{ width: `${progress.progress.tasks_percentage}%` }}
            />
          </div>
          <div className="plan-progress-text">
            {progress.progress.tasks_completed} / {progress.progress.tasks_total} {t('dailyTasks')}
          </div>
        </section>
      )}

      {firstOpen && (
        <section className="plan-cta">
          <h2>{language === 'zh' ? '继续今天的训练' : "Continue today's training"}</h2>
          <p>
            {language === 'zh'
              ? `第 ${firstOpen.day} 天 — ${focusLabel(firstOpen.focus_area)}`
              : `Day ${firstOpen.day} — ${focusLabel(firstOpen.focus_area)}`}
          </p>
          <button
            type="button"
            className="btn btn-primary btn-large"
            onClick={() => openDay(firstOpen.day)}
          >
            {t('continueTraining')}
          </button>
        </section>
      )}

      {!firstOpen && tasks.length > 0 && (
        <section className="plan-cta plan-cta--done">
          <h2>{language === 'zh' ? '本周计划已完成' : 'Weekly plan complete'}</h2>
          <p>{language === 'zh' ? '太棒了！可以回顾活动或添加新孩子。' : 'Great work! Review activities or add another child.'}</p>
        </section>
      )}

      {plan.goals?.length > 0 && (
        <section className="plan-section">
          <h2>{t('trainingGoals')}</h2>
          <ul>
            {plan.goals.map((g, i) => (
              <li key={i}>{typeof g === 'string' ? g : g.title || String(g)}</li>
            ))}
          </ul>
        </section>
      )}

      {plan.focus_areas?.length > 0 && (
        <section className="plan-section">
          <h2>{t('focusAreas')}</h2>
          <div className="plan-tags">
            {plan.focus_areas.map((area) => (
              <span key={area} className="plan-tag">
                {focusLabel(area)}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="plan-section">
        <h2>{t('dailyTasks')}</h2>
        <div className="plan-day-grid">
          {tasks.map((task) => {
            const locked =
              task.day > 1 && !tasks.find((item) => item.day === task.day - 1)?.completed;
            return (
              <button
                key={task.task_id || task.day}
                type="button"
                className={`plan-day-card ${task.completed ? 'done' : ''} ${locked ? 'locked' : ''} ${
                  task.day === currentDay ? 'current' : ''
                }`}
                onClick={() => openDay(task.day)}
              >
                <span className="plan-day-num">
                  {t('day')} {task.day}
                </span>
                <span className="plan-day-focus">{focusLabel(task.focus_area)}</span>
                <span className="plan-day-status">
                  {task.completed
                    ? t('completed')
                    : locked
                      ? '🔒'
                      : task.day === currentDay
                        ? t('inProgress') || 'In progress'
                        : ''}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
