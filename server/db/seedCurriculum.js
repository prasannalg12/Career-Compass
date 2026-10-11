
require('dotenv').config();

const db = require('../src/db');
const { curricula } = require('./curriculumData');

async function seedCurriculum() {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    for (const [skillName, topics] of Object.entries(curricula)) {
      const skillResult = await client.query(
        'SELECT id FROM skills WHERE name = $1',
        [skillName]
      );

      if (skillResult.rows.length === 0) {
        throw new Error(`Skill not found: ${skillName}`);
      }

      const skillId = skillResult.rows[0].id;

      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];

        const topicResult = await client.query(
          `INSERT INTO topics
             (skill_id, title, description, position)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (skill_id, position)
           DO UPDATE SET
             title = EXCLUDED.title,
             description = EXCLUDED.description
           RETURNING id`,
          [
            skillId,
            topic.title,
            topic.description || '',
            i + 1
          ]
        );

        const topicId = topicResult.rows[0].id;

        for (let j = 0; j < topic.subtopics.length; j++) {
          await client.query(
            `INSERT INTO subtopics
               (topic_id, title, position)
             VALUES ($1, $2, $3)
             ON CONFLICT (topic_id, position)
             DO UPDATE SET
               title = EXCLUDED.title`,
            [
              topicId,
              topic.subtopics[j],
              j + 1
            ]
          );
        }
      }

      console.log(
        `Added/updated ${topics.length} topics for ${skillName}`
      );
    }

    await client.query('COMMIT');
    console.log('Curriculum inserted successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Curriculum insertion failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.end();
  }
}

seedCurriculum();
