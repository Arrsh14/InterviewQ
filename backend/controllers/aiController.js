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

    // ── 5. Extract NLP scores from saved answers ─────────────────────────
    // These were saved by InterviewPage when calling /analyse/nlp
    const answerNLPScores = interview.answers.map((a) => ({
      nlpScore:        a.nlpScore        || 0,
      fillerScore:     a.fillerScore     || 0,
      grammarScore:    a.grammarScore    || 0,
      confidenceScore: a.confidenceScore || 0,
    }));

    const avgNLP = (key) => answerNLPScores.length
      ? Math.round(answerNLPScores.reduce((s, a) => s + (a[key] || 0), 0) / answerNLPScores.length)
      : 0;

    const avgNLPScore        = avgNLP("nlpScore");
    const avgFillerScore     = avgNLP("fillerScore")  * 10; // convert /10 to /100
    const avgGrammarScore    = avgNLP("grammarScore") * 10;
    const avgConfidenceScore = avgNLP("confidenceScore") * 10;

    // ── 6. Calculate top-level scores using ALL 6 signals ──────────────────
    //
    // Signal sources:
    //   eyeContactScore      → ML server (MediaPipe face landmarks)
    //   facialEngagementScore → ML server (overall face analysis)
    //   postureScore from req → ML server (MediaPipe pose)
    //   avgConfidenceScore   → NLP Flask (weak word analysis)
    //   avgGrammarScore      → NLP Flask (grammar checker)
    //   avgFillerScore       → NLP Flask (filler word detector)
    //   avgNLPScore          → NLP Flask (combined NLP score)
    //   dimensionScores      → Rule-based scoring from answers
    //
    // ── Confidence Score ─────────────────────────────────────────────────────
    // What it measures: how confident the candidate sounds and looks
    //   40% → vocal confidence from text analysis (weak words, hedging)
    //   30% → eye contact (looking at camera = confident)
    //   20% → posture score (upright = confident)
    //   10% → presence & engagement dimension
    const postureFromReq = req.body.postureScore || 0;
    const confidenceScore = Math.round(
      (avgConfidenceScore  * 0.40) +
      (eyeContactScore     * 0.30) +
      (postureFromReq      * 0.20) +
      (dimensionScores.presenceEngagement * 0.10)
    );

    // ── Communication Score ───────────────────────────────────────────────────
    // What it measures: how clearly and effectively the candidate communicates
    //   25% → overall NLP quality (combined filler + grammar + confidence)
    //   25% → grammar correctness
    //   20% → filler word control (fewer fillers = better communication)
    //   20% → subject matter depth
    //   10% → answer architecture (STAR structure)
    const communicationScore = Math.round(
      (avgNLPScore                            * 0.25) +
      (avgGrammarScore                        * 0.25) +
      (avgFillerScore                         * 0.20) +
      (dimensionScores.subjectMatterAuthority * 0.20) +
      (dimensionScores.answerArchitecture     * 0.10)
    );

    // ── Attention Score ───────────────────────────────────────────────────────
    // What it measures: how engaged and focused the candidate appears
    //   40% → eye contact consistency throughout session
    //   30% → facial engagement (expressions, micro-movements)
    //   20% → emotional intelligence dimension
    //   10% → response timing (not too fast, not too slow)
    const attentionScore = Math.round(
      (eyeContactScore                       * 0.40) +
      (facialEngagementScore                 * 0.30) +
      (dimensionScores.emotionalIntelligence * 0.20) +
      (dimensionScores.responseTiming        * 0.10)
    );

    // ── Overall Score ─────────────────────────────────────────────────────────
    // Direct weighted fusion of all 6 raw signals
    //   20% → eye contact        (vision)
    //   15% → NLP score          (language quality)
    //   15% → grammar            (language correctness)
    //   15% → vocal confidence   (language confidence)
    //   15% → filler control     (speech fluency)
    //   10% → posture            (body language)
    //   10% → facial engagement  (facial behaviour)
    const overallScore = Math.round(
      (eyeContactScore     * 0.20) +
      (avgNLPScore         * 0.15) +
      (avgGrammarScore     * 0.15) +
      (avgConfidenceScore  * 0.15) +
      (avgFillerScore      * 0.15) +
      (postureFromReq      * 0.10) +
      (facialEngagementScore * 0.10)
    );

    // ── Clamp all scores to 0-100 range ───────────────────────────────────────
    const clamp = (v) => Math.min(100, Math.max(0, v));

    const finalScores = {
      overallScore:       clamp(overallScore),
      confidenceScore:    clamp(confidenceScore),
      communicationScore: clamp(communicationScore),
      attentionScore:     clamp(attentionScore),
    };

    console.log("\n📊 SCORING BREAKDOWN");
    console.log("─────────────────────────────────────");
    console.log("Vision signals:");
    console.log("  Eye Contact:       ", eyeContactScore);
    console.log("  Facial Engagement: ", facialEngagementScore);
    console.log("  Posture:           ", postureFromReq);
    console.log("NLP signals:");
    console.log("  NLP Score:         ", avgNLPScore);
    console.log("  Grammar Score:     ", avgGrammarScore);
    console.log("  Filler Score:      ", avgFillerScore);
    console.log("  Confidence Score:  ", avgConfidenceScore);
    console.log("Final scores:");
    console.log("  Overall:           ", finalScores.overallScore);
    console.log("  Confidence:        ", finalScores.confidenceScore);
    console.log("  Communication:     ", finalScores.communicationScore);
    console.log("  Attention:         ", finalScores.attentionScore);
    console.log("─────────────────────────────────────\n");

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
        overallScore:       finalScores.overallScore,
        confidenceScore:    finalScores.confidenceScore,
        communicationScore: finalScores.communicationScore,
        attentionScore:     finalScores.attentionScore,
        dimensionScores,
      });
    }

    // ── 7. Save everything back to the Interview document ─────────────────
    interview.overallScore       = finalScores.overallScore;
    interview.confidenceScore    = finalScores.confidenceScore;
    interview.communicationScore = finalScores.communicationScore;
    interview.attentionScore     = finalScores.attentionScore;
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
        overallScore:       finalScores.overallScore,
        confidenceScore:    finalScores.confidenceScore,
        communicationScore: finalScores.communicationScore,
        attentionScore:     finalScores.attentionScore,
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