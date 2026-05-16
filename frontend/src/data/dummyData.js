export const interviewQuestions = [
  {
    id: 1,
    category: "Technical",
    difficulty: "Medium",
    question: "Explain the difference between `null` and `undefined` in JavaScript, and when would you use each?",
    timeLimit: 120,
    hint: "Think about variable declarations vs intentional absence of value.",
  },
  {
    id: 2,
    category: "System Design",
    difficulty: "Hard",
    question: "How would you design a URL shortening service like bit.ly? Walk through the architecture, database design, and scalability considerations.",
    timeLimit: 180,
    hint: "Consider hash functions, collision handling, and caching strategies.",
  },
  {
    id: 3,
    category: "Behavioral",
    difficulty: "Easy",
    question: "Tell me about a time you had to resolve a conflict within your team. What was the situation, and how did you handle it?",
    timeLimit: 120,
    hint: "Use the STAR method: Situation, Task, Action, Result.",
  },
  {
    id: 4,
    category: "Technical",
    difficulty: "Hard",
    question: "Explain how React's reconciliation algorithm works. What is the virtual DOM and why does React use keys in lists?",
    timeLimit: 150,
    hint: "Focus on diffing, fiber architecture, and performance optimization.",
  },
  {
    id: 5,
    category: "Problem Solving",
    difficulty: "Medium",
    question: "Given an array of integers, return indices of the two numbers that add up to a specific target. You may assume exactly one solution exists.",
    timeLimit: 120,
    hint: "Consider using a hash map for O(n) time complexity.",
  },
  {
    id: 6,
    category: "System Design",
    difficulty: "Hard",
    question: "Design a real-time collaborative document editor like Google Docs. How do you handle concurrent edits from multiple users?",
    timeLimit: 180,
    hint: "Explore Operational Transformation (OT) or CRDTs.",
  },
  {
    id: 7,
    category: "Behavioral",
    difficulty: "Medium",
    question: "Describe a project where you had to learn a new technology under a tight deadline. How did you approach it?",
    timeLimit: 120,
    hint: "Highlight your learning process and prioritization strategy.",
  },
];

export const dashboardStats = {
  totalInterviews: 12,
  averageScore: 73,
  bestScore: 91,
  streak: 4,
  totalTime: "14h 32m",
  improvement: "+18%",
};

export const performanceHistory = [
  { session: "Session 1", score: 55, technical: 50, behavioral: 60, problemSolving: 55 },
  { session: "Session 2", score: 61, technical: 58, behavioral: 65, problemSolving: 60 },
  { session: "Session 3", score: 58, technical: 55, behavioral: 62, problemSolving: 57 },
  { session: "Session 4", score: 66, technical: 63, behavioral: 70, problemSolving: 65 },
  { session: "Session 5", score: 71, technical: 70, behavioral: 72, problemSolving: 71 },
  { session: "Session 6", score: 68, technical: 65, behavioral: 70, problemSolving: 69 },
  { session: "Session 7", score: 75, technical: 74, behavioral: 76, problemSolving: 75 },
  { session: "Session 8", score: 79, technical: 80, behavioral: 78, problemSolving: 79 },
  { session: "Session 9", score: 82, technical: 84, behavioral: 80, problemSolving: 82 },
  { session: "Session 10", score: 85, technical: 87, behavioral: 83, problemSolving: 85 },
  { session: "Session 11", score: 88, technical: 90, behavioral: 86, problemSolving: 89 },
  { session: "Session 12", score: 91, technical: 93, behavioral: 89, problemSolving: 91 },
];

export const categoryScores = [
  { name: "Technical", score: 82, color: "#00E5FF", icon: "⚡" },
  { name: "Behavioral", score: 76, color: "#7B61FF", icon: "🎯" },
  { name: "Problem Solving", score: 85, color: "#00C98D", icon: "🧩" },
  { name: "Communication", score: 79, color: "#FFB547", icon: "💬" },
  { name: "System Design", score: 68, color: "#FF4D6D", icon: "🏗️" },
];

export const feedbackItems = [
  {
    id: 1,
    type: "strength",
    title: "Strong Technical Foundation",
    detail: "Excellent understanding of JavaScript fundamentals and React internals. Your explanation of the virtual DOM reconciliation was thorough and accurate.",
    session: "Session 12",
    score: 93,
  },
  {
    id: 2,
    type: "improvement",
    title: "System Design Depth",
    detail: "Consider diving deeper into scalability trade-offs when designing distributed systems. Explore topics like consistent hashing, CAP theorem, and load balancing strategies.",
    session: "Session 12",
    score: 68,
  },
  {
    id: 3,
    type: "strength",
    title: "Problem Structuring",
    detail: "Great habit of clarifying requirements before coding. You consistently break down complex problems into manageable steps.",
    session: "Session 11",
    score: 91,
  },
  {
    id: 4,
    type: "improvement",
    title: "Behavioral Storytelling",
    detail: "Use the STAR method more consistently. Your stories are compelling but sometimes lack a clear quantifiable result or impact.",
    session: "Session 11",
    score: 78,
  },
  {
    id: 5,
    type: "tip",
    title: "Next Focus Area",
    detail: "Based on your progress, investing time in distributed systems and database indexing will yield the highest score improvement in your next 3 sessions.",
    session: "AI Recommendation",
    score: null,
  },
];

export const recentSessions = [
  { id: 12, date: "Today", score: 91, questions: 7, duration: "38min", trend: "up" },
  { id: 11, date: "Yesterday", score: 88, questions: 6, duration: "34min", trend: "up" },
  { id: 10, date: "2 days ago", score: 85, questions: 7, duration: "41min", trend: "up" },
  { id: 9, date: "4 days ago", score: 82, questions: 5, duration: "28min", trend: "up" },
  { id: 8, date: "5 days ago", score: 79, questions: 6, duration: "36min", trend: "up" },
];
