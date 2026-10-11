const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({
  id: u.id, name: u.name, email: u.email, education: u.education,
  interests: u.interests, weeklyHours: u.weekly_hours,
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ error: 'Enter your name, an email and a password of at least 8 characters.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      'INSERT INTO users(name,email,password_hash) VALUES($1,lower($2),$3) RETURNING *',
      [name, email, hash]);
    res.status(201).json({ token: sign(rows[0]), user: publicUser(rows[0]) });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'An account with this email already exists.' });
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await db.query('SELECT * FROM users WHERE email=lower($1)', [email || '']);
    const u = rows[0];
    if (!u || !(await bcrypt.compare(password || '', u.password_hash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    res.json({ token: sign(u), user: publicUser(u) });
  } catch (e) { next(e); }
});

router.get('/me', auth, async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE id=$1', [req.user.id]);
    res.json(publicUser(rows[0]));
  } catch (e) { next(e); }
});

router.put('/me', auth, async (req, res, next) => {
  try {
    const { education = '', interests = [], weeklyHours = 5 } = req.body;
    const hours = Math.min(60, Math.max(1, parseInt(weeklyHours, 10) || 5));
    const { rows } = await db.query(
      'UPDATE users SET education=$1, interests=$2, weekly_hours=$3 WHERE id=$4 RETURNING *',
      [education, interests, hours, req.user.id]);
    res.json(publicUser(rows[0]));
  } catch (e) { next(e); }
});

module.exports = router;
