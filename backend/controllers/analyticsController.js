// controllers/analyticsController.js
// Powers all the charts and stats on the Dashboard and Results pages.
// Every function reads from completed Interview documents for this user
// and returns pre-computed numbers the frontend just needs to display.

const Interview = require("../models/Interview");
const User      = require("../models/User");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/dashboard
// Returns everything the Dashboard page needs in one call:
//   - summary cards (overall, articulate, presence, precision)
//   - last 5 session scores for the trend chart
//   - dimension averages for the progress bars
//   - total session count and average score
// ─────────────────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    // Fetch all COMPLETED sessions for this user, newest first
    const sessions = await Interview.find({
      user:   req.user.id,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .select(
        "role overallScore confidenceScore communicationScore attentionScore " +
        "dimensions durationSeconds createdAt questionsAnswered eyeContactWarnings"
      );

    const total = sessions.length;

    // ── If no sessions yet return zeroed data ─────────────────────────────
    if (total === 0) {
      return res.json({
        success: true,
        data: {
          summaryCards: {
            overallScore:       0,
            articulateDelivery: 0,
            presenceEngagement: 0,
            discoursePrecision: 0,
          },
          trendScores:   [],   // empty → frontend shows ghost bars
          dimensions: {
            subjectMatterAuthority: 0,
            persuasiveAuthority:    0,
            answerArchitecture:     0,
            presenceEngagement:     0,
            responseTiming:         0,
            emotionalIntelligence:  0,
          },
          totalSessions:  0,
          averageScore:   0,
          bestScore:      0,
          improvement:    0,
        },
      });
    }

    // ── Helper: average an array of numbers ───────────────────────────────
    const avg = (arr) =>
      arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;

    // ── Summary card values (averages across all sessions) ────────────────
    const summaryCards = {
      overallScore:       avg(sessions.map((s) => s.overallScore)),
      articulateDelivery: avg(sessions.map((s) => s.communicationScore)),
      presenceEngagement: avg(sessions.map((s) => s.attentionScore)),
      discoursePrecision: avg(sessions.map((s) => s.confidenceScore)),
    };

    // ── Last 5 session scores for the trend bar chart ─────────────────────
    const trendScores = sessions.slice(0, 5).reverse().map((s) => ({
      id:    s._id,
      role:  s.role,
      score: s.overallScore,
      date:  s.createdAt.toLocaleDateString("en-IN", {
        day:   "numeric",
        month: "short",
        year:  "numeric",
      }),
    }));

    // ── Average dimension scores for the skill progress bars ─────────────
    const dimensions = {
      subjectMatterAuthority: avg(sessions.map((s) => s.dimensions?.subjectMatterAuthority || 0)),
      persuasiveAuthority:    avg(sessions.map((s) => s.dimensions?.persuasiveAuthority    || 0)),
      answerArchitecture:     avg(sessions.map((s) => s.dimensions?.answerArchitecture     || 0)),
      presenceEngagement:     avg(sessions.map((s) => s.dimensions?.presenceEngagement     || 0)),
      responseTiming:         avg(sessions.map((s) => s.dimensions?.responseTiming         || 0)),
      emotionalIntelligence:  avg(sessions.map((s) => s.dimensions?.emotionalIntelligence  || 0)),
    };

    // ── Improvement: latest score vs earliest score ───────────────────────
    const latestScore   = sessions[0].overallScore;
    const earliestScore = sessions[total - 1].overallScore;
    const improvement   = latestScore - earliestScore;   // positive = got better

    res.json({
      success: true,
      data: {
        summaryCards,
        trendScores,
        dimensions,
        totalSessions: total,
        averageScore:  summaryCards.overallScore,
        bestScore:     Math.max(...sessions.map((s) => s.overallScore)),
        improvement,
      },
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/history
// Returns all past sessions formatted for the "Previous Attempts" table
// ─────────────────────────────────────────────────────────────────────────────
const getSessionHistory = async (req, res) => {
  try {
    const sessions = await Interview.find({
      user:   req.user.id,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .select("role overallScore durationSeconds questionsAnswered createdAt");

    const history = sessions.map((s) => ({
      id:       s._id,
      role:     s.role,
      score:    s.overallScore,
      duration: formatDuration(s.durationSeconds),
      date:     s.createdAt.toLocaleDateString("en-IN", {
        day:   "numeric",
        month: "long",
        year:  "numeric",
      }),
      answered: s.questionsAnswered,
    }));

    res.json({ success: true, count: history.length, history });
  } catch (err) {
    console.error("getSessionHistory error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/results/:interviewId
// Returns the full result data for one session (Results page)
// ─────────────────────────────────────────────────────────────────────────────
const getSessionResult = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const session = await Interview.findById(interviewId);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    // Question-by-question score breakdown for the bar chart
    const questionBreakdown = session.answers.map((a) => ({
      questionIndex:  a.questionIndex,
      questionText:   a.questionText,
      questionType:   a.questionType,
      contentScore:   a.contentScore,
      deliveryScore:  a.deliveryScore,
      attentionScore: a.attentionScore,
      wordCount:      a.wordCount,
    }));

    res.json({
      success: true,
      result: {
        interviewId:        session._id,
        role:               session.role,
        date:               session.createdAt,
        duration:           formatDuration(session.durationSeconds),
        overallScore:       session.overallScore,
        confidenceScore:    session.confidenceScore,
        communicationScore: session.communicationScore,
        attentionScore:     session.attentionScore,
        dimensions:         session.dimensions,
        aiFeedback:         session.aiFeedback,
        questionBreakdown,
        eyeContactWarnings: session.eyeContactWarnings,
        questionsAnswered:  session.questionsAnswered,
        questionsTotal:     session.questionsTotal,
      },
    });
  } catch (err) {
    console.error("getSessionResult error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/analytics/progress
// Returns score-over-time data for all sessions (for a full progress graph)
// ─────────────────────────────────────────────────────────────────────────────
const getProgressOverTime = async (req, res) => {
  try {
    const sessions = await Interview.find({
      user:   req.user.id,
      status: "completed",
    })
      .sort({ createdAt: 1 })   // oldest first for chronological chart
      .select("overallScore confidenceScore communicationScore attentionScore createdAt role");

    const progress = sessions.map((s, i) => ({
      sessionNumber:      i + 1,
      role:               s.role,
      date:               s.createdAt.toLocaleDateString("en-IN"),
      overallScore:       s.overallScore,
      confidenceScore:    s.confidenceScore,
      communicationScore: s.communicationScore,
      attentionScore:     s.attentionScore,
    }));

    res.json({ success: true, count: progress.length, progress });
  } catch (err) {
    console.error("getProgressOverTime error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: convert seconds → "38 min" or "1 hr 12 min"
// ─────────────────────────────────────────────────────────────────────────────
const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return "0 min";
  const mins = Math.floor(seconds / 60);
  const hrs  = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs} hr ${mins % 60} min`;
  return `${mins} min`;
};

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  getDashboardStats,
  getSessionHistory,
  getSessionResult,
  getProgressOverTime,
};