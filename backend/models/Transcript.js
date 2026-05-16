// models/Transcript.js
// Stores the spoken/typed transcript for each question in a session.
// Kept separate from Interview.js so large text doesn't bloat the main document.

const mongoose = require("mongoose");

const transcriptSchema = new mongoose.Schema(
  {
    interview: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Interview",
      required: true,
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    questionIndex: {
      type:     Number,
      required: true,
    },
    questionText: {
      type:    String,
      default: "",
    },
    questionType: {
      type:    String,
      enum:    ["Behavioral", "Situational", "Motivational", "Career", "Technical"],
      default: "Behavioral",
    },
    // The actual spoken/typed answer text
    text: {
      type:    String,
      default: "",
    },
    wordCount: {
      type:    Number,
      default: 0,
    },
    // Duration the user spent on this question (seconds)
    durationSeconds: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ── Compound index: one transcript per question per interview ─────────────────
// Prevents duplicate transcripts for the same question in the same session
transcriptSchema.index({ interview: 1, questionIndex: 1 }, { unique: true });

module.exports = mongoose.model("Transcript", transcriptSchema);