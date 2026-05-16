// services/nlpService.js
// Analyses raw transcript text and returns NLP scores
// No external API needed — pure JavaScript text analysis

const FILLER_WORDS = [
    "um", "uh", "like", "you know", "basically", "literally",
    "actually", "honestly", "right", "so", "kind of", "sort of",
  ];
  
  // ── Analyse transcript text ───────────────────────────────────────────────────
  const analyzeText = (text) => {
    if (!text || text.trim().length === 0) {
      return { fillerWordRate: 0, avgSentenceLength: 0, vocabularyScore: 0 };
    }
  
    const words     = text.toLowerCase().split(/\s+/).filter(Boolean);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const wordCount = words.length;
  
    // ── Filler word rate (lower is better) ───────────────────────────────────
    let fillerCount = 0;
    FILLER_WORDS.forEach((filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, "gi");
      const matches = text.match(regex);
      if (matches) fillerCount += matches.length;
    });
  
    // fillerWordRate: 0 = lots of fillers, 100 = no fillers
    const fillerWordRate = Math.max(
      0,
      Math.round(100 - (fillerCount / wordCount) * 200)
    );
  
    // ── Average sentence length ───────────────────────────────────────────────
    const avgSentenceLength = sentences.length
      ? Math.round(wordCount / sentences.length)
      : 0;
  
    // ── Vocabulary score (unique words / total words) ─────────────────────────
    const uniqueWords    = new Set(words).size;
    const vocabularyScore = Math.min(
      100,
      Math.round((uniqueWords / wordCount) * 150)
    );
  
    return { fillerWordRate, avgSentenceLength, vocabularyScore };
  };
  
  module.exports = { analyzeText };