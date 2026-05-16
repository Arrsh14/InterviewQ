export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const getScoreColor = (score) => {
  if (score >= 85) return '#00C98D';
  if (score >= 70) return '#00E5FF';
  if (score >= 55) return '#FFB547';
  return '#FF4D6D';
};

export const getScoreLabel = (score) => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Average';
  return 'Needs Work';
};

export const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return '#00C98D';
    case 'medium': return '#FFB547';
    case 'hard': return '#FF4D6D';
    default: return '#4A5568';
  }
};

export const getCategoryColor = (category) => {
  const map = {
    'Technical': '#00E5FF',
    'System Design': '#7B61FF',
    'Behavioral': '#FFB547',
    'Problem Solving': '#00C98D',
  };
  return map[category] || '#4A5568';
};

export const simulateScore = () => Math.floor(Math.random() * 30) + 65;

export const cn = (...classes) => classes.filter(Boolean).join(' ');
