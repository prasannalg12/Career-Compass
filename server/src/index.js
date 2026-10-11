
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// CORS configuration for website and Chrome extension
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      if (!origin) {
        return callback(null, true);
      }

      // Allow CareerCompass local website
      if (origin === "http://localhost:5173") {
        return callback(null, true);
      }

      // Allow Chrome extensions during local development
      if (origin.startsWith("chrome-extension://")) {
        return callback(null, true);
      }

      return callback(null, false);
    },
  })
);

// Parse incoming JSON requests
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Authentication routes
app.use("/api/auth", require("./routes/auth"));

// Career guidance routes
app.use("/api/careers", require("./routes/careers"));

// Skills routes
app.use("/api/skills", require("./routes/skills"));

// Personalized roadmaps
app.use("/api/roadmaps", require("./routes/roadmaps"));

// Curriculum routes
app.use("/api/curriculum", require("./routes/curriculum"));

// Topic assessments
app.use("/api/assessments", require("./routes/assessments"));

// Admin routes
app.use("/api/admin", require("./routes/admin"));

// Practical assignments
app.use("/api/assignments", require("./routes/assignments"));


// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: "Something went wrong on our side. Please try again.",
  });
});

// Start backend server
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(
    "CareerCompass API on http://localhost:" + port
  );
});
