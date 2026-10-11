const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { getUserLevels } = require('../lib');
const { rankCareers } = require('../services/matching');

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id,slug,title,field,description FROM careers ORDER BY title');
    res.json(rows);
  } catch (e) { next(e); }
});

// Declared before '/:id' so 'recommendations' is not treated as an id.
router.get('/recommendations', auth, async (req, res, next) => {
  try {
    const { rows: [u] } = await db.query('SELECT interests FROM users WHERE id=$1', [req.user.id]);
    const levels = await getUserLevels(db, req.user.id);
    const { rows: careers } = await db.query('SELECT id,title,field,description FROM careers');
    const { rows: reqs } = await db.query(
      `SELECT career_id AS "careerId", skill_id AS "skillId", required_level AS required, importance
       FROM career_skills`);
    const withReqs = careers.map((c) => ({ ...c, requirements: reqs.filter((r) => r.careerId === c.id) }));
    res.json(rankCareers({ interests: u.interests || [] }, levels, withReqs));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows: [career] } = await db.query('SELECT * FROM careers WHERE id=$1', [req.params.id]);
    if (!career) return res.status(404).json({ error: 'Career not found.' });
    const { rows: skills } = await db.query(
      `SELECT s.id, s.name, cs.required_level AS "requiredLevel", cs.importance
       FROM career_skills cs JOIN skills s ON s.id = cs.skill_id
       WHERE cs.career_id=$1 ORDER BY cs.importance DESC, s.name`, [req.params.id]);
    res.json({ ...career, skills });
  } catch (e) { next(e); }
});

module.exports = router;
