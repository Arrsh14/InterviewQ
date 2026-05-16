// services/scoringService.js
// Calculates all 6 dimension scores from NLP + vision + answer data
// Returns scores in 0-100 range

// ── Calculate all dimension scores ────────────────────────────────────────────
const calculateDimensions = ({
    nlpScores,
    eyeContactScore,
    facialEngagementScore,
    answers,
    durationSeconds,
    warnings,
  }) => {
    const {
      fillerWordRate    = 0,
      avgSentenceLength = 0,
      vocabularyScore   = 0,
    } = nlpScores;
  
    // ── Average answer word count ─────────────────────────────────────────────
    const avgWordCount = answers.length
      ? answers.reduce((s, a) => s + (a.wordCount || 0), 0) / answers.length
      : 0;
  
    // ── 1. Subject Matter Authority (content depth) ───────────────────────────
    // Based on vocabulary richness and answer length
    const subjectMatterAuthority = Math.min(
      100,
      Math.round(
        vocabularyScore * 0.5 +
        Math.min(100, (avgWordCount / 150) * 100) * 0.5
      )
    );
  
    // ── 2. Persuasive Authority (confidence in delivery) ─────────────────────
    // Based on filler word rate and sentence structure
    const persuasiveAuthority = Math.min(
      100,
      Math.round(
        fillerWordRate * 0.6 +
        Math.min(100, avgSentenceLength * 5) * 0.4
      )
    );
  
    // ── 3. Answer Architecture (structure quality) ────────────────────────────
    // Based on answer length consistency and vocabulary
    const lengthConsistency = answers.length > 1
      ? Math.max(
          0,
          100 - Math.round(
            (Math.max(...answers.map((a) => a.wordCount || 0)) -
             Math.min(...answers.map((a) => a.wordCount || 0))) / 2
          )
        )
      : 70;
  
    const answerArchitecture = Math.min(
      100,
      Math.round(lengthConsistency * 0.5 + vocabularyScore * 0.5)
    );
  
    // ── 4. Presence & Engagement (visual presence) ────────────────────────────
    const presenceEngagement = Math.min(
      100,
      Math.round(eyeContactScore * 0.6 + facialEngagementScore * 0.4)
    );
  
    // ── 5. Response Timing (pacing) ───────────────────────────────────────────
    // Ideal: ~60-90 seconds per answer
    const idealDuration     = answers.length * 75;
    const timingDiff        = Math.abs((durationSeconds || 0) - idealDuration);
    const responseTiming    = Math.max(0, Math.round(100 - (timingDiff / idealDuration) * 100));
  
    // ── 6. Emotional Intelligence (warmth + engagement) ──────────────────────
    const emotionalIntelligence = Math.min(
      100,
      Math.round(
        facialEngagementScore * 0.5 +
        fillerWordRate        * 0.3 +
        Math.max(0, 100 - (warnings || 0) * 10) * 0.2
      )
    );
  
    return {
      subjectMatterAuthority,
      persuasiveAuthority,
      answerArchitecture,
      presenceEngagement,
      responseTiming,
      emotionalIntelligence,
    };
  };
  
  module.exports = { calculateDimensions };