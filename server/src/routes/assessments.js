const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { decideAdaptation } = require('../services/adaptation');

// Up to 5 questions at or just above the user's current level. Correct answers are never sent.
router.get('/:skillId', auth, async (req, res, next) => {
  try {
    const { rows: [us] } = await db.query(
      'SELECT level FROM user_skills WHERE user_id=$1 AND skill_id=$2', [req.user.id, req.params.skillId]);
    const level = us ? us.level : 0;
    const { rows } = await db.query(
      `SELECT id, level, prompt, options FROM questions
       WHERE skill_id=$1 AND level <= $2 ORDER BY level DESC, random() LIMIT 5`,
      [req.params.skillId, level + 1]);
    res.json(rows);
  } catch (e) { next(e); }
});

// Body: { answers: [{ questionId, choice }] }
router.post('/:skillId', auth, async (req, res, next) => {
  const client = await db.connect();
  try {
    const skillId = parseInt(req.params.skillId, 10);
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    if (!answers.length) return res.status(400).json({ error: 'Answer at least one question.' });

    const { rows: qs } = await client.query(
      'SELECT id, correct_index FROM questions WHERE skill_id=$1 AND id = ANY($2)',
      [skillId, answers.map((a) => a.questionId)]);
    const key = new Map(qs.map((q) => [q.id, q.correct_index]));
    const valid = answers.filter((a) => key.has(a.questionId));
    if (!valid.length) return res.status(400).json({ error: 'Those questions do not belong to this skill.' });
    const correct = valid.filter((a) => key.get(a.questionId) === a.choice).length;
    const score = correct / valid.length;

    const { rows: [us] } = await client.query(
      'SELECT level FROM user_skills WHERE user_id=$1 AND skill_id=$2', [req.user.id, skillId]);
    const currentLevel = us ? us.level : 0;
    const { rows: [ms] } = await client.query(
      `SELECT m.id, m.target_level, m.roadmap_id, s.name FROM milestones m
       JOIN roadmaps r ON r.id = m.roadmap_id JOIN skills s ON s.id = m.skill_id
       WHERE r.user_id=$1 AND r.status='active' AND m.skill_id=$2`, [req.user.id, skillId]);
    const decision = decideAdaptation({
      score, currentLevel, requiredLevel: ms ? ms.target_level : currentLevel + 1,
    });

    await client.query('BEGIN');
    await client.query('INSERT INTO attempts(user_id, skill_id, score) VALUES($1,$2,$3)', [req.user.id, skillId, score]);
    await client.query(
      `INSERT INTO user_skills(user_id, skill_id, level, source) VALUES($1,$2,$3,'assessed')
       ON CONFLICT (user_id, skill_id) DO UPDATE SET level=$3, source='assessed', updated_at=now()`,
      [req.user.id, skillId, decision.newLevel]);

    if (ms) {
      const { rows: [dueRow] } = await client.query(
        'SELECT COALESCE(MAX(due_week), 1) AS w FROM tasks WHERE milestone_id=$1', [ms.id]);
      if (decision.action === 'advance') {
        await client.query(
          `UPDATE tasks SET status='skipped'
           WHERE milestone_id=$1 AND status='todo' AND type<>'assessment' AND level <= $2`,
          [ms.id, decision.newLevel]);
        if (decision.newLevel >= ms.target_level) {
          await client.query(`UPDATE milestones SET status='done' WHERE id=$1`, [ms.id]);
          await client.query(`UPDATE tasks SET status='done' WHERE milestone_id=$1 AND type='assessment'`, [ms.id]);
        }
      } else if (decision.action === 'hold') {
        await client.query(
          `INSERT INTO tasks(milestone_id, title, type, level, est_hours, due_week) VALUES($1,$2,'practice',$3,2,$4)`,
          [ms.id, 'Practice: ' + ms.name, currentLevel + 1, dueRow.w]);
      } else {
        // Add the highest-level resource at or below the current level that is not already in the plan.
        const { rows: [easier] } = await client.query(
          `SELECT id, title, est_hours FROM resources
           WHERE skill_id=$1 AND level <= GREATEST($2, 1)
             AND id NOT IN (SELECT resource_id FROM tasks WHERE milestone_id=$3 AND resource_id IS NOT NULL)
           ORDER BY level DESC LIMIT 1`, [skillId, currentLevel, ms.id]);
        if (easier) {
          await client.query(
            `INSERT INTO tasks(milestone_id, resource_id, title, type, level, est_hours, due_week)
             VALUES($1,$2,$3,'review',$4,$5,$6)`,
            [ms.id, easier.id, 'Review: ' + easier.title, Math.max(currentLevel, 1), easier.est_hours, dueRow.w]);
        } else {
          await client.query(
            `INSERT INTO tasks(milestone_id, title, type, level, est_hours, due_week) VALUES($1,$2,'practice',$3,2,$4)`,
            [ms.id, 'Practice: ' + ms.name, Math.max(currentLevel, 1), dueRow.w]);
        }
      }
      await client.query(
        'INSERT INTO roadmap_changes(roadmap_id, kind, reason) VALUES($1,$2,$3)',
        [ms.roadmap_id, decision.action, ms.name + ': ' + decision.reason]);
    }
    await client.query('COMMIT');
    res.json({ score: Math.round(score * 100), correct, total: valid.length, ...decision });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    next(e);
  } finally {
    client.release();
  }
});

module.exports = router;
