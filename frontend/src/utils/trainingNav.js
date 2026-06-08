/**
 * Resolve where "Continue training" should go for the signed-in parent.
 */
export async function resolveTrainingTarget(api) {
  const res = await api.listChildProfiles();
  const children = res.data?.data?.children || [];
  if (!Array.isArray(children) || children.length === 0) {
    return { type: 'onboard', childId: null };
  }

  const withPlan = children.filter((c) => c.current_plan_id);
  const child = withPlan[0] || children[0];

  if (!child.current_plan_id) {
    return { type: 'onboard', childId: child.child_id };
  }

  let day = null;
  try {
    const planRes = await api.getPlan(child.current_plan_id);
    const tasks = planRes.data?.data?.daily_tasks || [];
    const next = tasks.find((t) => !t.completed);
    day = next?.day ?? tasks[tasks.length - 1]?.day ?? 1;
  } catch {
    day = 1;
  }

  return {
    type: 'training',
    childId: child.child_id,
    planId: child.current_plan_id,
    day,
  };
}

export function goToTrainingTarget(navigate, target) {
  if (target.type === 'onboard') {
    if (target.childId) {
      navigate('/onboard-child', { state: { childId: target.childId } });
    } else {
      navigate('/onboard-child');
    }
    return;
  }

  const qs = target.childId ? `?childId=${encodeURIComponent(target.childId)}` : '';
  navigate(`/training-plan/${target.planId}/day/${target.day}${qs}`);
}
