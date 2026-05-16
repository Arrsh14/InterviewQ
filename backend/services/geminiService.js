// services/geminiService.js
// Replaces openaiService — uses Google Gemini to generate interview feedback

const { askGemini } = require("../config/gemini");

// ── Generate full interview feedback ─────────────────────────────────────────
const generateFeedback = async ({
  transcripts,
  overallScore,
  confidenceScore,
  communicationScore,
  attentionScore,
  dimensionScores,
}) => {
  const transcriptText = transcripts
    .map((t, i) => `Q${i + 1}: ${t.question}\nA${i + 1}: ${t.answer}`)
    .join("\n\n");

  const prompt = `
You are an expert interview coach. Analyse the following interview transcript and scores, then provide detailed feedback.

SCORES:
- Overall: ${overallScore}/100
- Confidence: ${confidenceScore}/100
- Communication: ${communicationScore}/100
- Attention: ${attentionScore}/100
- Subject Matter Authority: ${dimensionScores.subjectMatterAuthority}/100
- Persuasive Authority: ${dimensionScores.persuasiveAuthority}/100
- Answer Architecture: ${dimensionScores.answerArchitecture}/100
- Presence & Engagement: ${dimensionScores.presenceEngagement}/100
- Response Timing: ${dimensionScores.responseTiming}/100
- Emotional Intelligence: ${dimensionScores.emotionalIntelligence}/100

TRANSCRIPT:
${transcriptText}

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "contentQuality": "2-3 sentence feedback on the depth and relevance of answers",
  "vocalDelivery": "2-3 sentence feedback on speaking clarity and confidence",
  "bodyLanguage": "2-3 sentence feedback on presence and engagement",
  "answerStructure": "2-3 sentence feedback on how well answers were structured",
  "summary": "3-4 sentence overall summary with key strengths and areas to improve"
}
`;

  try {
    const raw     = await askGemini(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini feedback error:", err);
    // Return fallback feedback if Gemini fails
    return {
      contentQuality:  "Your answers demonstrated reasonable depth. Focus on adding more specific examples.",
      vocalDelivery:   "Work on reducing filler words to sound more confident and polished.",
      bodyLanguage:    "Maintain consistent eye contact to project confidence and engagement.",
      answerStructure: "Try using the STAR method (Situation, Task, Action, Result) for clearer answers.",
      summary:         `You scored ${overallScore}/100 overall. Keep practising to improve your confidence and communication skills.`,
    };
  }
};

// ── Quick feedback for a single answer ───────────────────────────────────────
const quickFeedback = async ({ question, answer, questionType }) => {
  const prompt = `
You are an expert interview coach. Give quick feedback on this single interview answer.

Question Type: ${questionType}
Question: ${question}
Answer: ${answer}

Respond ONLY with a valid JSON object (no markdown, no extra text):
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "tip": "one actionable tip for this type of question"
}
`;

  try {
    const raw     = await askGemini(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini quickFeedback error:", err);
    return {
      score:        50,
      strengths:    ["Answer was received successfully"],
      improvements: ["Add more specific examples", "Use the STAR method"],
      tip:          `For a ${questionType} question, structure your answer clearly with a beginning, middle, and end.`,
    };
  }
};

module.exports = { generateFeedback, quickFeedback };