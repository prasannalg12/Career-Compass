const test = require('node:test');
const assert = require('node:assert');
const { rankCareers } = require('../src/services/matching');
const { computeGaps } = require('../src/services/gapAnalysis');
const { buildPlan, rebalanceWeeks } = require('../src/services/roadmapEngine');
const { decideAdaptation } = require('../src/services/adaptation');

const reqs = [
  { skillId: 1, name: 'SQL', required: 4, importance: 3 },
  { skillId: 2, name: 'Python', required: 3, importance: 2 },
];

test('gaps are sorted by gap x importance and exclude met skills', () => {
  const gaps = computeGaps(reqs, new Map([[1, 1], [2, 3]]));
  assert.strictEqual(gaps.length, 1);
  assert.strictEqual(gaps[0].name, 'SQL');
  assert.strictEqual(gaps[0].gap, 3);
  assert.strictEqual(gaps[0].priority, 2.25);
});

test('career ranking rewards skill fit and matching interests', () => {
  const careers = [
    { id: 1, title: 'A', field: 'Data', description: '', requirements: [{ skillId: 1, required: 4, importance: 3 }] },
    { id: 2, title: 'B', field: 'Design', description: '', requirements: [{ skillId: 9, required: 4, importance: 3 }] },
  ];
  const ranked = rankCareers({ interests: ['Data'] }, new Map([[1, 4]]), careers);
  assert.strictEqual(ranked[0].id, 1);
  assert.strictEqual(ranked[0].score, 100);
  assert.strictEqual(ranked[1].score, 0);
});

test('plan only includes resources between current and required level, then a skill check', () => {
  const gaps = computeGaps(reqs, new Map([[1, 2]]));
  const resources = [1, 2, 3, 4].map((l) => ({ id: l, skillId: 1, title: 'L' + l, type: 'course', level: l, estHours: 4 }));
  const sqlGap = gaps.find((gap) => gap.name === 'SQL');
const plan = buildPlan([sqlGap], resources, 4);
  const titles = plan[0].tasks.map((t) => t.title);
  assert.deepStrictEqual(titles, ['L3', 'L4', 'Skill check: SQL']);
  assert.deepStrictEqual(plan[0].tasks.map((t) => t.dueWeek), [1, 2, 3]);
});

test('rebalance schedules remaining tasks from the current week', () => {
  const out = rebalanceWeeks([{ id: 1, estHours: 5 }, { id: 2, estHours: 5 }], 4, 5);
  assert.deepStrictEqual(out, [{ id: 1, dueWeek: 4 }, { id: 2, dueWeek: 5 }]);
});

test('adaptation advances, holds or remediates by score', () => {
  assert.strictEqual(decideAdaptation({ score: 0.9, currentLevel: 2, requiredLevel: 4 }).newLevel, 3);
  assert.strictEqual(decideAdaptation({ score: 0.6, currentLevel: 2, requiredLevel: 4 }).action, 'hold');
  assert.strictEqual(decideAdaptation({ score: 0.2, currentLevel: 2, requiredLevel: 4 }).action, 'remediate');
  assert.strictEqual(decideAdaptation({ score: 1, currentLevel: 5, requiredLevel: 5 }).newLevel, 5);
});
