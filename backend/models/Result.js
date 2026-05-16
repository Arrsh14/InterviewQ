// models/Result.js
// Stores the final computed AI evaluation report for one interview session.
// This is what the Results page reads after aiController finishes scoring.

const mongoose = require("mongoose");

// ── Per-question score breakdown ──────────────────────────────────────────────
const questionScoreSchema = new mongoose.Schema(
  {
    questionIndex:  { type: Number, required: true },
    questionText:   { type: String, default: ""    },
    questionType:   { type: String, default: "Behavioral" },
    transcript:     { type: String, default: ""    },
    wordCount:      { type: Number, default: 0     },
    contentScore:   { type: Number, default: 0     }, // 0-100
    deliveryScore:  { type: Number, default: 0     }, // 0-100
    attentionScore: { type: Number, default: 0     }, // 0-100
  },
  { _id: false }
);

// ── Main Result schema ────────────────────────────────────────────────────────
const resultSchema = new mongoose.Schema(
  {
    interview: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Interview",
      required: true,
      unique:   true,   // one result per interview
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    // ── Top-level scores (0-100) ──────────────────────────────────────────────
    overallScore:       { type: Number, default: 0 },
    confidenceScore:    { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    attentionScore:     { type: Number, default: 0 },

    // ── Six dimension scores (0-100) ──────────────────────────────────────────
    dimensions: {
      subjectMatterAuthority: { type: Number, default: 0 },
      persuasiveAuthority:    { type: Number, default: 0 },
      answerArchitecture:     { type: Number, default: 0 },
      presenceEngagement:     { type: Number, default: 0 },
      responseTiming:         { type: Number, default: 0 },
      emotionalIntelligence:  { type: Number, default: 0 },
    },

    // ── Per-question breakdown (for the bar chart on Results page) ────────────
    questionScores: [questionScoreSchema],

    // ── AI-generated feedback text (from OpenAI) ──────────────────────────────
    aiFeedback: {
      contentQuality:  { type: String, default: "" },
      vocalDelivery:   { type: String, default: "" },
      bodyLanguage:    { type: String, default: "" },
      answerStructure: { type: String, default: "" },
      summary:         { type: String, default: "" },
    },

    // ── Session metadata ──────────────────────────────────────────────────────
    durationSeconds:    { type: Number, default: 0 },
    questionsAnswered:  { type: Number, default: 0 },
    questionsTotal:     { type: Number, default: 5 },
    eyeContactWarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);