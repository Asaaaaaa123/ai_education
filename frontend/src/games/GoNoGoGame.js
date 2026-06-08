import React, { useCallback, useEffect, useRef, useState } from 'react';
import { scoreFromAccuracy, buildResult } from './scoring';
import './games.css';

const TRIALS = 12;

export default function GoNoGoGame({ onComplete, language = 'en' }) {
  const [trial, setTrial] = useState(0);
  const [signal, setSignal] = useState('wait');
  const [correct, setCorrect] = useState(0);
  const [responded, setResponded] = useState(false);
  const isGoRef = useRef(true);
  const timerRef = useRef(null);

  const finishTrial = useCallback(
    (wasCorrect) => {
      const nextCorrect = correct + (wasCorrect ? 1 : 0);
      const nextTrial = trial + 1;
      if (nextTrial >= TRIALS) {
        onComplete(
          buildResult(
            'go_no_go',
            { correct: nextCorrect, total: TRIALS },
            scoreFromAccuracy(nextCorrect, TRIALS)
          )
        );
        return;
      }
      setCorrect(nextCorrect);
      setTrial(nextTrial);
      setSignal('wait');
      setResponded(false);
    },
    [correct, trial, onComplete]
  );

  useEffect(() => {
    if (trial >= TRIALS) return undefined;
    const isGo = Math.random() > 0.35;
    isGoRef.current = isGo;
    timerRef.current = setTimeout(() => {
      setSignal(isGo ? 'go' : 'nogo');
      timerRef.current = setTimeout(() => {
        if (!responded) finishTrial(!isGo);
      }, 1200);
    }, 600 + Math.random() * 800);
    return () => {
      clearTimeout(timerRef.current);
    };
  }, [trial, responded, finishTrial]);

  const tap = () => {
    if (signal === 'wait' || responded) return;
    setResponded(true);
    const wasCorrect = signal === 'go';
    finishTrial(wasCorrect);
  };

  const label =
    signal === 'go'
      ? language === 'zh'
        ? '点！'
        : 'TAP!'
      : signal === 'nogo'
        ? language === 'zh'
          ? '别点'
          : "DON'T TAP"
        : language === 'zh'
          ? '准备…'
          : 'Get ready…';

  return (
    <div className="game-panel">
      <h4>{language === 'zh' ? '停走反应训练' : 'Go / No-Go'}</h4>
      <p className="game-meta">
        {language === 'zh'
          ? '绿色圆点出现时点击；红色不要点。'
          : 'Tap on green; hold still on red.'}{' '}
        {trial + 1}/{TRIALS}
      </p>
      <button
        type="button"
        className={`game-go-signal ${signal}`}
        style={{ border: 'none', cursor: 'pointer' }}
        onClick={tap}
      >
        {label}
      </button>
    </div>
  );
}
