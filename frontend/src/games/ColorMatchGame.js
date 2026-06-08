import React, { useMemo, useState } from 'react';
import { scoreFromAccuracy, buildResult } from './scoring';
import './games.css';

const ROUNDS = [
  { color: '#e53e3e', label: 'Red', zh: '红色', shapes: ['circle', 'square'] },
  { color: '#3182ce', label: 'Blue', zh: '蓝色', shapes: ['triangle', 'star'] },
  { color: '#38a169', label: 'Green', zh: '绿色', shapes: ['heart', 'diamond'] },
  { color: '#d69e2e', label: 'Yellow', zh: '黄色', shapes: ['circle', 'star'] },
];

function pickQuestion(lang) {
  const r = ROUNDS[Math.floor(Math.random() * ROUNDS.length)];
  const shape = r.shapes[Math.floor(Math.random() * r.shapes.length)];
  const distractors = ROUNDS.filter((x) => x.color !== r.color).slice(0, 2);
  const options = [r, ...distractors].sort(() => Math.random() - 0.5);
  return {
    prompt: lang === 'zh' ? `找出${r.zh}` : `Find ${r.label}`,
    correct: r.color,
    shape,
    options,
  };
}

export default function ColorMatchGame({ onComplete, language = 'en' }) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [q, setQ] = useState(() => pickQuestion(language));
  const total = 6;

  const answer = (color) => {
    const hit = color === q.correct;
    const nextCorrect = correct + (hit ? 1 : 0);
    const nextRound = round + 1;
    if (nextRound >= total) {
      const score = scoreFromAccuracy(nextCorrect, total);
      onComplete(
        buildResult(
          'color_match',
          { correct: nextCorrect, total, rounds: total },
          score
        )
      );
      return;
    }
    setCorrect(nextCorrect);
    setRound(nextRound);
    setQ(pickQuestion(language));
  };

  const title = useMemo(
    () => (language === 'zh' ? '颜色形状匹配' : 'Color & shape match'),
    [language]
  );

  return (
    <div className="game-panel">
      <h4>{title}</h4>
      <p className="game-meta">
        {q.prompt} · {round + 1}/{total}
      </p>
      <div
        style={{
          width: 80,
          height: 80,
          margin: '0.5rem auto',
          background: q.correct,
          borderRadius: q.shape === 'circle' ? '50%' : 8,
          clipPath:
            q.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
        }}
        aria-hidden
      />
      <div className="game-options">
        {q.options.map((o) => (
          <button
            key={o.color}
            type="button"
            className="game-option-btn"
            style={{ borderColor: o.color }}
            onClick={() => answer(o.color)}
          >
            {language === 'zh' ? o.zh : o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
