const mongoose = require("mongoose");

// ── Sub-schema: one answered question ────────────────────────────────────────
const questionAnswerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    questionText:  { type: String, required: true },
    questionType:  {
      type: String,
      enum: ["Behavioral", "Situational", "Motivational", "Career", "Technical"],
      default: "Behavioral",
    },
    transcript: { type: String, default: "" },   // user's spoken/typed answer
    wordCount:  { type: Number, default: 0  },
    // AI scores per question (0–100) — populated by AI module
    contentScore:    { type: Number, default: 0 },
    deliveryScore:   { type: Number, default: 0 },
    attentionScore:  { type: Number, default: 0 },
  },
  { _id: false }
);

// ── Main Interview schema ─────────────────────────────────────────────────────
const interviewSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    role:   { type: String, default: "General Interview" },
    status: {
      type:    String,
      enum:    ["in-progress", "completed", "abandoned"],
      default: "in-progress",
    },

    // ── Question answers ─────────────────────────────────────────────────────
    answers: [questionAnswerSchema],

    // ── Session metadata ─────────────────────────────────────────────────────
    durationSeconds: { type: Number, default: 0 },
    questionsTotal:  { type: Number, default: 5  },
    questionsAnswered: { type: Number, default: 0 },

    // ── Aggregate AI scores (0–100) — set when status = "completed" ──────────
    overallScore:       { type: Number, default: 0 },
    confidenceScore:    { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    attentionScore:     { type: Number, default: 0 },

    // ── Dimension scores ─────────────────────────────────────────────────────
    dimensions: {
      subjectMatterAuthority: { type: Number, default: 0 },
      persuasiveAuthority:    { type: Number, default: 0 },
      answerArchitecture:     { type: Number, default: 0 },
      presenceEngagement:     { type: Number, default: 0 },
      responseTiming:         { type: Number, default: 0 },
      emotionalIntelligence:  { type: Number, default: 0 },
    },

    // ── AI feedback text ─────────────────────────────────────────────────────
    aiFeedback: {
      contentQuality:  { type: String, default: "" },
      vocalDelivery:   { type: String, default: "" },
      bodyLanguage:    { type: String, default: "" },
      answerStructure: { type: String, default: "" },
      summary:         { type: String, default: "" },
    },

    // ── Eye-contact events logged during session ──────────────────────────────
    eyeContactWarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);