const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id,name,category FROM skills ORDER BY category, name');
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/mine', auth, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT skill_id AS "skillId", level, source FROM user_skills WHERE user_id=$1', [req.user.id]);
    res.json(rows);
  } catch (e) { next(e); }
});

// Self-assessment. Body: { skills: [{ skillId, level }] }.
// Levels proven by an assessment are never overwritten by a later self-rating.
router.put('/mine', auth, async (req, res, next) => {
  try {
    const list = Array.isArray(req.body.skills) ? req.body.skills : [];
    for (const s of list) {
      const level = Math.min(5, Math.max(0, parseInt(s.level, 10) || 0));
      await db.query(
        `INSERT INTO user_skills(user_id, skill_id, level, source) VALUES($1,$2,$3,'self')
         ON CONFLICT (user_id, skill_id) DO UPDATE
         SET level = EXCLUDED.level, updated_at = now()
         WHERE user_skills.source = 'self'`,
        [req.user.id, s.skillId, level]);
    }
    res.json({ saved: list.length });
  } catch (e) { next(e); }
});

module.exports = router;
