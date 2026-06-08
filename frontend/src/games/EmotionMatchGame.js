import React, { useState } from 'react';
import { scoreFromAccuracy, buildResult } from './scoring';
import './games.css';

const EMOTIONS = [
  { id: 'happy', emoji: '😊', en: 'Happy', zh: '开心' },
  { id: 'sad', emoji: '😢', en: 'Sad', zh: '难过' },
  { id: 'angry', emoji: '😠', en: 'Angry', zh: '生气' },
  { id: 'surprised', emoji: '😲', en: 'Surprised', zh: '惊讶' },
  { id: 'scared', emoji: '😨', en: 'Scared', zh: '害怕' },
  { id: 'calm', emoji: '😌', en: 'Calm', zh: '平静' },
];

export default function EmotionMatchGame({ onComplete, language = 'en' }) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [current] = useState(() =>
    [...EMOTIONS].sort(() => Math.random() - 0.5).slice(0, 6)
  );
  const total = current.length;
  const item = current[round];

  const pick = (id) => {
    const hit = id === item.id;
    const nextCorrect = correct + (hit ? 1 : 0);
    const nextRound = round + 1;
    if (nextRound >= total) {
      onComplete(
        buildResult(
          'emotion_match',
          { correct: nextCorrect, total },
          scoreFromAccuracy(nextCorrect, total)
        )
      );
      return;
    }
    setCorrect(nextCorrect);
    setRound(nextRound);
  };

  const options = [...EMOTIONS].sort(() => Math.random() - 0.5).slice(0, 3);
  if (!options.find((o) => o.id === item.id)) options[0] = item;

  return (
    <div className="game-panel">
      <h4>{language === 'zh' ? '情绪识别' : 'Emotion match'}</h4>
      <p className="game-meta">
        {language === 'zh'
          ? `这个孩子感觉如何？ ${round + 1}/${total}`
          : `How does this child feel? ${round + 1}/${total}`}
      </p>
      <div style={{ fontSize: '4rem', textAlign: 'center' }}>{item.emoji}</div>
      <div className="game-options" style={{ justifyContent: 'center' }}>
        {options.map((o) => (
          <button key={o.id} type="button" className="game-option-btn" onClick={() => pick(o.id)}>
            {language === 'zh' ? o.zh : o.en}
          </button>
        ))}
      </div>
    </div>
  );
}
