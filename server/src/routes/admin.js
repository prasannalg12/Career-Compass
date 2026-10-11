
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Protect every admin route
router.use(auth, admin);

// Verify administrator access
router.get("/status", (req, res) => {
  res.json({
    success: true,
    message: "Admin access verified",
    userId: req.user.id
  });
});

module.exports = router;
