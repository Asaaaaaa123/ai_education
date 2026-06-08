import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../utils/i18n';
import { api } from '../utils/apiClient';
import { toast } from '../utils/toast';
import { resolveGameComponent, CONDITION_LABELS } from '../games/gameRegistry';
import EducationalDisclaimer from './EducationalDisclaimer';
import AppShell from './AppShell';
import './DailyTaskPage.css';
import '../games/games.css';

export default function DailyTaskPage() {
  const { planId, day: dayParam } = useParams();
  const day = parseInt(dayParam, 10);
  const [searchParams] = useSearchParams();
  const childId = searchParams.get('childId');
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [plan, setPlan] = useState(null);
  const [task, setTask] = useState(null);
  const [childName, setChildName] = useState('');
  const [childCondition, setChildCondition] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  const [dayTestDone, setDayTestDone] = useState(false);
  const [playedGames, setPlayedGames] = useState({});

  useEffect(() => {
    if (!planId || Number.isNaN(day)) return;
    (async () => {
      setLoading(true);
      try {
        const [planRes, childRes] = await Promise.all([
          api.getPlan(planId),
          childId ? api.getChildProfile(childId).catch(() => null) : Promise.resolve(null),
        ]);
        const planData = planRes.data?.data;
        setPlan(planData);
        const found = planData?.daily_tasks?.find((item) => item.day === day);
        setTask(found || null);
        setDayTestDone(Boolean(found?.test_completed));
        if (childRes?.data?.data?.child) {
          setChildName(childRes.data.data.child.name);
          setChildCondition(childRes.data.data.child.child_condition || '');
        }
      } catch (e) {
        console.error(e);
        toast.error(t('loadTaskFailed') || 'Could not load this day');
      } finally {
        setLoading(false);
      }
    })();
  }, [planId, day, childId, t]);

  const previousDay = day - 1;
  const previousTask = plan?.daily_tasks?.find((item) => item.day === previousDay);
  const isLocked = day > 1 && previousTask && !previousTask.completed;

  const persistTestResult = async (result, testType) => {
    const payload = {
      test_result: {
        score: result.score,
        performance_level: result.performance_level,
        test_data: result.test_data,
      },
    };
    if (childId) {
      await api.submitChildTestResult(childId, {
        child_id: childId,
        test_type: testType || result.test_type,
        test_data: result.test_data,
        score: result.score,
        performance_level: result.performance_level,
      });
    }
    await api.updateDailyTask(planId, day, {
      task_id: task.task_id,
      completed: task.completed,
      test_result: payload.test_result,
    });
    setDayTestDone(true);
    setTask((prev) => ({ ...prev, test_completed: true, test_result: payload.test_result }));
    toast.success(language === 'zh' ? '测试已记录' : 'Test recorded');
  };

  const onGameComplete = async (result, context) => {
    const key = context?.gameType || 'game';
    setPlayedGames((prev) => ({ ...prev, [key]: true }));
    setActiveGame(null);
    if (context?.isDayTest && task?.test_required && !dayTestDone) {
      await persistTestResult(result, task.test_type);
    }
  };

  const completeAndContinue = async () => {
    if (isLocked) {
      const msg =
        language === 'zh'
          ? `请先完成第 ${previousDay} 天的任务再继续。`
          : `Please complete Day ${previousDay} before continuing.`;
      toast.error(msg);
      return;
    }
    if (task.test_required && !dayTestDone) {
      toast.error(
        language === 'zh'
          ? '请先完成今日训练测试（下方游戏）。'
          : 'Please complete today’s training test below first.'
      );
      return;
    }
    setSaving(true);
    try {
      await api.updateDailyTask(planId, day, {
        task_id: task.task_id,
        completed: true,
      });
      const tasks = plan?.daily_tasks || [];
      const next = tasks.find((item) => item.day > day && !item.completed);
      const qs = childId ? `?childId=${encodeURIComponent(childId)}` : '';
      if (next) {
        toast.success(language === 'zh' ? `进入第 ${next.day} 天` : `On to Day ${next.day}`);
        navigate(`/training-plan/${planId}/day/${next.day}${qs}`);
      } else {
        toast.success(language === 'zh' ? '本周计划已完成！' : 'Weekly plan complete!');
        navigate(`/training-plan/${planId}${qs}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Could not save progress');
    } finally {
      setSaving(false);
    }
  };

  const renderGame = (gameType, isDayTest = false) => {
    const Game = resolveGameComponent(gameType);
    return (
      <Game
        language={language}
        onComplete={(result) => onGameComplete(result, { gameType, isDayTest })}
      />
    );
  };

  if (loading) {
    return (
      <AppShell title={t('dailyTasks')} backTo={`/training-plan/${planId}`}>
        <p className="daily-muted">{t('loading')}</p>
      </AppShell>
    );
  }

  if (!task) {
    return (
      <AppShell title={t('dailyTasks')} backTo={`/training-plan/${planId}`}>
        <p className="daily-muted">{t('planNotExist') || 'Task not found'}</p>
      </AppShell>
    );
  }

  const qs = childId ? `?childId=${encodeURIComponent(childId)}` : '';
  const condLabel = CONDITION_LABELS[childCondition] || CONDITION_LABELS[''];

  return (
    <AppShell
      title={`${t('day')} ${day}${childName ? ` — ${childName}` : ''}`}
      subtitle={task.date || ''}
      backTo={`/training-plan/${planId}${qs}`}
    >
      <EducationalDisclaimer compact />

      {childCondition && (
        <p className="daily-condition">
          {language === 'zh' ? '针对' : 'Tailored for'}: {language === 'zh' ? condLabel.zh : condLabel.en}
        </p>
      )}

      {isLocked && (
        <div className="daily-alert">
          {language === 'zh'
            ? `请先完成第 ${previousDay} 天的任务再继续。`
            : `Please complete Day ${previousDay} before continuing.`}
        </div>
      )}

      {task.focus_area && (
        <p className="daily-focus">
          <strong>{t('focusAreas')}:</strong> {task.focus_area}
        </p>
      )}

      {task.parent_guidance && (
        <section className="daily-card">
          <h2>{t('parentSupport') || 'Parent guidance'}</h2>
          <p className="daily-guidance-text">{task.parent_guidance}</p>
        </section>
      )}

      <section className="daily-card">
        <h2>{t('activities') || 'Training activities'}</h2>
        {(task.activities || []).length === 0 && (
          <p className="daily-muted">No activities listed for this day.</p>
        )}
        {(task.activities || []).map((act, idx) => {
          const gameType = act.game_type;
          const canPlay = act.can_play_online && gameType;
          const played = playedGames[gameType];
          return (
            <article key={idx} className="daily-activity">
              <h3>{act.name || act.type || `Activity ${idx + 1}`}</h3>
              {act.description && <p>{act.description}</p>}
              {act.detailed_instructions && (
                <p className="daily-instructions">{act.detailed_instructions}</p>
              )}
              {canPlay && (
                <div className="daily-game-slot">
                  {activeGame === gameType ? (
                    renderGame(gameType, false)
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setActiveGame(gameType)}
                    >
                      {played
                        ? language === 'zh'
                          ? '再玩一次'
                          : 'Play again'
                        : language === 'zh'
                          ? '开始训练游戏'
                          : 'Start training game'}
                    </button>
                  )}
                  {played && activeGame !== gameType && (
                    <span className="daily-game-done">
                      {language === 'zh' ? '✓ 已完成' : '✓ Done'}
                    </span>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {task.test_required && (
        <section className="daily-card daily-test-card">
          <h2>{language === 'zh' ? '今日进度测试' : 'Today’s progress test'}</h2>
          <p className="daily-muted">
            {language === 'zh'
              ? '完成此测试后家长可在进度页查看趋势。游戏机制与当日训练目标一致（研究支持：技能匹配的游戏更有效）。'
              : 'Complete this test to update progress trends. Game mechanics match today’s training target (research: matched mechanics work best).'}
          </p>
          {dayTestDone ? (
            <p className="daily-test-done">
              {language === 'zh' ? '✓ 今日测试已完成' : '✓ Today’s test completed'}
              {task.test_result?.score != null && ` — ${task.test_result.score}`}
            </p>
          ) : activeGame === '__day_test__' ? (
            renderGame(task.test_type, true)
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-large"
              onClick={() => setActiveGame('__day_test__')}
            >
              {language === 'zh' ? '开始今日测试' : 'Start today’s test'}
            </button>
          )}
        </section>
      )}

      {childId && (
        <button
          type="button"
          className="btn btn-outline daily-progress-link"
          onClick={() => navigate(`/child/${childId}/progress`)}
        >
          {language === 'zh' ? '查看进度与趋势' : 'View progress & trends'}
        </button>
      )}

      <div className="daily-actions">
        <button
          type="button"
          className="btn btn-primary btn-large"
          disabled={saving || isLocked || task.completed}
          onClick={completeAndContinue}
        >
          {task.completed
            ? t('completed')
            : saving
              ? t('loading')
              : language === 'zh'
                ? '完成今天 · 进入下一步'
                : 'Finish today · Next step'}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => navigate(`/training-plan/${planId}${qs}`)}
        >
          {t('trainingPlan') || 'View full plan'}
        </button>
      </div>
    </AppShell>
  );
}
