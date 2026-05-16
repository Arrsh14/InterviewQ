// routes/transcriptRoutes.js
// All routes here are PROTECTED — user must be logged in
//
// POST   /api/transcripts/:interviewId/save                    → save/update transcript
// GET    /api/transcripts/:interviewId                         → get all transcripts
// GET    /api/transcripts/:interviewId/question/:questionIndex → get one question's transcript
// DELETE /api/transcripts/:interviewId/question/:questionIndex → clear one transcript

const express = require("express");
const router  = express.Router();

const {
  saveTranscript,
  getTranscripts,
  getTranscriptByQuestion,
  clearTranscript,
} = require("../controllers/transcriptController");

const { protect } = require("../middleware/authMiddleware");

// ── POST /api/transcripts/:interviewId/save ───────────────────────────────────
// Called repeatedly during speech-to-text as the user speaks
// Body: { questionIndex, text }
router.post("/:interviewId/save", protect, saveTranscript);

// ── GET /api/transcripts/:interviewId ─────────────────────────────────────────
// Returns all saved transcripts for a session, sorted by question index
router.get("/:interviewId", protect, getTranscripts);

// ── GET /api/transcripts/:interviewId/question/:questionIndex ─────────────────
// Returns the transcript for one specific question
router.get("/:interviewId/question/:questionIndex", protect, getTranscriptByQuestion);

// ── DELETE /api/transcripts/:interviewId/question/:questionIndex ──────────────
// Clears a question's transcript so user can redo their answer
router.delete("/:interviewId/question/:questionIndex", protect, clearTranscript);

module.exports = router;