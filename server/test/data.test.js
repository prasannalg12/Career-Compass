const test = require('node:test');
const assert = require('node:assert');
const { skills, careers, resourceSets, dsaResources, rawQuestions, buildQuestions } = require('../db/data');

const names = new Set(skills.map((s) => s[0]));

test('skill names are unique', () => {
  assert.strictEqual(names.size, skills.length);
});

test('every career requirement refers to a real skill with valid levels', () => {
  for (const c of careers) {
    for (const [skill, level, importance] of c.reqs) {
      assert.ok(names.has(skill), `${c.title}: unknown skill ${skill}`);
      assert.ok(level >= 1 && level <= 5, `${c.title}/${skill}: bad level`);
      assert.ok(importance >= 1 && importance <= 3, `${c.title}/${skill}: bad importance`);
    }
  }
});

test('every skill has resources covering each level its careers require', () => {
  const maxLevel = {};
  for (const c of careers) for (const [s, l] of c.reqs) maxLevel[s] = Math.max(maxLevel[s] || 0, l);
  for (const [skill, max] of Object.entries(maxLevel)) {
    const levels = new Set();
    if (resourceSets[skill]) [1, 2, 3, 4].forEach((l) => levels.add(l));
    dsaResources.forEach(([l]) => { if (skill === 'Data Structures & Algorithms') levels.add(l); });
    for (let l = 1; l <= max; l++) assert.ok(levels.has(l), `${skill} has no resource at level ${l}`);
  }
});

test('every skill has at least two quiz questions and all questions are valid', () => {
  const count = {};
  for (const x of buildQuestions()) {
    assert.ok(names.has(x.skill), `question for unknown skill ${x.skill}`);
    assert.strictEqual(x.options.length, 4);
    assert.ok(x.correct >= 0 && x.correct < 4);
    count[x.skill] = (count[x.skill] || 0) + 1;
  }
  for (const s of names) assert.ok((count[s] || 0) >= 2, `${s} has fewer than 2 questions`);
  assert.ok(rawQuestions.length >= skills.length * 2);
});