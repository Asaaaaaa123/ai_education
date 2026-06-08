/**
 * Parent-reported adaptive behavior check-in (Vineland-3 / ABAS-3 inspired domains).
 * Original wording — not copied from proprietary instruments.
 */

export const PARENT_CHECKIN_DOMAINS = {
  communication: {
    en: 'Communication',
    zh: '沟通',
    items: [
      { id: 'follow_instructions', en: 'Follows simple one-step instructions', zh: '能听懂并执行简单的一步指令' },
      { id: 'express_needs', en: 'Uses words or gestures to express needs', zh: '会用语言或手势表达需要' },
      { id: 'name_objects', en: 'Names familiar people or objects', zh: '能说出熟悉的人或物品名称' },
    ],
  },
  socialization: {
    en: 'Socialization',
    zh: '社交',
    items: [
      { id: 'joint_attention', en: 'Looks when you point at something interesting', zh: '当你指向有趣事物时会看向那里' },
      { id: 'turn_taking', en: 'Takes turns in simple play with you', zh: '在简单游戏中能轮流进行' },
      { id: 'peer_interest', en: 'Shows interest in other children nearby', zh: '对附近的其他孩子表现出兴趣' },
    ],
  },
  daily_living: {
    en: 'Daily living',
    zh: '日常生活',
    items: [
      { id: 'self_feed', en: 'Feeds self with spoon or fingers', zh: '能用勺子或手指自己进食' },
      { id: 'wash_hands', en: 'Washes hands with help', zh: '在帮助下能洗手' },
      { id: 'dress_help', en: 'Helps with dressing (arms/legs)', zh: '穿衣时愿意配合抬手抬脚' },
    ],
  },
  motor: {
    en: 'Motor skills',
    zh: '运动技能',
    items: [
      { id: 'stack_blocks', en: 'Stacks 3+ blocks or cups', zh: '能叠起3块以上积木或杯子' },
      { id: 'copy_stroke', en: 'Copies a line or circle when shown', zh: '能模仿画直线或圆圈' },
      { id: 'gross_motor', en: 'Runs or climbs without frequent falls', zh: '跑或爬时较少摔倒' },
    ],
  },
};

export const RATING_OPTIONS = [
  { value: 2, en: 'Often', zh: '经常' },
  { value: 1, en: 'Sometimes', zh: '有时' },
  { value: 0, en: 'Not yet', zh: '尚未' },
];

export function scoreParentCheckin(answers) {
  const values = Object.values(answers);
  if (!values.length) return 0;
  const sum = values.reduce((a, b) => a + Number(b), 0);
  const max = values.length * 2;
  return Math.round((sum / max) * 100);
}
