/**
 * Dashboard — default protected landing after Clerk sign-in (route /dashboard).
 * Lists ChildProfile cards from GET /api/children; launches ChildOnboardingWizard via /onboard-child.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { toast } from '../utils/toast';
import { api } from '../utils/apiClient';
import EducationalDisclaimer from './EducationalDisclaimer';
import AppShell from './AppShell';
import { CONDITION_LABELS } from '../games/gameRegistry';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [children, setChildren] = useState([]);
  const [childTrends, setChildTrends] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.listChildProfiles();
      const list = res.data?.data?.children || [];
      setChildren(Array.isArray(list) ? list : []);
      const trends = {};
      await Promise.all(
        list
          .filter((c) => c.current_plan_id)
          .map(async (c) => {
            try {
              const pr = await api.getPlanProgress(c.current_plan_id);
              trends[c.child_id] = pr.data?.data;
            } catch {
              /* ignore */
            }
          })
      );
      setChildTrends(trends);
    } catch (e) {
      console.error(e);
      toast.error('Could not load children');
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const withPlans = children.filter((c) => c.current_plan_id).length;

  const openChild = async (c) => {
    if (c.current_plan_id) {
      try {
        const planRes = await api.getPlan(c.current_plan_id);
        const tasks = planRes.data?.data?.daily_tasks || [];
        const next = tasks.find((t) => !t.completed);
        const day = next?.day ?? 1;
        navigate(
          `/training-plan/${c.current_plan_id}/day/${day}?childId=${encodeURIComponent(c.child_id)}`
        );
      } catch {
        navigate(
          `/training-plan/${c.current_plan_id}?childId=${encodeURIComponent(c.child_id)}`
        );
      }
      return;
    }
    navigate('/onboard-child', { state: { childId: c.child_id } });
  };

  return (
    <AppShell
      title="Family dashboard"
      subtitle={`Signed in as ${user?.primaryEmailAddress?.emailAddress || user?.username || 'parent'}`}
      showBack={false}
    >
      <EducationalDisclaimer compact />

      <section className="dashboard-stats">
        <div className="dashboard-stat">
          <strong>{children.length}</strong>
          <span>Children</span>
        </div>
        <div className="dashboard-stat">
          <strong>{withPlans}</strong>
          <span>Active plans</span>
        </div>
      </section>

      <section className="dashboard-actions-bar">
        <button type="button" className="btn btn-primary btn-large" onClick={() => navigate('/onboard-child')}>
          + Add new child
        </button>
      </section>

      <section className="dashboard-cards">
        {loading && <p className="dashboard-muted">Loading…</p>}
        {!loading && children.length === 0 && (
          <div className="dashboard-empty">
            <p>No profiles yet — add your first child to start the guided journey.</p>
          </div>
        )}
        {!loading &&
          children.map((c) => {
            const cond = CONDITION_LABELS[c.child_condition] || CONDITION_LABELS[''];
            const trend = childTrends[c.child_id];
            return (
              <div key={c.child_id} className="dashboard-card-wrap">
                <button type="button" className="dashboard-card" onClick={() => openChild(c)}>
                  <div className="dashboard-card-title">{c.name}</div>
                  <div className="dashboard-card-meta">
                    Age {c.age} · {cond.en}
                  </div>
                  <div className="dashboard-card-status">
                    {c.current_plan_id ? (
                      <span className="tag tag-ok">Continue training</span>
                    ) : (
                      <span className="tag tag-warn">Finish setup</span>
                    )}
                  </div>
                  {trend?.progress && (
                    <div className="dashboard-card-progress">
                      {trend.progress.tasks_percentage}% plan ·{' '}
                      {trend.improvement_trend || 'Collecting data'}
                    </div>
                  )}
                  {c.current_plan_id && (
                    <span className="dashboard-card-hint">
                      Tap to open today&apos;s training games and tests.
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline dashboard-progress-btn"
                  onClick={() => navigate(`/child/${c.child_id}/progress`)}
                >
                  Monitor progress
                </button>
              </div>
            );
          })}
      </section>
    </AppShell>
  );
}
