import React, { useState } from 'react';
import './MvpOnboarding.css';

const STORAGE_KEY = 'mvp_onboarding_done';

export default function MvpOnboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: 'Add your child',
      body: 'Register one child profile so plans, tasks, and progress stay organized.',
    },
    {
      title: 'Run an assessment',
      body: 'Complete the guided questionnaire (and optional games). Your report uses only what you enter—no random scores.',
    },
    {
      title: 'Follow the plan',
      body: 'Open daily tasks, check off small wins, and revisit progress to see trends over time.',
    },
  ];

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    if (onDone) onDone();
  };

  return (
    <div className="mvp-onboard-overlay" role="dialog" aria-modal="true" aria-labelledby="mvp-onboard-title">
      <div className="mvp-onboard-card">
        <p className="mvp-onboard-kicker">Welcome</p>
        <h2 id="mvp-onboard-title">{steps[step].title}</h2>
        <p className="mvp-onboard-body">{steps[step].body}</p>
        <div className="mvp-onboard-dots" aria-hidden="true">
          {steps.map((_, i) => (
            <span key={i} className={i === step ? 'active' : ''} />
          ))}
        </div>
        <div className="mvp-onboard-actions">
          {step > 0 && (
            <button type="button" className="btn btn-outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
              Next
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={finish}>
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
