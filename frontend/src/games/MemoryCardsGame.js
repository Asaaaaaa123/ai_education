import React, { useEffect, useState } from 'react';
import { buildResult } from './scoring';
import './games.css';

const EMOJIS = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐸'];

function buildDeck() {
  const pairs = EMOJIS.slice(0, 6);
  const cards = [...pairs, ...pairs].map((emoji, i) => ({ id: i, emoji, matched: false }));
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function MemoryCardsGame({ onComplete, language = 'en' }) {
  const [cards, setCards] = useState(buildDeck);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    if (matchedCount === 6) {
      const score = Math.max(40, 100 - Math.max(0, moves - 12) * 4);
      onComplete(
        buildResult('memory_cards', { moves, pairs: 6 }, score)
      );
    }
  }, [matchedCount, moves, onComplete]);

  const flip = (idx) => {
    if (flipped.length === 2 || cards[idx].matched || flipped.includes(idx)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (cards[a].emoji === cards[b].emoji) {
        setCards((prev) =>
          prev.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))
        );
        setMatchedCount((n) => n + 1);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  return (
    <div className="game-panel">
      <h4>{language === 'zh' ? '记忆翻牌' : 'Memory cards'}</h4>
      <p className="game-meta">
        {language === 'zh' ? `配对：${matchedCount}/6 · 步数 ${moves}` : `Pairs: ${matchedCount}/6 · Moves ${moves}`}
      </p>
      <div className="game-memory-grid">
        {cards.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={`game-card ${c.matched || flipped.includes(i) ? 'revealed' : ''} ${c.matched ? 'matched' : ''}`}
            onClick={() => flip(i)}
            disabled={c.matched}
          >
            {c.matched || flipped.includes(i) ? c.emoji : '?'}
          </button>
        ))}
      </div>
    </div>
  );
}
