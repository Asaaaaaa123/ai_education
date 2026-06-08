import React, { useState } from 'react';
import {
  PARENT_CHECKIN_DOMAINS,
  RATING_OPTIONS,
  scoreParentCheckin,
} from '../data/parentCheckinItems';
import { performanceLevel } from '../games/scoring';
import './ParentCheckInForm.css';

export default function ParentCheckInForm({ language = 'en', onSubmit, disabled }) {
  const [answers, setAnswers] = useState({});

  const set = (id, value) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const allAnswered = Object.keys(PARENT_CHECKIN_DOMAINS).every((domain) =>
    PARENT_CHECKIN_DOMAINS[domain].items.every((item) => answers[item.id] !== undefined)
  );

  const handleSubmit = () => {
    const score = scoreParentCheckin(answers);
    onSubmit({
      test_type: 'parent_checkin',
      score,
      performance_level: performanceLevel(score),
      test_data: { answers, domains: Object.keys(PARENT_CHECKIN_DOMAINS) },
    });
  };

  return (
    <section className="parent-checkin">
      <header>
        <h3>{language === 'zh' ? '家长观察表' : 'Parent observation check-in'}</h3>
        <p>
          {language === 'zh'
            ? '根据过去一周的表现选择。结构参考 Vineland / ABAS 适应行为领域，用于追踪趋势（非诊断）。'
            : 'Rate the past week. Structured like Vineland / ABAS adaptive domains for trend tracking (not diagnosis).'}
        </p>
      </header>
      {Object.entries(PARENT_CHECKIN_DOMAINS).map(([key, domain]) => (
        <div key={key} className="parent-checkin-domain">
          <h4>{language === 'zh' ? domain.zh : domain.en}</h4>
          {domain.items.map((item) => (
            <div key={item.id} className="parent-checkin-item">
              <span>{language === 'zh' ? item.zh : item.en}</span>
              <div className="parent-checkin-ratings">
                {RATING_OPTIONS.map((opt) => (
                  <label key={opt.value}>
                    <input
                      type="radio"
                      name={item.id}
                      checked={answers[item.id] === opt.value}
                      onChange={() => set(item.id, opt.value)}
                      disabled={disabled}
                    />
                    {language === 'zh' ? opt.zh : opt.en}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        className="btn btn-primary"
        disabled={disabled || !allAnswered}
        onClick={handleSubmit}
      >
        {language === 'zh' ? '保存家长观察' : 'Save parent check-in'}
      </button>
    </section>
  );
}
