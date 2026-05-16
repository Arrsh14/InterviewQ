// routes/aiRoutes.js
// All routes here are PROTECTED — user must be logged in
//
// POST /api/ai/evaluate/:interviewId  → run full multimodal scoring
// POST /api/ai/feedback               → get quick feedback for one answer

const express = require("express");
const router  = express.Router();

const {
  evaluateInterview,
  getQuickFeedback,
} = require("../controllers/aiController");

const { protect } = require("../middleware/authMiddleware");

// ── POST /api/ai/evaluate/:interviewId ───────────────────────────────────────
// Call this after interview is completed
// Runs NLP + scoring + OpenAI feedback, saves everything to DB
// Body: { eyeContactScore, facialEngagementScore }
router.post("/evaluate/:interviewId", protect, evaluateInterview);

// ── POST /api/ai/feedback ─────────────────────────────────────────────────────
// Quick feedback for a single answer — used for real-time hints
// Body: { question, answer, questionType }
router.post("/feedback", protect, getQuickFeedback);

module.exports = router;