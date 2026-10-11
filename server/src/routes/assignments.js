
const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Get assignments for a curriculum topic
router.get("/topics/:topicId", auth, async (req, res) => {
  try {
    const topicId = Number(req.params.topicId);

    if (!Number.isSafeInteger(topicId) || topicId <= 0) {
      return res.status(400).json({ error: "Invalid topic ID" });
    }

    const result = await db.query(
      `SELECT a.id, a.topic_id, a.title, a.description,
              a.instructions, a.difficulty,
              s.submission_url, s.notes, s.status, s.submitted_at
       FROM topic_assignments a
       LEFT JOIN assignment_submissions s
         ON s.assignment_id = a.id AND s.user_id = $2
       WHERE a.topic_id = $1
       ORDER BY a.id`,
      [topicId, req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Load assignments error:", error);
    res.status(500).json({ error: "Unable to load assignments" });
  }
});

// Save or submit a practical assignment
router.post("/:assignmentId/submit", auth, async (req, res) => {
  try {
    const assignmentId = Number(req.params.assignmentId);
    const { submission_url, notes, status } = req.body || {};

    if (!Number.isSafeInteger(assignmentId) || assignmentId <= 0) {
      return res.status(400).json({ error: "Invalid assignment ID" });
    }

    if (!["in_progress", "submitted"].includes(status)) {
      return res.status(400).json({ error: "Invalid submission status" });
    }

    if (typeof submission_url !== "string" ||
        typeof notes !== "string" ||
        submission_url.length > 2048 ||
        notes.length > 5000) {
      return res.status(400).json({ error: "Invalid submission details" });
    }

    if (status === "submitted") {
      try {
        const url = new URL(submission_url);
        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        return res.status(400).json({
          error: "A valid HTTP or HTTPS project URL is required"
        });
      }
    }

    const result = await db.query(
      `INSERT INTO assignment_submissions
         (assignment_id, user_id, submission_url, notes,
          status, submitted_at)
       SELECT id, $2, $3, $4, $5,
              CASE WHEN $5::varchar = 'submitted' THEN NOW() ELSE NULL END
       FROM topic_assignments
       WHERE id = $1
       ON CONFLICT (assignment_id, user_id)
       DO UPDATE SET
         submission_url = EXCLUDED.submission_url,
         notes = EXCLUDED.notes,
         status = EXCLUDED.status,
         submitted_at = EXCLUDED.submitted_at,
         updated_at = NOW()
       RETURNING *`,
      [assignmentId, req.user.id, submission_url, notes, status]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Submit assignment error:", error);
    res.status(500).json({ error: "Unable to save assignment" });
  }
});

router.get("/my", auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         a.id,
         a.topic_id,
         a.title,
         a.description,
         a.difficulty,
         t.title AS topic_name,
         COALESCE(s.status, 'not_started') AS status,
         s.submission_url,
         s.notes,
         s.submitted_at
       FROM topic_assignments a
       JOIN topics t ON t.id = a.topic_id
       LEFT JOIN assignment_submissions s
         ON s.assignment_id = a.id
         AND s.user_id = $1
       ORDER BY a.id DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("My assignments error:", error);
    res.status(500).json({
      error: "Unable to load assignments"
    });
  }
});

module.exports = router;
