import SchulteGame from './SchulteGame';
import ColorMatchGame from './ColorMatchGame';
import MemoryCardsGame from './MemoryCardsGame';
import EmotionMatchGame from './EmotionMatchGame';
import GoNoGoGame from './GoNoGoGame';
import TracePathGame from './TracePathGame';

/** Maps plan game_type / test_type → React component */
export const GAME_REGISTRY = {
  schulte: SchulteGame,
  color_match: ColorMatchGame,
  color_shape_test: ColorMatchGame,
  memory: MemoryCardsGame,
  memory_cards: MemoryCardsGame,
  emotion_match: EmotionMatchGame,
  go_no_go: GoNoGoGame,
  trace_path: TracePathGame,
  attention_tracking: SchulteGame,
  simple_attention: ColorMatchGame,
  guided_attention: ColorMatchGame,
  turn_taking: EmotionMatchGame,
  sound_play: ColorMatchGame,
  puzzle: MemoryCardsGame,
  observation_test: ColorMatchGame,
};

export function resolveGameComponent(gameType) {
  return GAME_REGISTRY[gameType] || SchulteGame;
}

export const CONDITION_LABELS = {
  adhd: { en: 'ADHD / attention', zh: '多动症 / 注意力' },
  autism: { en: 'Autism spectrum', zh: '自闭症谱系' },
  speech_delay: { en: 'Speech / language delay', zh: '语言发育迟缓' },
  learning: { en: 'Learning difficulties', zh: '学习困难' },
  sensory: { en: 'Sensory processing', zh: '感觉统合' },
  other: { en: 'Other developmental needs', zh: '其他发展需求' },
  '': { en: 'General development', zh: '一般发展' },
};
