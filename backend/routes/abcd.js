// routes/analyticsRoutes.js
// All routes here are PROTECTED — user must be logged in
//
// GET /api/analytics/dashboard              → summary cards + trend + dimensions
// GET /api/analytics/history                → past sessions list
// GET /api/analytics/results/:interviewId   → full result for one session
// GET /api/analytics/progress               → score-over-time for all sessions

const express = require("express");
const router  = express.Router();

const {
  getDashboardStats,
  getSessionHistory,
  getSessionResult,
  getProgressOverTime,
} = require("../controllers/analyticsController");

const { protect } = require("../middleware/authMiddleware");

// ── GET /api/analytics/dashboard ─────────────────────────────────────────────
// Returns everything the Dashboard page needs in one call:
// summary cards, last 5 trend scores, dimension averages
router.get("/dashboard", protect, getDashboardStats);

// ── GET /api/analytics/history ───────────────────────────────────────────────
// Returns formatted list of all past sessions for the attempts table
router.get("/history", protect, getSessionHistory);

// ── GET /api/analytics/progress ──────────────────────────────────────────────
// Returns all sessions in chronological order for the progress graph
router.get("/progress", protect, getProgressOverTime);

// ── GET /api/analytics/results/:interviewId ──────────────────────────────────
// Returns full result breakdown for one specific session (Results page)
// NOTE: :interviewId must come AFTER the static routes above
//       otherwise Express would match "history" or "progress" as an :interviewId
router.get("/results/:interviewId", protect, getSessionResult);

module.exports = router;