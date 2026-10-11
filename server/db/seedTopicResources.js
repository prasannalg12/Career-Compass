require('dotenv').config();
const db = require('../src/db');

// Known official documentation URLs. These are starting points, not a claim
// that every topic in the database has a verified deep link.
const sources = [
  { skill: 'HTML & CSS', match: /html|semantic|form|accessibility/i, title: 'MDN: HTML', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
  { skill: 'HTML & CSS', match: /css|box model|flexbox|grid|responsive|selector/i, title: 'MDN: CSS', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
  { skill: 'JavaScript', match: /./, title: 'MDN: JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
  { skill: 'TypeScript', match: /./, title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
  { skill: 'React', match: /./, title: 'React: Learn', url: 'https://react.dev/learn' },
  { skill: 'Node.js & Backend', match: /./, title: 'Node.js: Learn', url: 'https://nodejs.org/en/learn' },
  { skill: 'REST API Design', match: /http|request|response|status|resource/i, title: 'MDN: HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' },
  { skill: 'Git', match: /./, title: 'Pro Git Book', url: 'https://git-scm.com/book/en/v2' },
  { skill: 'Linux & Command Line', match: /./, title: 'GNU Bash Manual', url: 'https://www.gnu.org/software/bash/manual/bash.html' },
  { skill: 'Python', match: /./, title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/' },
  { skill: 'SQL', match: /./, title: 'PostgreSQL SQL Tutorial', url: 'https://www.postgresql.org/docs/current/tutorial-sql.html' },
  { skill: 'PostgreSQL', match: /./, title: 'PostgreSQL Documentation', url: 'https://www.postgresql.org/docs/current/' },
  { skill: 'Docker', match: /./, title: 'Docker Get Started', url: 'https://docs.docker.com/get-started/' },
  { skill: 'Kubernetes', match: /./, title: 'Kubernetes Concepts', url: 'https://kubernetes.io/docs/concepts/' },
  { skill: 'Programming Fundamentals & OOP', match: /./, title: 'Python Official Tutorial (examples of programming concepts)', url: 'https://docs.python.org/3/tutorial/' }
];

async function main() {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(`SELECT t.id, t.title, s.name AS skill_name
      FROM topics t JOIN skills s ON s.id=t.skill_id`);
    let added = 0;
    for (const topic of result.rows) {
      for (const source of sources) {
        if (topic.skill_name !== source.skill || !source.match.test(topic.title)) continue;
        const inserted = await client.query(
          `INSERT INTO topic_resources (topic_id,title,url,type)
           VALUES ($1,$2,$3,'documentation') ON CONFLICT (topic_id,url) DO NOTHING RETURNING id`,
          [topic.id,source.title,source.url]);
        added += inserted.rowCount;
      }
    }
    await client.query('COMMIT');
    console.log(`Resource seed complete: ${added} new topic-resource links added.`);
    console.log('Only selected skills have initial official-documentation links; other topics show an honest empty state.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    process.exitCode=1;
  } finally { client.release(); await db.end(); }
}
main();
