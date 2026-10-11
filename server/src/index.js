
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// ========================================
// CORS Configuration
// ========================================

// Allowed website and extension origins
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  process.env.EXTENSION_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      if (!origin) {
        return callback(null, true);
      }

      // Allow approved websites and extension
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Block other origins
      return callback(new Error("Origin not allowed by CORS"));
    },
  })
);

// ========================================
// Middleware
// ========================================

// Parse incoming JSON requests
app.use(express.json());

// ========================================
// Health Check
// ========================================

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
  });
});

// ========================================
// API Routes
// ========================================

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

// ========================================
// Global Error Handler
// ========================================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error:
      "Something went wrong on our side. Please try again.",
  });
});

// ========================================
// Start Backend Server
// ========================================

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(
    `CareerCompass API running on port ${port}`
  );
});
