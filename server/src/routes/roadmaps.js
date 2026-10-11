const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { getUserLevels } = require('../lib');
const { computeGaps } = require('../services/gapAnalysis');
const { buildPlan, rebalanceWeeks } = require('../services/roadmapEngine');

// Generate a new roadmap for a chosen career. Archives the previous active one.
router.post('/', auth, async (req, res, next) => {
  const client = await db.connect();
  try {
    const { careerId } = req.body;
    const { rows: reqs } = await client.query(
      `SELECT cs.skill_id AS "skillId", s.name, cs.required_level AS required, cs.importance
       FROM career_skills cs JOIN skills s ON s.id = cs.skill_id WHERE cs.career_id=$1`, [careerId]);
    if (!reqs.length) return res.status(404).json({ error: 'Career not found.' });

    const levels = await getUserLevels(client, req.user.id);
    const gaps = computeGaps(reqs, levels);
    const { rows: resources } = await client.query(
      `SELECT id, skill_id AS "skillId", title, type, level, est_hours AS "estHours"
       FROM resources WHERE skill_id = ANY($1) ORDER BY level`, [gaps.map((g) => g.skillId)]);
    const { rows: [u] } = await client.query('SELECT weekly_hours FROM users WHERE id=$1', [req.user.id]);
    const plan = buildPlan(gaps, resources, u.weekly_hours);

    await client.query('BEGIN');
    await client.query(
      `UPDATE roadmaps SET status='archived' WHERE user_id=$1 AND status='active'`, [req.user.id]);
    const { rows: [rm] } = await client.query(
      'INSERT INTO roadmaps(user_id, career_id) VALUES($1,$2) RETURNING id', [req.user.id, careerId]);
    for (const m of plan) {
      const { rows: [ms] } = await client.query(
        'INSERT INTO milestones(roadmap_id, skill_id, target_level, position) VALUES($1,$2,$3,$4) RETURNING id',
        [rm.id, m.skillId, m.targetLevel, m.position]);
      for (const t of m.tasks) {
        await client.query(
          `INSERT INTO tasks(milestone_id, resource_id, title, type, level, est_hours, due_week)
           VALUES($1,$2,$3,$4,$5,$6,$7)`,
          [ms.id, t.resourceId, t.title, t.type, t.level, t.estHours, t.dueWeek]);
      }
    }
    await client.query(
      'INSERT INTO roadmap_changes(roadmap_id, kind, reason) VALUES($1,$2,$3)',
      [rm.id, 'created', `Roadmap created from ${gaps.length} skill gap(s), planned around ${u.weekly_hours} hours a week.`]);
    await client.query('COMMIT');
    res.status(201).json({ id: rm.id });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    next(e);
  } finally {
    client.release();
  }
});

async function loadActive(userId) {
  const { rows: [rm] } = await db.query(
    `SELECT r.id, r.created_at AS "createdAt", c.title AS "careerTitle"
     FROM roadmaps r JOIN careers c ON c.id = r.career_id
     WHERE r.user_id=$1 AND r.status='active' ORDER BY r.id DESC LIMIT 1`, [userId]);
  return rm;
}

router.get('/current', auth, async (req, res, next) => {
  try {
    const rm = await loadActive(req.user.id);
    if (!rm) return res.json(null);
    const { rows: milestones } = await db.query(
      `SELECT m.id, m.skill_id AS "skillId", s.name, m.target_level AS "targetLevel",
              m.status, m.position, COALESCE(us.level, 0) AS "currentLevel"
       FROM milestones m JOIN skills s ON s.id = m.skill_id
       LEFT JOIN user_skills us ON us.skill_id = m.skill_id AND us.user_id=$2
       WHERE m.roadmap_id=$1 ORDER BY m.position`, [rm.id, req.user.id]);
    const { rows: tasks } = await db.query(
      `SELECT t.id, t.milestone_id AS "milestoneId", t.title, t.type, t.level,
              t.est_hours AS "estHours", t.status, t.due_week AS "dueWeek", r.url
       FROM tasks t LEFT JOIN resources r ON r.id = t.resource_id
       WHERE t.milestone_id = ANY($1) ORDER BY t.level, t.id`, [milestones.map((m) => m.id)]);
    const { rows: changes } = await db.query(
      `SELECT kind, reason, created_at AS "createdAt" FROM roadmap_changes
       WHERE roadmap_id=$1 ORDER BY id DESC LIMIT 10`, [rm.id]);
     
    // Calculate skill priority for roadmap milestones.
    const { rows: requirements } = await db.query(
      `SELECT cs.skill_id AS "skillId",
              cs.required_level AS required,
              cs.importance
       FROM career_skills cs
       JOIN roadmaps r ON r.career_id = cs.career_id
       WHERE r.id = $1`,
      [rm.id]
    );

    const requirementsBySkill = new Map(
      requirements.map((r) => [r.skillId, r])
    );

    const prioritizedMilestones = milestones.map((m) => {
      const requirement = requirementsBySkill.get(m.skillId);

      const required = Number(
        requirement?.required ?? m.targetLevel
      );

      const importance = Number(
        requirement?.importance ?? 1
      );

      const current = Number(m.currentLevel) || 0;

      const gap = Math.max(0, required - current);

      const priorityScore =
        importance * (gap / Math.max(1, required));

      return {
        ...m,
        importance,
        priorityScore
      };
    });

    const maxPriority = Math.max(
      0,
      ...prioritizedMilestones.map((m) => m.priorityScore)
    );

    const milestonesWithPriority =
      prioritizedMilestones.map((m) => ({
        ...m,
        priorityLabel:
          m.priorityScore <= 0
            ? "Completed"
            : maxPriority === 0
            ? "Low"
            : m.priorityScore >= maxPriority * 0.7
            ? "High"
            : m.priorityScore >= maxPriority * 0.35
            ? "Medium"
            : "Low"
      }));

    const counted = tasks.filter((t) => t.status !== 'skipped');
    const done = counted.filter((t) => t.status === 'done').length;
    const currentWeek = Math.floor((Date.now() - new Date(rm.createdAt).getTime()) / (7 * 864e5)) + 1;
    res.json({
      ...rm,
      currentWeek,
      progress: { done, total: counted.length, percent: counted.length ? Math.round((done / counted.length) * 100) : 0 },
      milestones: milestonesWithPriority.map((m) => ({
     ...m,
    tasks: tasks.filter((t) => t.milestoneId === m.id)
   })),
      changes,
    });
  } catch (e) { next(e); }
});

// Mark a task done or not done. Body: { status: 'done' | 'todo' }
router.patch('/tasks/:id', auth, async (req, res, next) => {
  try {
    const status = req.body.status === 'done' ? 'done' : 'todo';
    const { rowCount } = await db.query(
      `UPDATE tasks t SET status=$1
       FROM milestones m JOIN roadmaps r ON r.id = m.roadmap_id
       WHERE t.id=$2 AND t.milestone_id = m.id AND r.user_id=$3`,
      [status, req.params.id, req.user.id]);
    if (!rowCount) return res.status(404).json({ error: 'Task not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Reschedule unfinished tasks from the current week, e.g. after falling behind.
router.post('/current/rebalance', auth, async (req, res, next) => {
  try {
    const rm = await loadActive(req.user.id);
    if (!rm) return res.status(404).json({ error: 'You have no active roadmap.' });
    const { rows: [u] } = await db.query('SELECT weekly_hours FROM users WHERE id=$1', [req.user.id]);
    const { rows: todo } = await db.query(
      `SELECT t.id, t.est_hours AS "estHours" FROM tasks t JOIN milestones m ON m.id = t.milestone_id
       WHERE m.roadmap_id=$1 AND t.status='todo' ORDER BY m.position, t.level, t.id`, [rm.id]);
    const currentWeek = Math.floor((Date.now() - new Date(rm.createdAt).getTime()) / (7 * 864e5)) + 1;
    for (const t of rebalanceWeeks(todo, currentWeek, u.weekly_hours)) {
      await db.query('UPDATE tasks SET due_week=$1 WHERE id=$2', [t.dueWeek, t.id]);
    }
    await db.query(
      'INSERT INTO roadmap_changes(roadmap_id, kind, reason) VALUES($1,$2,$3)',
      [rm.id, 'rebalanced', `Remaining tasks were rescheduled from week ${currentWeek} at ${u.weekly_hours} hours a week.`]);
    res.json({ rescheduled: todo.length });
  } catch (e) { next(e); }
});

module.exports = router;
