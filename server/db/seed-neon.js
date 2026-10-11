
require('dotenv').config();

const db = require('../src/db');
const {
  skills,
  careers,
  resourceSets,
  hours,
  types,
  dsaResources,
  buildQuestions
} = require('./data');

(async () => {
  // Seed only a fresh, empty database.
  // This protects existing student accounts and progress.
  const tables = [
    'users',
    'careers',
    'skills',
    'career_skills',
    'user_skills',
    'resources',
    'roadmaps',
    'milestones',
    'tasks',
    'questions',
    'attempts',
    'roadmap_changes'
  ];

  for (const table of tables) {
    const result = await db.query(
      `SELECT EXISTS (SELECT 1 FROM ${table} LIMIT 1) AS has_data`
    );

    if (result.rows[0].has_data) {
      throw new Error(
        `Stopped safely: ${table} already contains data. No changes made.`
      );
    }
  }

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const skillId = {};

    for (const [name, category] of skills) {
      const { rows } = await client.query(
        'INSERT INTO skills(name, category) VALUES($1,$2) RETURNING id',
        [name, category]
      );
      skillId[name] = rows[0].id;
    }

    for (const c of careers) {
      const { rows } = await client.query(
        `INSERT INTO careers
         (slug,title,field,description,education_path)
         VALUES($1,$2,$3,$4,$5)
         RETURNING id`,
        [c.slug, c.title, c.field, c.description, c.education_path]
      );

      for (const [name, level, importance] of c.reqs) {
        await client.query(
          `INSERT INTO career_skills
           (career_id,skill_id,required_level,importance)
           VALUES($1,$2,$3,$4)`,
          [rows[0].id, skillId[name], level, importance]
        );
      }
    }

    for (const [name, [url, titles]] of Object.entries(resourceSets)) {
      for (let i = 0; i < titles.length; i++) {
        await client.query(
          `INSERT INTO resources
           (skill_id,title,url,type,level,est_hours)
           VALUES($1,$2,$3,$4,$5,$6)`,
          [skillId[name], titles[i], url, types[i], i + 1, hours[i]]
        );
      }
    }

    for (const [level, title, url, type, h] of dsaResources) {
      await client.query(
        `INSERT INTO resources
         (skill_id,title,url,type,level,est_hours)
         VALUES($1,$2,$3,$4,$5,$6)`,
        [skillId['Data Structures & Algorithms'], title, url, type, level, h]
      );
    }

    const questions = buildQuestions();

    for (const x of questions) {
      await client.query(
        `INSERT INTO questions
         (skill_id,level,prompt,options,correct_index)
         VALUES($1,$2,$3,$4,$5)`,
        [
          skillId[x.skill],
          x.level,
          x.prompt,
          JSON.stringify(x.options),
          x.correct
        ]
      );
    }

    await client.query('COMMIT');

    console.log(
      'Neon seed completed:',
      skills.length, 'skills,',
      careers.length, 'careers,',
      questions.length, 'questions.'
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
})()
  .catch(error => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());
