import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '../utils/toast';
import { api } from '../utils/apiClient';
import EducationalDisclaimer from './EducationalDisclaimer';
import AppShell from './AppShell';
import './OnboardChildPage.css';

const CONDITIONS = [
  { value: '', label: 'Typical development / general support' },
  { value: 'speech_delay', label: 'Speech or language delay' },
  { value: 'autism', label: 'Autism spectrum' },
  { value: 'adhd', label: 'ADHD / attention differences' },
  { value: 'learning', label: 'Learning differences' },
  { value: 'sensory', label: 'Sensory processing' },
  { value: 'other', label: 'Other developmental concern' },
];

export default function OnboardChildPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const existingChildId = location.state?.childId || null;

  const [loading, setLoading] = useState(!!existingChildId);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    child_condition: '',
    concerns: '',
    strengths: '',
  });

  useEffect(() => {
    if (!existingChildId) return;
    (async () => {
      try {
        const res = await api.getChildProfile(existingChildId);
        const child = res.data?.data?.child;
        if (child) {
          setForm({
            name: child.name || '',
            age: child.age != null ? String(child.age) : '',
            gender: child.gender || '',
            child_condition: child.child_condition || '',
            concerns: child.main_problems?.join(', ') || '',
            strengths: '',
          });
        }
      } catch (e) {
        console.error(e);
        toast.error('Could not load child profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [existingChildId]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const age = parseInt(form.age, 10);
    if (!form.name.trim() || Number.isNaN(age) || age < 1 || age > 18) {
      toast.error('Enter a valid name and age (1–18).');
      return;
    }

    setSaving(true);
    try {
      let childId = existingChildId;
      const payload = {
        name: form.name.trim(),
        age,
        gender: form.gender,
        child_condition: form.child_condition || null,
        main_problems: form.concerns
          ? form.concerns.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };

      if (childId) {
        await api.patchChildProfile(childId, payload);
      } else {
        const created = await api.createChildProfile(payload);
        childId = created.data?.data?.child_id || created.data?.data?.child?.child_id;
      }

      if (!childId) throw new Error('No child id returned');

      await api.postChildAssessment(childId, {
        childName: form.name.trim(),
        gender: form.gender,
        childAge: age,
        assessmentMode: 'parent_report',
        parentObservations: form.concerns,
        strengths: form.strengths,
        concerns: form.concerns,
      });

      const planRes = await api.generateChildPlan(childId, 'weekly');
      const planId =
        planRes.data?.data?.plan_id ||
        planRes.data?.data?.plan?.plan_id ||
        planRes.data?.plan_id;

      toast.success('Profile saved — your weekly plan is ready.');
      const qs = `?childId=${encodeURIComponent(childId)}`;
      if (planId) {
        navigate(`/training-plan/${planId}/day/1${qs}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Could not complete setup. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Child setup">
        <p className="onboard-muted">Loading profile…</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={existingChildId ? 'Continue child setup' : 'Add a child'}
      subtitle="Tell us about your child so we can build a supportive weekly learning plan."
    >
      <EducationalDisclaimer compact />

      <form className="onboard-form" onSubmit={handleSubmit}>
        <label>
          Child&apos;s name
          <input required value={form.name} onChange={update('name')} placeholder="e.g. Mei" />
        </label>

        <div className="onboard-row">
          <label>
            Age
            <input
              required
              type="number"
              min={1}
              max={18}
              value={form.age}
              onChange={update('age')}
            />
          </label>
          <label>
            Gender
            <select value={form.gender} onChange={update('gender')}>
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <label>
          Primary focus
          <select value={form.child_condition} onChange={update('child_condition')}>
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Current concerns (comma-separated)
          <textarea
            rows={3}
            value={form.concerns}
            onChange={update('concerns')}
            placeholder="e.g. delayed speech, difficulty focusing, social anxiety"
          />
        </label>

        <label>
          Strengths to build on
          <textarea
            rows={2}
            value={form.strengths}
            onChange={update('strengths')}
            placeholder="e.g. loves drawing, strong memory for songs"
          />
        </label>

        <button type="submit" className="btn btn-primary btn-large" disabled={saving}>
          {saving ? 'Creating plan…' : 'Save & generate weekly plan'}
        </button>
      </form>
    </AppShell>
  );
}
