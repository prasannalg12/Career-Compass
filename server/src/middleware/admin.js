
const db = require("../db");

async function admin(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: "Authentication required"
      });
    }

    const result = await db.query(
      "SELECT role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "User not found"
      });
    }

    if (result.rows[0].role !== "admin") {
      return res.status(403).json({
        error: "Admin access required"
      });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);

    res.status(500).json({
      error: "Unable to verify admin permissions"
    });
  }
}

module.exports = admin;
