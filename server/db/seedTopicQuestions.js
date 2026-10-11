
require("dotenv").config();

const db = require("../src/db");
const { topicQuestions } = require("./topicQuestionsData");

async function seedTopicQuestions() {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    let totalQuestions = 0;

    for (const item of topicQuestions) {
      // Find the correct topic within the correct skill.
      const topicResult = await client.query(
        `SELECT t.id
         FROM topics t
         JOIN skills s ON s.id = t.skill_id
         WHERE s.name = $1
           AND t.title = $2`,
        [item.skill, item.topic]
      );

      if (topicResult.rows.length !== 1) {
        throw new Error(
          `Topic not found or ambiguous: ${item.skill} / ${item.topic}`
        );
      }

      const topicId = topicResult.rows[0].id;

      for (const question of item.questions) {
        // Reuse an existing question with the same prompt.
        const existing = await client.query(
          `SELECT id
           FROM topic_questions
           WHERE topic_id = $1 AND prompt = $2
           ORDER BY id
           LIMIT 1`,
          [topicId, question.prompt]
        );

        if (existing.rows.length > 0) {
          await client.query(
            `UPDATE topic_questions
             SET options = $1,
                 correct_index = $2,
                 explanation = $3,
                 difficulty = $4,
                 question_type = 'mcq'
             WHERE id = $5`,
            [
              JSON.stringify(question.options),
              question.correctIndex,
              question.explanation,
              question.difficulty,
              existing.rows[0].id
            ]
          );
        } else {
          await client.query(
            `INSERT INTO topic_questions
             (topic_id, question_type, prompt,
              options, correct_index, explanation, difficulty)
             VALUES ($1, 'mcq', $2, $3, $4, $5, $6)`,
            [
              topicId,
              question.prompt,
              JSON.stringify(question.options),
              question.correctIndex,
              question.explanation,
              question.difficulty
            ]
          );
        }

        totalQuestions++;
      }

      console.log(
        `Processed ${item.questions.length} questions for ${item.topic}`
      );
    }

    await client.query("COMMIT");

    console.log(
      `Topic questions seeded successfully! ${totalQuestions} questions processed.`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Question seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.end();
  }
}

seedTopicQuestions();
