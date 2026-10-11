
const express = require('express');
const router = express.Router();
const db = require('../db');

// Public, read-only learning resources for a curriculum topic.
router.get('/topics/:topicId/resources', async (req, res) => {
  try {
    const topicId = Number(req.params.topicId);
    if (!Number.isSafeInteger(topicId) || topicId <= 0) {
      return res.status(400).json({ error: 'Invalid topic ID' });
    }
    const exists = await db.query('SELECT id FROM topics WHERE id = $1', [topicId]);
    if (!exists.rowCount) return res.status(404).json({ error: 'Topic not found' });
    const result = await db.query(
      `SELECT id, title, url, type FROM topic_resources
       WHERE topic_id = $1 ORDER BY id`, [topicId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Topic resources error:', error);
    res.status(500).json({ error: 'Unable to load learning resources' });
  }
});

// GET all topics and subtopics for a skill
router.get('/skills/:skillId', async (req, res) => {
  try {
    const skillId = Number(req.params.skillId);

    if (!Number.isInteger(skillId) || skillId <= 0) {
      return res.status(400).json({
        error: 'Invalid skill ID'
      });
    }

    const skillResult = await db.query(
      'SELECT id, name, category FROM skills WHERE id = $1',
      [skillId]
    );

    if (skillResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Skill not found'
      });
    }

    const topicsResult = await db.query(
      `SELECT id, title, description,
              position, estimated_hours
       FROM topics
       WHERE skill_id = $1
       ORDER BY position`,
      [skillId]
    );

    const topicIds = topicsResult.rows.map(topic => topic.id);

    let subtopics = [];

    if (topicIds.length > 0) {
      const result = await db.query(
        `SELECT id, topic_id, title, position
         FROM subtopics
         WHERE topic_id = ANY($1::int[])
         ORDER BY position`,
        [topicIds]
      );

      subtopics = result.rows;
    }

    const topics = topicsResult.rows.map(topic => ({
      ...topic,
      subtopics: subtopics.filter(
        subtopic => subtopic.topic_id === topic.id
      )
    }));

    res.json({
      skill: skillResult.rows[0],
      totalTopics: topics.length,
      topics
    });
  } catch (error) {
    console.error('Curriculum API error:', error);
    res.status(500).json({
      error: 'Failed to fetch curriculum'
    });
  }
});

const auth = require("../middleware/auth");

// Get the signed-in student's topic progress
router.get("/progress", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT topic_id, studied, practiced, updated_at
       FROM topic_progress
       WHERE user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Topic progress error:", error);
    res.status(500).json({
      error: "Unable to load topic progress"
    });
  }
});

// Save studied/practiced status for one topic
router.patch(
  "/topics/:topicId/progress",
  auth,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const topicId = Number(req.params.topicId);
      const { studied, practiced } = req.body;

      if (!Number.isInteger(topicId) || topicId <= 0) {
        return res.status(400).json({
          error: "Invalid topic ID"
        });
      }

      if (
        typeof studied !== "boolean" ||
        typeof practiced !== "boolean"
      ) {
        return res.status(400).json({
          error: "Studied and practiced must be booleans"
        });
      }

      const result = await db.query(
        `INSERT INTO topic_progress
           (user_id, topic_id, studied, practiced)
         SELECT $1, id, $3, $4
         FROM topics
         WHERE id = $2
         ON CONFLICT (user_id, topic_id)
         DO UPDATE SET
           studied = EXCLUDED.studied,
           practiced = EXCLUDED.practiced,
           updated_at = now()
         RETURNING topic_id, studied, practiced`,
        [userId, topicId, studied, practiced]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Topic not found"
        });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Save topic progress error:", error);
      res.status(500).json({
        error: "Unable to save topic progress"
      });
    }
  }
);

const crypto = require("crypto");

// Store assessment question order temporarily.
// This is suitable for local development.
// Later, we'll persist sessions for production.
const assessmentSessions = new Map();

// Fetch questions for a topic
router.get(
  "/topics/:topicId/questions",
  auth,
  async (req, res) => {
    try {
      const topicId = Number(req.params.topicId);

      if (!Number.isInteger(topicId) || topicId <= 0) {
        return res.status(400).json({
          error: "Invalid topic ID"
        });
      }

      const result = await db.query(
        `SELECT id, prompt, options, difficulty
         FROM topic_questions
         WHERE topic_id = $1
           AND question_type = 'mcq'
         ORDER BY RANDOM()
         LIMIT 15`,
        [topicId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "No assessment questions available"
        });
      }

      const assessmentId = crypto.randomUUID();

      assessmentSessions.set(assessmentId, {
        userId: req.user.id,
        topicId,
        questionIds: result.rows.map((q) => q.id),
        createdAt: Date.now()
      });

      res.json({
        assessmentId,
        topicId,
        totalQuestions: result.rows.length,
        questions: result.rows
      });
    } catch (error) {
      console.error("Load assessment error:", error);

      res.status(500).json({
        error: "Unable to load assessment"
      });
    }
  }
);

// Submit answers and calculate score
router.post(
  "/topics/:topicId/submit",
  auth,
  async (req, res) => {
    try {
      const topicId = Number(req.params.topicId);
      const { assessmentId, answers } = req.body;

      const session = assessmentSessions.get(assessmentId);

      if (
        !session ||
        session.userId !== req.user.id ||
        session.topicId !== topicId
      ) {
        return res.status(400).json({
          error: "Invalid assessment session"
        });
      }

      // Sessions expire after 60 minutes.
      if (Date.now() - session.createdAt > 60 * 60 * 1000) {
        assessmentSessions.delete(assessmentId);

        return res.status(400).json({
          error: "Assessment session expired"
        });
      }

      if (
        !Array.isArray(answers) ||
        answers.length !== session.questionIds.length
      ) {
        return res.status(400).json({
          error: "Invalid answers"
        });
      }

      const questionResult = await db.query(
        `SELECT id, correct_index, explanation
         FROM topic_questions
         WHERE id = ANY($1::int[])
           AND topic_id = $2`,
        [session.questionIds, topicId]
      );

      const questionMap = new Map(
        questionResult.rows.map((q) => [q.id, q])
      );

      let correctAnswers = 0;
      const feedback = [];

      for (let i = 0; i < session.questionIds.length; i++) {
        const questionId = session.questionIds[i];
        const question = questionMap.get(questionId);

        if (!question) {
          return res.status(409).json({
            error: "Assessment questions have changed"
          });
        }

        const answer = answers[i];

        if (
          !Number.isInteger(answer) ||
          answer < -1 ||
          answer > 3
        ) {
          return res.status(400).json({
            error: "Invalid answer option"
          });
        }

        const isCorrect = answer === question.correct_index;

        if (isCorrect) correctAnswers++;

        feedback.push({
          questionId,
          selectedIndex: answer,
          correctIndex: question.correct_index,
          isCorrect,
          explanation: question.explanation
        });
      }

      const totalQuestions = session.questionIds.length;

      const score = Number(
        ((correctAnswers / totalQuestions) * 100).toFixed(2)
      );

      await db.query(
        `INSERT INTO topic_assessment_attempts
           (user_id, topic_id, score,
            total_questions, correct_answers)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          req.user.id,
          topicId,
          score,
          totalQuestions,
          correctAnswers
        ]
      );

      // Prevent the same session from being submitted again.
      assessmentSessions.delete(assessmentId);

      res.json({
        score,
        totalQuestions,
        correctAnswers,
        passed: score >= 70,
        feedback
      });
    } catch (error) {
      console.error("Submit assessment error:", error);

      res.status(500).json({
        error: "Unable to submit assessment"
      });
    }
  }
);
router.get('/skills', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.id, s.name, COUNT(t.id)::int AS topic_count
      FROM skills s
      LEFT JOIN topics t ON t.skill_id = s.id
      GROUP BY s.id, s.name
      ORDER BY s.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('List curriculum skills error:', error);
    res.status(500).json({ error: 'Unable to load curriculum skills' });
  }
});

module.exports = router;
