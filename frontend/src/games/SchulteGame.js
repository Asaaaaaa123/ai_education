import React, { useCallback, useMemo, useState } from 'react';
import { scoreFromTime, buildResult } from './scoring';
import './games.css';

function shuffled1to25() {
  const arr = Array.from({ length: 25 }, (_, i) => i + 1);
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function SchulteGame({ onComplete, language = 'en' }) {
  const [grid] = useState(() => shuffled1to25());
  const [next, setNext] = useState(1);
  const [startedAt, setStartedAt] = useState(null);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(null);

  const labels = useMemo(
    () =>
      language === 'zh'
        ? { title: '舒尔特注意力训练', hint: '按 1→25 顺序点击', done: '完成！用时' }
        : { title: 'Schulte attention grid', hint: 'Tap numbers 1→25 in order', done: 'Done! Time:' },
    [language]
  );

  const tap = useCallback(
    (n) => {
      if (done || n !== next) return;
      const now = Date.now();
      if (next === 1) setStartedAt(now);
      if (n === 25) {
        const sec = (now - (startedAt || now)) / 1000;
        setElapsed(sec);
        setDone(true);
        const score = scoreFromTime(sec);
        onComplete(buildResult('schulte', { seconds: sec, grid_size: 5 }, score));
        return;
      }
      setNext(n + 1);
    },
    [done, next, onComplete, startedAt]
  );

  return (
    <div className="game-panel">
      <h4>{labels.title}</h4>
      <p className="game-meta">{labels.hint}</p>
      <div className="game-grid schulte">
        {grid.map((n) => (
          <button
            key={n}
            type="button"
            className={`game-cell ${n < next ? 'done' : ''}`}
            disabled={done || n < next}
            onClick={() => tap(n)}
          >
            {n}
          </button>
        ))}
      </div>
      {elapsed != null && (
        <p className="game-result">
          {labels.done} {elapsed.toFixed(1)}s
        </p>
      )}
    </div>
  );
}
