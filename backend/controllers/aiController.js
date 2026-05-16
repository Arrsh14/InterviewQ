// controllers/aiController.js
// The core AI evaluation controller.
// Receives a completed interview session, runs scoring across all dimensions,
// stores results, and returns the full performance report.
//
// Flow:
//   Frontend calls POST /api/ai/evaluate/:interviewId
//   → this controller fetches all answers
//   → calls scoringService  (calculates dimension scores)
//   → calls openaiService   (generates natural language feedback)
//   → saves scores to Interview document
//   → updates user's average score
//   → returns full result to frontend

const Interview = require("../models/Interview");
const User      = require("../models/User");

// Services (we will build these in the services/ step)
// Using try/require so the controller still loads even if services aren't built yet
let scoringService, openaiService, nlpService;
try { scoringService = require("../services/scoringService"); } catch (_) {}
try { openaiService = require("../services/geminiService"); } catch (_) {}
try { nlpService     = require("../services/nlpService");     } catch (_) {}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/evaluate/:interviewId
// Main evaluation endpoint — call this after interview is completed
// Body: { eyeContactScore, facialEngagementScore }  ← from frontend vision
// ─────────────────────────────────────────────────────────────────────────────
const evaluateInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Pull in optional vision scores sent from the frontend webcam module
    // These default to 0 until the vision module is connected
    const {
      eyeContactScore       = 0,   // 0-100 from frontend face tracking
      facialEngagementScore = 0,   // 0-100 from frontend face tracking
    } = req.body;

    // ── 1. Fetch the completed interview with all answers ──────────────────
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    if (interview.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Interview must be completed before evaluation",
      });
    }

    // ── 2. Collect all transcript text ────────────────────────────────────
    const allTranscripts = interview.answers.map((a) => ({
      question:   a.questionText,
      answer:     a.transcript,
      type:       a.questionType,
      wordCount:  a.wordCount,
    }));

    const combinedText = allTranscripts
      .map((t) => `Q: ${t.question}\nA: ${t.answer}`)
      .join("\n\n");

    // ── 3. Run NLP analysis on transcript text ────────────────────────────
    // nlpService returns: { fillerWordRate, avgSentenceLength, vocabularyScore }
    let nlpScores = { fillerWordRate: 0, avgSentenceLength: 0, vocabularyScore: 0 };
    if (nlpService && combinedText.trim()) {
      nlpScores = nlpService.analyzeText(combinedText);
    }

    // ── 4. Calculate all dimension scores ────────────────────────────────
    // scoringService fuses NLP + vision + answer length into 0-100 scores
    let dimensionScores = {
      subjectMatterAuthority: 0,
      persuasiveAuthority:    0,
      answerArchitecture:     0,
      presenceEngagement:     0,
      responseTiming:         0,
      emotionalIntelligence:  0,
    };

    if (scoringService) {
      dimensionScores = scoringService.calculateDimensions({
        nlpScores,
        eyeContactScore,
        facialEngagementScore,
        answers:         allTranscripts,
        durationSeconds: interview.durationSeconds,
        warnings:        interview.eyeContactWarnings,
      });
    }

    // ── 5. Calculate top-level scores ────────────────────────────────────
    // Weighted formula — tune weights here as you gather real data
    const confidenceScore = Math.round(
      (dimensionScores.persuasiveAuthority * 0.4) +
      (eyeContactScore                     * 0.3) +
      (dimensionScores.presenceEngagement  * 0.3)
    );

    const communicationScore = Math.round(
      (dimensionScores.subjectMatterAuthority * 0.35) +
      (dimensionScores.answerArchitecture     * 0.35) +
      (nlpScores.vocabularyScore              * 0.30)
    );

    const attentionScore = Math.round(
      (eyeContactScore                       * 0.5) +
      (facialEngagementScore                 * 0.3) +
      (dimensionScores.emotionalIntelligence * 0.2)
    );

    // Overall = weighted average of the 3 top scores
    const overallScore = Math.round(
      (confidenceScore    * 0.33) +
      (communicationScore * 0.34) +
      (attentionScore     * 0.33)
    );

    // ── 6. Generate AI feedback text ─────────────────────────────────────
    let aiFeedback = {
      contentQuality:  "Complete an interview session to receive content feedback.",
      vocalDelivery:   "Speech data will be analysed in your next session.",
      bodyLanguage:    "Enable webcam for facial engagement analysis.",
      answerStructure: "Answer structure feedback will appear after evaluation.",
      summary:         "No session data yet.",
    };

    if (openaiService && combinedText.trim()) {
      // openaiService.generateFeedback returns the aiFeedback object above
      aiFeedback = await openaiService.generateFeedback({
        transcripts:    allTranscripts,
        overallScore,
        confidenceScore,
        communicationScore,
        attentionScore,
        dimensionScores,
      });
    }

    // ── 7. Save everything back to the Interview document ─────────────────
    interview.overallScore       = overallScore;
    interview.confidenceScore    = confidenceScore;
    interview.communicationScore = communicationScore;
    interview.attentionScore     = attentionScore;
    interview.dimensions         = dimensionScores;
    interview.aiFeedback         = aiFeedback;

    await interview.save();

    // ── 8. Update user's running average score ────────────────────────────
    const user       = await User.findById(req.user.id);
    const totalSess  = user.totalSessions || 1;
    const prevAvg    = user.averageScore  || 0;

    // Rolling average formula: newAvg = ((prevAvg * (n-1)) + newScore) / n
    const newAverage = Math.round(
      ((prevAvg * (totalSess - 1)) + overallScore) / totalSess
    );

    await User.findByIdAndUpdate(req.user.id, { averageScore: newAverage });

    // ── 9. Return full result to frontend ─────────────────────────────────
    res.json({
      success: true,
      message: "Evaluation complete",
      result: {
        interviewId:        interview._id,
        overallScore,
        confidenceScore,
        communicationScore,
        attentionScore,
        dimensions:         dimensionScores,
        aiFeedback,
        durationSeconds:    interview.durationSeconds,
        questionsAnswered:  interview.questionsAnswered,
        eyeContactWarnings: interview.eyeContactWarnings,
      },
    });
  } catch (err) {
    console.error("evaluateInterview error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/feedback
// Standalone endpoint — generate quick feedback for a single answer
// Body: { question, answer, questionType }
// Useful for real-time "hint" feature during the interview
// ─────────────────────────────────────────────────────────────────────────────
const getQuickFeedback = async (req, res) => {
  try {
    const { question, answer, questionType = "Behavioral" } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "question and answer are required",
      });
    }

    // Placeholder response until openaiService is built
    // Replace the object below with: await openaiService.quickFeedback(...)
    const feedback = {
      score:       0,
      strengths:   ["Answer received — AI analysis pending"],
      improvements:["Connect OpenAI service to get real feedback"],
      tip:         `For a ${questionType} question, try the STAR method.`,
    };

    res.json({ success: true, feedback });
  } catch (err) {
    console.error("getQuickFeedback error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = { evaluateInterview, getQuickFeedback };