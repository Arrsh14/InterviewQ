// routes/interviewRoutes.js
// All routes here are PROTECTED — user must be logged in
//
// POST   /api/interviews/start        → create new session
// PUT    /api/interviews/:id/answer   → save one answer
// PUT    /api/interviews/:id/complete → mark session as completed
// GET    /api/interviews              → get all sessions for user
// GET    /api/interviews/:id          → get one session by id
// DELETE /api/interviews/:id          → delete a session

const express = require("express");
const router  = express.Router();

const {
  startInterview,
  saveAnswer,
  completeInterview,
  getMyInterviews,
  getInterviewById,
  deleteInterview,
} = require("../controllers/interviewController");

const { protect } = require("../middleware/authMiddleware");

// All routes protected
router.use(protect);

// ── POST /api/interviews/start ────────────────────────────────────────────────
// Creates a new interview session
// Body: { role }
router.post("/start", startInterview);

// ── PUT /api/interviews/:id/answer ────────────────────────────────────────────
// Saves one answer during the interview
// Body: { questionIndex, questionText, questionType, transcript, wordCount }
router.put("/:id/answer", saveAnswer);

// ── PUT /api/interviews/:id/complete ─────────────────────────────────────────
// Marks interview as completed
// Body: { durationSeconds, eyeContactWarnings }
router.put("/:id/complete", completeInterview);

// ── GET /api/interviews ───────────────────────────────────────────────────────
// Returns all sessions for logged-in user
router.get("/", getMyInterviews);

// ── GET /api/interviews/:id ───────────────────────────────────────────────────
// Returns one session by id
router.get("/:id", getInterviewById);

// ── DELETE /api/interviews/:id ────────────────────────────────────────────────
// Deletes a session
router.delete("/:id", deleteInterview);

module.exports = router;