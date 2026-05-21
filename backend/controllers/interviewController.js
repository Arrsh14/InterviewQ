// controllers/interviewController.js
// Handles the full lifecycle of one interview session:
//   start → save answers → complete → fetch history

const Interview = require("../models/Interview");
const User      = require("../models/User");

// ─────────────────────────────────────────────────────────────────────────────
// Hardcoded question bank (replace with DB-driven questions later)
// ─────────────────────────────────────────────────────────────────────────────
const QUESTION_BANK = [
  {
    text: "Tell me about yourself and your background.",
    type: "Behavioral",
    tip:  "Use the Present–Past–Future structure. Keep it under 2 minutes.",
  },
  {
    text: "Describe a challenging situation you faced and how you resolved it.",
    type: "Situational",
    tip:  "Use the STAR method: Situation, Task, Action, Result.",
  },
  {
    text: "Why are you interested in this role and this company?",
    type: "Motivational",
    tip:  "Research the company beforehand. Show genuine enthusiasm.",
  },
  {
    text: "Where do you see yourself in five years?",
    type: "Career",
    tip:  "Align your goals with what the company can offer.",
  },
  {
    text: "What is your greatest professional strength, and give an example of it in action?",
    type: "Behavioral",
    tip:  "Pick a strength directly relevant to the role.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/interviews/start
// Creates a new interview session for the logged-in user
// Body: { role }   (optional — e.g. "Software Engineer – Google")
// ─────────────────────────────────────────────────────────────────────────────
const startInterview = async (req, res) => {
  try {
    const { role = "General Interview" } = req.body;

    // Create a fresh session in the DB
    const interview = await Interview.create({
      user:           req.user.id,
      role,
      status:         "in-progress",
      questionsTotal: QUESTION_BANK.length,
      answers:        [],   // empty — filled as user answers each question
    });

    res.status(201).json({
      success:   true,
      message:   "Interview session started",
      interview: {
        id:             interview._id,
        role:           interview.role,
        status:         interview.status,
        questionsTotal: interview.questionsTotal,
      },
      // Send all questions to the frontend at once
      questions: QUESTION_BANK.map((q, i) => ({
        index: i,
        text:  q.text,
        type:  q.type,
        tip:   q.tip,
      })),
    });
  } catch (err) {
    console.error("startInterview error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/interviews/:id/answer
// Saves the user's answer for one question
// Body: { questionIndex, questionText, questionType, transcript, wordCount }
// ─────────────────────────────────────────────────────────────────────────────
const saveAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      questionIndex,
      questionText,
      questionType,
      transcript      = "",
      wordCount       = 0,
      // Vision scores from ML server
      eyeContactScore = 0,
      postureScore    = 0,
      // NLP scores from Flask /analyse/nlp
      nlpScore        = 0,
      fillerScore     = 0,
      grammarScore    = 0,
      confidenceScore = 0,
    } = req.body;

    // Find the session and make sure it belongs to this user
    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview session not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    if (interview.status !== "in-progress") {
      return res.status(400).json({ success: false, message: "This session is already completed" });
    }

    // Check if an answer for this question index already exists
    const existingIndex = interview.answers.findIndex(
      (a) => a.questionIndex === questionIndex
    );

    if (existingIndex !== -1) {
      // Update existing answer
      interview.answers[existingIndex].transcript      = transcript;
      interview.answers[existingIndex].wordCount       = wordCount;
      interview.answers[existingIndex].eyeContactScore = eyeContactScore;
      interview.answers[existingIndex].postureScore    = postureScore;
      interview.answers[existingIndex].nlpScore        = nlpScore;
      interview.answers[existingIndex].fillerScore     = fillerScore;
      interview.answers[existingIndex].grammarScore    = grammarScore;
      interview.answers[existingIndex].confidenceScore = confidenceScore;
    } else {
      // Push new answer
      interview.answers.push({
        questionIndex,
        questionText,
        questionType: questionType || "Behavioral",
        transcript,
        wordCount,
        eyeContactScore,
        postureScore,
        nlpScore,
        fillerScore,
        grammarScore,
        confidenceScore,
      });
    }

    // Update answered count
    interview.questionsAnswered = interview.answers.length;

    await interview.save();

    res.json({
      success:          true,
      message:          `Answer saved for question ${questionIndex + 1}`,
      questionsAnswered: interview.questionsAnswered,
      questionsTotal:    interview.questionsTotal,
    });
  } catch (err) {
    console.error("saveAnswer error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/interviews/:id/complete
// Marks session as completed and records duration + eye-contact warnings
// Body: { durationSeconds, eyeContactWarnings }
// NOTE: actual AI scoring happens in aiController — this just closes the session
// ─────────────────────────────────────────────────────────────────────────────
const completeInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { durationSeconds = 0, eyeContactWarnings = 0 } = req.body;

    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview session not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    // Mark completed
    interview.status              = "completed";
    interview.durationSeconds     = durationSeconds;
    interview.eyeContactWarnings  = eyeContactWarnings;
    interview.questionsAnswered   = interview.answers.length;

    await interview.save();

    // Increment user's total session count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalSessions: 1 },
    });

    res.json({
      success:     true,
      message:     "Interview completed — ready for AI evaluation",
      interviewId: interview._id,
      answered:    interview.questionsAnswered,
      total:       interview.questionsTotal,
      duration:    interview.durationSeconds,
    });
  } catch (err) {
    console.error("completeInterview error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/interviews
// Returns all sessions for the logged-in user (for Dashboard history list)
// ─────────────────────────────────────────────────────────────────────────────
const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id })
      .sort({ createdAt: -1 })   // newest first
      .select(
       "role status overallScore communicationScore confidenceScore attentionScore aiFeedback durationSeconds questionsAnswered questionsTotal createdAt"
      );

    res.json({
      success:    true,
      count:      interviews.length,
      interviews,
    });
  } catch (err) {
    console.error("getMyInterviews error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/interviews/:id
// Returns full detail of one session (for Results page)
// ─────────────────────────────────────────────────────────────────────────────
const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    res.json({ success: true, interview });
  } catch (err) {
    console.error("getInterviewById error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/interviews/:id
// Deletes a session (user can clean up their history)
// ─────────────────────────────────────────────────────────────────────────────
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    await interview.deleteOne();

    res.json({ success: true, message: "Interview session deleted" });
  } catch (err) {
    console.error("deleteInterview error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  startInterview,
  saveAnswer,
  completeInterview,
  getMyInterviews,
  getInterviewById,
  deleteInterview,
};