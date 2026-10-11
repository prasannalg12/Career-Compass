// DEV ONLY: wipes careers, skills, resources and questions (and anything referencing them).
require('dotenv').config();
const db = require('../src/db');
const { skills, careers, resourceSets, hours, types, dsaResources, buildQuestions } = require('./data');

(async () => {
  await db.query('TRUNCATE careers, skills RESTART IDENTITY CASCADE');
  const skillId = {};
  for (const [name, category] of skills) {
    const { rows } = await db.query('INSERT INTO skills(name, category) VALUES($1,$2) RETURNING id', [name, category]);
    skillId[name] = rows[0].id;
  }
  for (const c of careers) {
    const { rows } = await db.query(
      'INSERT INTO careers(slug,title,field,description,education_path) VALUES($1,$2,$3,$4,$5) RETURNING id',
      [c.slug, c.title, c.field, c.description, c.education_path]);
    for (const [name, level, importance] of c.reqs) {
      await db.query('INSERT INTO career_skills VALUES($1,$2,$3,$4)', [rows[0].id, skillId[name], level, importance]);
    }
  }
  for (const [name, [url, titles]] of Object.entries(resourceSets)) {
    for (let i = 0; i < titles.length; i++) {
      await db.query(
        'INSERT INTO resources(skill_id,title,url,type,level,est_hours) VALUES($1,$2,$3,$4,$5,$6)',
        [skillId[name], titles[i], url, types[i], i + 1, hours[i]]);
    }
  }
  for (const [level, title, url, type, h] of dsaResources) {
    await db.query(
      'INSERT INTO resources(skill_id,title,url,type,level,est_hours) VALUES($1,$2,$3,$4,$5,$6)',
      [skillId['Data Structures & Algorithms'], title, url, type, level, h]);
  }
  const questions = buildQuestions();
  for (const x of questions) {
    await db.query(
      'INSERT INTO questions(skill_id,level,prompt,options,correct_index) VALUES($1,$2,$3,$4,$5)',
      [skillId[x.skill], x.level, x.prompt, JSON.stringify(x.options), x.correct]);
  }
  console.log('Seeded', skills.length, 'skills,', careers.length, 'careers,', questions.length, 'questions.');
  await db.end();
})().catch((e) => { console.error(e); process.exit(1); });