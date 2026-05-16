// controllers/resumeController.js
// Extracts text from uploaded PDF and uses Gemini to generate interview questions

const { PdfReader } = require("pdfreader");
const { askGemini } = require("../config/gemini");

// ── Helper: extract text from PDF buffer ─────────────────────────────────────
const extractPdfText = (buffer) => {
  return new Promise((resolve, reject) => {
    const reader = new PdfReader();
    let text = "";

    reader.parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        // null item = end of file
        resolve(text);
      } else if (item.text) {
        text += item.text + " ";
      }
    });
  });
};

// ── POST /api/resume/upload ───────────────────────────────────────────────────
const uploadResume = async (req, res) => {
  try {
    // Check file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file",
      });
    }

    // ── 1. Extract text from PDF buffer ───────────────────────────────────
    const resumeText = (await extractPdfText(req.file.buffer)).trim();

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from PDF. Make sure it's not a scanned image.",
      });
    }

    // ── 2. Send to Gemini to generate questions ────────────────────────────
    const prompt = `
You are an expert interview coach. Based on the following resume, generate exactly 3 highly relevant interview questions.

The questions should:
- Be specific to the candidate's experience, skills, and projects mentioned
- Cover different aspects: one technical, one behavioral, one situational
- Be open-ended and thought-provoking
- Feel like they were asked by a real interviewer who read the resume carefully

RESUME:
${resumeText.slice(0, 3000)}

Respond ONLY with a valid JSON array (no markdown, no extra text):
[
  {
    "text": "Question 1 here",
    "type": "Technical",
    "tip": "A helpful tip for answering this question"
  },
  {
    "text": "Question 2 here",
    "type": "Behavioral",
    "tip": "A helpful tip for answering this question"
  },
  {
    "text": "Question 3 here",
    "type": "Situational",
    "tip": "A helpful tip for answering this question"
  }
]
`;

    const raw       = await askGemini(prompt);
    const cleaned   = raw.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(cleaned);

    // ── 3. Return questions to frontend ───────────────────────────────────
    return res.json({
      success:    true,
      message:    "Resume uploaded and questions generated successfully",
      questions,
      resumeText: resumeText.slice(0, 500) + "...",
    });

  } catch (err) {
    console.error("uploadResume error:", err);

    // If Gemini JSON parse fails, return fallback questions
    if (err instanceof SyntaxError) {
      return res.json({
        success:   true,
        message:   "Questions generated with fallback",
        questions: [
          {
            text: "Walk me through your most significant project and your specific contribution to it.",
            type: "Behavioral",
            tip:  "Focus on your individual impact and what you learned.",
          },
          {
            text: "What technical skills from your resume are you most confident in, and how have you applied them?",
            type: "Technical",
            tip:  "Give concrete examples with measurable outcomes.",
          },
          {
            text: "Describe a challenge you faced in one of your listed roles and how you overcame it.",
            type: "Situational",
            tip:  "Use the STAR method — Situation, Task, Action, Result.",
          },
        ],
      });
    }

    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadResume };