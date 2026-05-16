// controllers/transcriptController.js
// Handles saving and retrieving the spoken/typed transcript
// for each question during a live interview session.
//
// Why separate from interviewController?
//   Transcripts can be updated many times as the user speaks
//   (e.g. live speech-to-text updating every few seconds).
//   Keeping them separate prevents constantly rewriting the
//   whole Interview document and makes the API cleaner.

const Interview = require("../models/Interview");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/transcripts/:interviewId/save
// Save or update the transcript for one specific question
// Body: { questionIndex, text }
// Called repeatedly during speech-to-text as the user speaks
// ─────────────────────────────────────────────────────────────────────────────
const saveTranscript = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { questionIndex, text = "" } = req.body;

    // Basic validation
    if (questionIndex === undefined || questionIndex === null) {
      return res.status(400).json({
        success: false,
        message: "questionIndex is required",
      });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    // Count words in the transcript
    const wordCount = text.trim()
      ? text.trim().split(/\s+/).length
      : 0;

    // Check if this question already has an answer saved
    const existingIdx = interview.answers.findIndex(
      (a) => a.questionIndex === questionIndex
    );

    if (existingIdx !== -1) {
      // Update just the transcript and wordCount fields
      interview.answers[existingIdx].transcript = text;
      interview.answers[existingIdx].wordCount  = wordCount;
    } else {
      // No answer exists yet for this question — create a placeholder
      interview.answers.push({
        questionIndex,
        questionText: `Question ${questionIndex + 1}`,  // will be overwritten by saveAnswer
        questionType: "Behavioral",
        transcript:   text,
        wordCount,
      });
    }

    // Mark that Mongoose needs to save the nested array
    interview.markModified("answers");
    await interview.save();

    res.json({
      success:    true,
      message:    "Transcript saved",
      wordCount,
      questionIndex,
    });
  } catch (err) {
    console.error("saveTranscript error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transcripts/:interviewId
// Returns all saved transcripts for a session
// Used by the Results page to show full answer history
// ─────────────────────────────────────────────────────────────────────────────
const getTranscripts = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId).select("answers user");

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    // Return answers sorted by question index
    const transcripts = [...interview.answers].sort(
      (a, b) => a.questionIndex - b.questionIndex
    );

    res.json({
      success:     true,
      count:       transcripts.length,
      transcripts: transcripts.map((t) => ({
        questionIndex: t.questionIndex,
        questionText:  t.questionText,
        questionType:  t.questionType,
        transcript:    t.transcript,
        wordCount:     t.wordCount,
      })),
    });
  } catch (err) {
    console.error("getTranscripts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/transcripts/:interviewId/question/:questionIndex
// Returns the transcript for one specific question
// ─────────────────────────────────────────────────────────────────────────────
const getTranscriptByQuestion = async (req, res) => {
  try {
    const { interviewId, questionIndex } = req.params;
    const qIdx = parseInt(questionIndex, 10);

    const interview = await Interview.findById(interviewId).select("answers user");

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    const answer = interview.answers.find((a) => a.questionIndex === qIdx);

    if (!answer) {
      return res.status(404).json({
        success:    false,
        message:    `No transcript found for question ${qIdx + 1}`,
        transcript: "",
        wordCount:  0,
      });
    }

    res.json({
      success:       true,
      questionIndex: answer.questionIndex,
      questionText:  answer.questionText,
      transcript:    answer.transcript,
      wordCount:     answer.wordCount,
    });
  } catch (err) {
    console.error("getTranscriptByQuestion error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/transcripts/:interviewId/question/:questionIndex
// Clears the transcript for one question (user wants to redo their answer)
// ─────────────────────────────────────────────────────────────────────────────
const clearTranscript = async (req, res) => {
  try {
    const { interviewId, questionIndex } = req.params;
    const qIdx = parseInt(questionIndex, 10);

    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    const idx = interview.answers.findIndex((a) => a.questionIndex === qIdx);

    if (idx !== -1) {
      interview.answers[idx].transcript = "";
      interview.answers[idx].wordCount  = 0;
      interview.markModified("answers");
      await interview.save();
    }

    res.json({
      success:       true,
      message:       `Transcript cleared for question ${qIdx + 1}`,
      questionIndex: qIdx,
    });
  } catch (err) {
    console.error("clearTranscript error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  saveTranscript,
  getTranscripts,
  getTranscriptByQuestion,
  clearTranscript,
};