import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../utils/i18n';
import { api } from '../utils/apiClient';
import { toast } from '../utils/toast';
import { CONDITION_LABELS } from '../games/gameRegistry';
import ParentCheckInForm from './ParentCheckInForm';
import EducationalDisclaimer from './EducationalDisclaimer';
import AppShell from './AppShell';
import './ProgressMonitorPage.css';

function TrendBadge({ trend }) {
  const text = trend || 'Collecting data';
  const lower = text.toLowerCase();
  let cls = 'trend-stable';
  if (lower.includes('improv') || lower.includes('进步') || lower.includes('改善')) cls = 'trend-up';
  if (lower.includes('attention') || lower.includes('关注') || lower.includes('下降')) cls = 'trend-down';
  return <span className={`progress-trend ${cls}`}>{text}</span>;
}

function ScoreChart({ scores, language }) {
  if (!scores?.length) {
    return (
      <p className="progress-muted">
        {language === 'zh' ? '完成每日测试后可看到分数趋势。' : 'Complete daily check-in games to see score trends.'}
      </p>
    );
  }
  const max = Math.max(...scores.map((s) => s.score), 100);
  return (
    <div className="progress-chart">
      {scores.map((s) => (
        <div key={s.day} className="progress-bar-col">
          <div
            className="progress-bar-fill"
            style={{ height: `${(s.score / max) * 100}%` }}
            title={`Day ${s.day}: ${s.score}`}
          />
          <span className="progress-bar-label">D{s.day}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProgressMonitorPage() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [child, setChild] = useState(null);
  const [progress, setProgress] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingCheckin, setSavingCheckin] = useState(false);

  useEffect(() => {
    if (!childId) return;
    (async () => {
      setLoading(true);
      try {
        const childRes = await api.getChildProfile(childId);
        const c = childRes.data?.data?.child;
        setChild(c);
        const planId = c?.current_plan_id;
        const [progRes, histRes] = await Promise.all([
          planId ? api.getPlanProgress(planId).catch(() => null) : null,
          api.getTestResults(childId).catch(() => null),
        ]);
        if (progRes?.data?.data) setProgress(progRes.data.data);
        const hist = histRes?.data?.data?.test_results || histRes?.data?.data || [];
        setTestHistory(Array.isArray(hist) ? hist : []);
      } catch (e) {
        console.error(e);
        toast.error('Could not load progress');
      } finally {
        setLoading(false);
      }
    })();
  }, [childId]);

  const saveCheckin = async (result) => {
    setSavingCheckin(true);
    try {
      await api.submitChildTestResult(childId, {
        child_id: childId,
        test_type: result.test_type,
        test_data: result.test_data,
        score: result.score,
        performance_level: result.performance_level,
      });
      toast.success(language === 'zh' ? '家长观察已保存' : 'Parent check-in saved');
      const histRes = await api.getTestResults(childId);
      const hist = histRes?.data?.data?.test_results || [];
      setTestHistory(Array.isArray(hist) ? hist : []);
    } catch (e) {
      console.error(e);
      toast.error('Could not save check-in');
    } finally {
      setSavingCheckin(false);
    }
  };

  const cond = child?.child_condition || '';
  const condLabel = CONDITION_LABELS[cond] || CONDITION_LABELS[''];
  const analysis = child?.assessment_snapshot?.analysis;
  const parentScores = testHistory.filter((t) => t.test_type === 'parent_checkin');
  const gameScores = testHistory.filter((t) => t.test_type !== 'parent_checkin');

  if (loading) {
    return (
      <AppShell title="Progress" backTo="/dashboard">
        <p className="progress-muted">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={child?.name ? `${child.name} — progress` : 'Progress monitor'}
      subtitle={language === 'zh' ? condLabel.zh : condLabel.en}
      backTo="/dashboard"
    >
      <EducationalDisclaimer compact />

      <section className="progress-grid">
        <div className="progress-card">
          <h3>{language === 'zh' ? '训练计划进度' : 'Training plan'}</h3>
          {progress ? (
            <>
              <p>
                {progress.progress?.tasks_completed}/{progress.progress?.tasks_total}{' '}
                {language === 'zh' ? '天已完成' : 'days done'} (
                {progress.progress?.tasks_percentage}%)
              </p>
              <p>
                {language === 'zh' ? '测试完成' : 'Tests done'}:{' '}
                {progress.progress?.tests_completed}/{progress.progress?.tests_total}
              </p>
              <TrendBadge trend={progress.improvement_trend} />
            </>
          ) : (
            <p className="progress-muted">
              {language === 'zh' ? '尚无活跃计划' : 'No active plan yet.'}
            </p>
          )}
          {child?.current_plan_id && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                navigate(
                  `/training-plan/${child.current_plan_id}?childId=${encodeURIComponent(childId)}`
                )
              }
            >
              {language === 'zh' ? '打开训练计划' : 'Open training plan'}
            </button>
          )}
        </div>

        <div className="progress-card">
          <h3>{language === 'zh' ? '游戏测试趋势' : 'Game test trend'}</h3>
          <ScoreChart scores={progress?.test_scores} language={language} />
          {gameScores.length > 0 && (
            <ul className="progress-history">
              {gameScores.slice(-5).reverse().map((t) => (
                <li key={t.test_id || t.timestamp}>
                  <strong>{t.test_type}</strong> — {t.score}{' '}
                  <span className="progress-muted">({t.performance_level})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="progress-card progress-card-wide">
          <h3>{language === 'zh' ? '评估摘要' : 'Assessment summary'}</h3>
          {analysis ? (
            <>
              {analysis.overall_score != null && (
                <p>
                  {language === 'zh' ? '综合得分' : 'Overall score'}: <strong>{analysis.overall_score}</strong>
                </p>
              )}
              {analysis.main_problems?.length > 0 && (
                <p>
                  {language === 'zh' ? '主要关注点' : 'Focus areas'}:{' '}
                  {analysis.main_problems.join(', ')}
                </p>
              )}
              {analysis.recommendations?.length > 0 && (
                <ul className="progress-recs">
                  {analysis.recommendations.slice(0, 4).map((r, i) => (
                    <li key={i}>{typeof r === 'string' ? r : r.text || JSON.stringify(r)}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="progress-muted">
              {language === 'zh' ? '完成 onboarding 评估后显示。' : 'Complete onboarding assessment to see summary.'}
            </p>
          )}
        </div>

        <div className="progress-card progress-card-wide">
          <h3>{language === 'zh' ? '家长观察趋势' : 'Parent observation trend'}</h3>
          {parentScores.length >= 2 ? (
            <p>
              {language === 'zh' ? '最近一次' : 'Latest'}: {parentScores[parentScores.length - 1].score} ·{' '}
              {language === 'zh' ? '上次' : 'Previous'}: {parentScores[parentScores.length - 2].score}
              {parentScores[parentScores.length - 1].score > parentScores[parentScores.length - 2].score
                ? language === 'zh'
                  ? ' ↑ 进步'
                  : ' ↑ improving'
                : ''}
            </p>
          ) : (
            <p className="progress-muted">
              {language === 'zh'
                ? '完成两次家长观察后可比较趋势。'
                : 'Complete two parent check-ins to compare trends.'}
            </p>
          )}
          <ParentCheckInForm language={language} onSubmit={saveCheckin} disabled={savingCheckin} />
        </div>
      </section>

      <p className="progress-evidence">
        {language === 'zh'
          ? '训练游戏设计参考：ADHD 严肃游戏系统综述 (2024)、NDD 数字游戏认知训练 meta 分析 (Ren 2023)、EF 严肃游戏综述 (JMIR 2024)。家长观察表结构参考 Vineland-3 / ABAS-3 适应行为领域。'
          : 'Games informed by ADHD serious-games reviews (2024), NDD digital training meta-analysis (Ren 2023), and EF serious-games review (JMIR 2024). Parent check-in domains align with Vineland-3 / ABAS-3 adaptive behavior areas.'}
      </p>
    </AppShell>
  );
}
