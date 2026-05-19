import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import InterviewTimer from "../components/InterviewTimer.jsx";
import EyeContactWarning from "../components/EyeContactWarning.jsx";
import useMultiFaceDetection, { MultiFaceWarning } from "../hooks/useMultiFaceDetection.jsx";

// ─── Question bank ────────────────────────────────────────────────────────────
// ── Read settings from localStorage ──────────────────────────────────────────


// ── Full question bank by track ───────────────────────────────────────────────
const QUESTION_BANK = {
  general: [
    { text: "Tell me about yourself and your professional background.", type: "Behavioral", tip: "Keep it to 2 minutes. Cover your background, current role, and why you're here." },
    { text: "What are your greatest professional strengths?", type: "Behavioral", tip: "Pick 2–3 strengths and back each one with a specific example." },
    { text: "Describe a challenging situation you faced and how you handled it.", type: "Situational", tip: "Use the STAR method — Situation, Task, Action, Result." },
    { text: "Why are you interested in this role and our company?", type: "Motivational", tip: "Research the company beforehand. Show genuine alignment with their mission." },
    { text: "Where do you see yourself professionally in five years?", type: "Career", tip: "Be honest but ambitious. Align your goals with the role's growth path." },
    { text: "What is your biggest weakness and how are you working on it?", type: "Behavioral", tip: "Be honest but show self-awareness and growth mindset." },
    { text: "Tell me about a time you showed leadership.", type: "Situational", tip: "Use a specific example. Focus on your actions and their impact." },
    { text: "How do you handle conflict with a teammate?", type: "Behavioral", tip: "Stay professional. Focus on resolution not blame." },
    { text: "What motivates you in your work?", type: "Motivational", tip: "Be genuine. Align your motivation with the role." },
    { text: "Describe a time you failed and what you learned from it.", type: "Situational", tip: "Show vulnerability and growth. Focus on the lesson." },
  ],
  technical: [
    { text: "Explain the difference between a stack and a queue.", type: "Technical", tip: "Use real examples like browser history (stack) or printer queue." },
    { text: "What is the time complexity of binary search?", type: "Technical", tip: "Explain why it's O(log n) with a simple example." },
    { text: "Describe how you would design a URL shortener.", type: "Technical", tip: "Cover hashing, database design, and scalability." },
    { text: "What is the difference between SQL and NoSQL databases?", type: "Technical", tip: "Give examples of each and when you'd use one over the other." },
    { text: "Explain how HTTP works.", type: "Technical", tip: "Cover request/response cycle, methods, and status codes." },
    { text: "What is a REST API and how does it work?", type: "Technical", tip: "Cover statelessness, endpoints, and HTTP methods." },
    { text: "Explain the concept of recursion with an example.", type: "Technical", tip: "Use factorial or fibonacci as a simple example." },
    { text: "What is the difference between process and thread?", type: "Technical", tip: "Focus on memory sharing and use cases." },
    { text: "How does garbage collection work in modern languages?", type: "Technical", tip: "Mention reference counting and mark-and-sweep." },
    { text: "Explain CAP theorem in distributed systems.", type: "Technical", tip: "Cover consistency, availability, and partition tolerance with examples." },
  ],
  behavioral: [
    { text: "Tell me about a time you went above and beyond for a project.", type: "Behavioral", tip: "Use STAR method. Focus on your initiative and results." },
    { text: "Describe a situation where you had to meet a tight deadline.", type: "Situational", tip: "Show how you prioritised and managed your time." },
    { text: "Tell me about a time you disagreed with your manager.", type: "Behavioral", tip: "Stay professional. Show you can respectfully push back." },
    { text: "Describe a time you had to learn something quickly.", type: "Situational", tip: "Show your learning process and how you applied it." },
    { text: "Tell me about a time you worked in a high-pressure environment.", type: "Situational", tip: "Focus on how you stayed calm and delivered results." },
    { text: "Describe your most challenging project to date.", type: "Behavioral", tip: "Highlight your role, challenges faced, and outcome." },
    { text: "Tell me about a time you received critical feedback.", type: "Behavioral", tip: "Show openness to feedback and how you improved." },
    { text: "Describe a situation where you had to influence without authority.", type: "Situational", tip: "Show communication and persuasion skills." },
    { text: "Tell me about a time you mentored or helped a colleague.", type: "Behavioral", tip: "Focus on the impact you had on their growth." },
    { text: "Describe how you handled a project that didn't go as planned.", type: "Situational", tip: "Show accountability and problem-solving." },
  ],
  ml: [
    { text: "Explain the difference between supervised and unsupervised learning.", type: "Technical", tip: "Give real examples like spam detection vs clustering." },
    { text: "What is overfitting and how do you prevent it?", type: "Technical", tip: "Cover dropout, regularisation, and cross-validation." },
    { text: "Explain how a neural network learns.", type: "Technical", tip: "Cover forward pass, loss, backprop, and gradient descent." },
    { text: "What is the difference between precision and recall?", type: "Technical", tip: "Use a medical diagnosis example to explain the tradeoff." },
    { text: "Explain how a random forest works.", type: "Technical", tip: "Cover bagging, decision trees, and voting." },
    { text: "What is gradient descent and how does it work?", type: "Technical", tip: "Explain learning rate, convergence, and local minima." },
    { text: "Explain the bias-variance tradeoff.", type: "Technical", tip: "Use the bullseye analogy for bias vs variance." },
    { text: "What is transfer learning and when would you use it?", type: "Technical", tip: "Give examples like using pretrained ResNet for image tasks." },
    { text: "How do you handle imbalanced datasets?", type: "Technical", tip: "Cover SMOTE, class weights, and evaluation metrics." },
    { text: "Explain how attention mechanism works in transformers.", type: "Technical", tip: "Cover query, key, value and self-attention." },
  ],
  product: [
    { text: "How would you prioritise features for a new product?", type: "Technical", tip: "Mention frameworks like RICE, MoSCoW, or impact vs effort." },
    { text: "Tell me about a product you admire and why.", type: "Motivational", tip: "Cover UX, business model, and what makes it stand out." },
    { text: "How do you define product success?", type: "Behavioral", tip: "Cover metrics, user goals, and business goals." },
    { text: "How would you improve Instagram's Reels feature?", type: "Technical", tip: "Define the problem, user segments, and propose solutions." },
    { text: "Walk me through how you would launch a new product.", type: "Technical", tip: "Cover discovery, MVP, launch, and iteration." },
    { text: "How do you gather user requirements?", type: "Behavioral", tip: "Mention user interviews, surveys, and data analysis." },
    { text: "How would you handle negative user feedback on a feature?", type: "Situational", tip: "Show empathy, data analysis, and iteration." },
    { text: "What metrics would you track for a subscription product?", type: "Technical", tip: "Cover MRR, churn, LTV, and activation rate." },
    { text: "How do you balance short-term and long-term product goals?", type: "Behavioral", tip: "Show strategic thinking and stakeholder alignment." },
    { text: "Describe a product decision you made with incomplete data.", type: "Situational", tip: "Show how you made a reasoned decision with uncertainty." },
  ],
  data: [
    { text: "Explain the difference between mean, median, and mode.", type: "Technical", tip: "Give examples of when each measure is most appropriate." },
    { text: "What is A/B testing and how do you design one?", type: "Technical", tip: "Cover hypothesis, control/treatment, sample size, and significance." },
    { text: "How do you handle missing data in a dataset?", type: "Technical", tip: "Cover imputation, deletion, and model-based approaches." },
    { text: "Explain the difference between correlation and causation.", type: "Technical", tip: "Use a classic example like ice cream and drowning rates." },
    { text: "What is a p-value and how do you interpret it?", type: "Technical", tip: "Explain significance threshold and what it means for your hypothesis." },
    { text: "How would you detect outliers in a dataset?", type: "Technical", tip: "Cover IQR, z-scores, and visualisation methods." },
    { text: "What is the difference between OLAP and OLTP?", type: "Technical", tip: "Cover use cases, query patterns, and examples." },
    { text: "Explain how you would build a recommendation system.", type: "Technical", tip: "Cover collaborative filtering, content-based, and hybrid approaches." },
    { text: "What is data normalisation and why is it important?", type: "Technical", tip: "Explain 1NF, 2NF, 3NF with simple examples." },
    { text: "How do you communicate data insights to non-technical stakeholders?", type: "Behavioral", tip: "Focus on storytelling, visualisation, and avoiding jargon." },
  ],
};

// ── Build question list based on settings ─────────────────────────────────────
const savedResumeQ = localStorage.getItem("iq_resume_questions");
const resumeQuestions = savedResumeQ ? JSON.parse(savedResumeQ) : [];

const card = {
  background: "#fff",
  border: "1px solid #e8e8e8",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  fontFamily: "'Open Sans','Segoe UI',sans-serif",
};

const typeMeta = {
  Behavioral: { bg: "#eaf7ee", border: "#b7e4c7", color: "#2f8d46" },
  Situational: { bg: "#eaf2fb", border: "#b3d4f5", color: "#4a90d9" },
  Motivational: { bg: "#fff8ee", border: "#fde3b0", color: "#f4a426" },
  Career: { bg: "#f3eeff", border: "#d8c5f7", color: "#7b5ea7" },
  Technical: { bg: "#fff0f0", border: "#ffb3b3", color: "#e53935" },
};

export default function InterviewPage() {

  const QUESTION_COUNT = parseInt(localStorage.getItem("iq_question_count") || "5");
  const TRACK = localStorage.getItem("iq_track") || "general";
  const trackQuestions = QUESTION_BANK[TRACK] || QUESTION_BANK.general;
  const selectedQ = trackQuestions.slice(0, QUESTION_COUNT);
  const ALL_QUESTIONS = [...selectedQ, ...resumeQuestions];
  const DIFFICULTY = localStorage.getItem("iq_difficulty") || "medium";
  const ENABLE_EYE_CONTACT = localStorage.getItem("iq_eye_contact") !== "false";
  const ENABLE_FACIAL_ANALYSIS = localStorage.getItem("iq_facial_analysis") !== "false";
  const ENABLE_SPEECH = localStorage.getItem("iq_speech_transcription") !== "false";
  const ENABLE_NLP = localStorage.getItem("iq_nlp_scoring") !== "false";
  const ENABLE_POSTURE = localStorage.getItem("iq_posture_detection") === "true";
  const ENABLE_AUTO_NEXT = localStorage.getItem("iq_auto_next") === "true";

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const recognitionRef = useRef(null);
  const mlIntervalRef = useRef(null);
  const cameraOnRef = useRef(false);

  const [currentQ, setCurrentQ] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [permDenied, setPermDenied] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [answered, setAnswered] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewId, setInterviewId] = useState(null);
  const [mlConnected, setMlConnected] = useState(false);
  const [mlScores, setMlScores] = useState({
    eyeContact: 0, postureScore: 0, overallScore: 0,
    postureFeedback: "", makingContact: false,
  });
  const [nlpScores, setNlpScores] = useState({
    nlpScore: 0, fillerScore: 0, grammarScore: 0,
    confidenceScore: 0, confidenceLabel: "", fillerCount: 0,
  });

  const { multiFaceWarning, multiFaceCount } = useMultiFaceDetection(videoRef, cameraOn);

  const token = localStorage.getItem("iq_token");
  const q = ALL_QUESTIONS[currentQ];
  const meta = typeMeta[q?.type] || typeMeta.Behavioral;
  const progress = Math.round((answered.length / ALL_QUESTIONS.length) * 100);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => { stopCamera(); stopSTT(); }, []);

  // ── ML: send frame to Flask every second ─────────────────────────────────
  const captureAndAnalyse = async () => {
    if (!videoRef.current || !cameraOnRef.current) return;
    if (videoRef.current.readyState < 2) return;
    if (videoRef.current.videoWidth === 0) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
      const base64Frame = canvas.toDataURL("image/jpeg", 0.7);
      if (base64Frame === "data:,") return;

      const res = await fetch("http://localhost:5001/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame: base64Frame }),
      });
      const data = await res.json();
      if (data.success) {
        setMlConnected(true);
        setMlScores({
          eyeContact: data.eye_contact?.confidence || 0,
          postureScore: data.posture?.score || 0,
          overallScore: data.overall_score || 0,
          postureFeedback: data.posture?.feedback || "",
          makingContact: data.eye_contact?.making_contact || false,
        });
        // Trigger eye contact warning from ML data
        if (ENABLE_EYE_CONTACT && !data.eye_contact?.making_contact) {
          setShowWarning(true);
          clearTimeout(warningTimeoutRef.current);
          warningTimeoutRef.current = setTimeout(() => setShowWarning(false), 3000);
        } else {
          clearTimeout(warningTimeoutRef.current);
          setShowWarning(false);
        }
      }
    } catch (err) {
      // Only mark offline for real network failures
      if (err.message?.includes("fetch") || err.message?.includes("Failed")) {
        setMlConnected(false);
      }
    }
  };

  // ── Speech-to-Text ────────────────────────────────────────────────────────
  const startSTT = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (!ENABLE_SPEECH) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let finalTranscript = "";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalTranscript += result[0].transcript + " ";
        else interim += result[0].transcript;
      }
      setTranscript(finalTranscript + interim);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      if (streamRef.current) recognition.start();
      else setIsListening(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSTT = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // ── face-api eye contact (runs in parallel with ML server) ───────────────
  useEffect(() => {
    if (!cameraOn || !ENABLE_EYE_CONTACT) return;  // ← only this line changes
    let intervalId;
    let modelsLoaded = false;

    const loadModels = async () => {
      const faceapi = await import("@vladmandic/face-api");
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      modelsLoaded = true;
      return faceapi;
    };

    const detectEyeContact = async (faceapi) => {
      if (!videoRef.current || !modelsLoaded) return;
      if (videoRef.current.readyState < 2) return;
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      let lookingAway = !detection;
      if (detection) {
        const landmarks = detection.landmarks;
        const nose = landmarks.getNose()[3];
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const eyeMidX = (
          leftEye.reduce((s, p) => s + p.x, 0) / leftEye.length +
          rightEye.reduce((s, p) => s + p.x, 0) / rightEye.length
        ) / 2;
        lookingAway = (Math.abs(nose.x - eyeMidX) / detection.detection.box.width) > 0.12;
      }
      if (lookingAway) {
        setShowWarning(true);
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = setTimeout(() => setShowWarning(false), 3000);
      } else {
        clearTimeout(warningTimeoutRef.current);
        setShowWarning(false);
      }
    };

    loadModels()
      .then((faceapi) => { intervalId = setInterval(() => detectEyeContact(faceapi), 1500); })
      .catch(() => { });

    return () => { clearInterval(intervalId); clearTimeout(warningTimeoutRef.current); };
  }, [cameraOn]);

  // ── Camera start ──────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      cameraOnRef.current = true;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setCameraOn(true);
      setIsRunning(true);
      setPermDenied(false);
      startSTT();
      if (ENABLE_FACIAL_ANALYSIS || ENABLE_POSTURE) {
        mlIntervalRef.current = setInterval(captureAndAnalyse, 1000);
      }

      // ── Immediately ping ML server health when camera starts ──────────────
      fetch("http://localhost:5001/health")
        .then((r) => r.json())
        .then((d) => { if (d.status === "ok") setMlConnected(true); })
        .catch(() => setMlConnected(false));

    } catch (err) {
      console.error("🔴 Camera error:", err.name, err.message);
      setPermDenied(true);
    }
  };

  // ── Camera stop ───────────────────────────────────────────────────────────
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    cameraOnRef.current = false;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setIsRunning(false);
    stopSTT();
    clearInterval(mlIntervalRef.current);
    mlIntervalRef.current = null;
  };

  // ── Analyse NLP for a transcript ─────────────────────────────────────────
  const analyseNLP = async (text) => {
    if (!ENABLE_NLP) return;
    if (!text || text.split(/\s+/).filter(Boolean).length < 5) return;
    try {
      const res = await fetch("http://localhost:5001/analyse/nlp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, question: q.text }),
      });
      const data = await res.json();
      if (data.success) {
        setNlpScores({
          nlpScore: data.nlp_score || 0,
          fillerScore: data.filler_words?.filler_score || 0,
          grammarScore: data.grammar?.grammar_score || 0,
          confidenceScore: data.confidence?.confidence_score || 0,
          confidenceLabel: data.confidence?.confidence_label || "",
          fillerCount: data.filler_words?.total_fillers || 0,
        });
        console.log("NLP scores:", data);
      }
    } catch (err) {
      console.log("NLP analysis error:", err.message);
    }
  };

  // ── Save answer to backend ────────────────────────────────────────────────
  const saveAnswer = async (qIndex, qText, qType, text) => {
    // Run NLP analysis in parallel — don't wait for it to finish
    analyseNLP(text);

    try {
      let currentId = interviewId;
      if (!currentId) {
        const res = await fetch("http://localhost:5000/api/interviews/start", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role: "General Interview" }),
        });
        const data = await res.json();
        currentId = data.interview?.id;
        setInterviewId(currentId);
        if (currentId) localStorage.setItem("iq_last_interview_id", currentId);
      }
      if (!currentId) return;

      await fetch(`http://localhost:5000/api/interviews/${currentId}/answer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          questionIndex: qIndex,
          questionText: qText,
          questionType: qType,
          transcript: text,
          wordCount: text.split(/\s+/).filter(Boolean).length,
          eyeContactScore: mlScores.eyeContact,
          postureScore: mlScores.postureScore,
          nlpScore: nlpScores.nlpScore,
          fillerScore: nlpScores.fillerScore,
          grammarScore: nlpScores.grammarScore,
          confidenceScore: nlpScores.confidenceScore,
        }),
      });
    } catch (err) {
      console.log("Save answer error:", err.message);
    }
  };

  // ── Next question ─────────────────────────────────────────────────────────
  const handleNext = async () => {
    setIsLoading(true);
    await saveAnswer(currentQ, q.text, q.type, transcript);
    setIsLoading(false);
    if (!answered.includes(currentQ)) setAnswered((a) => [...a, currentQ]);
    if (currentQ < ALL_QUESTIONS.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setTranscript("");
      stopSTT();
      setTimeout(() => { if (streamRef.current) startSTT(); }, 300);
    } else {
      stopCamera();
      setCompleted(true);
    }
  };

  // ── Finish interview ──────────────────────────────────────────────────────
  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const currentId = interviewId || localStorage.getItem("iq_last_interview_id");
      const multiFaceWarnings = parseInt(localStorage.getItem("iq_multi_face_warnings") || "0");
      if (currentId) {
        await fetch(`http://localhost:5000/api/interviews/${currentId}/complete`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ durationSeconds: 0, eyeContactWarnings: 0, multiFaceWarnings: multiFaceWarnings, eyeContactScore: mlScores.eyeContact, postureScore: mlScores.postureScore }),
        });
        await fetch(`http://localhost:5000/api/ai/evaluate/${currentId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ eyeContactScore: mlScores.eyeContact, facialEngagementScore: mlScores.overallScore, postureScore: mlScores.postureScore }),
        });
        localStorage.setItem("iq_last_interview_id", currentId);
      }
    } catch (err) {
      console.log("Finish error:", err.message);
    } finally {
      setIsLoading(false);
    }
    localStorage.removeItem("iq_resume_questions");
    stopCamera();
    navigate("/results");
  };

  // ── Jump to question ──────────────────────────────────────────────────────
  const jumpTo = (i) => {
    if (!answered.includes(currentQ) && transcript.trim()) setAnswered((a) => [...a, currentQ]);
    setCurrentQ(i);
    setTranscript("");
    stopSTT();
    setTimeout(() => { if (streamRef.current) startSTT(); }, 300);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg,#dce8f5 0%,#eaf1fb 50%,#dce8f5 100%)", fontFamily: "'Open Sans','Segoe UI',sans-serif", color: "#2d2d2d" }}>
      <Sidebar activePage="Interviews" />
      <EyeContactWarning visible={showWarning} onDismiss={() => setShowWarning(false)} />
      <MultiFaceWarning visible={multiFaceWarning} count={multiFaceCount} />

      <main style={{ marginLeft: "240px", padding: "32px 36px", flex: 1, overflowY: "auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <p style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "5px", fontWeight: 600 }}>Live Session</p>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
              Interview <span style={{ color: "#2f8d46" }}>Session</span>
            </h1>
            {resumeQuestions.length > 0 && (
              <p style={{ fontSize: "11px", color: "#2f8d46", margin: "4px 0 0", fontWeight: 600 }}>
                ✅ {resumeQuestions.length} personalised resume questions added
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "999px", fontWeight: 700, background: mlConnected ? "#eaf7ee" : "#fff0f0", color: mlConnected ? "#2f8d46" : "#e53935", border: `1px solid ${mlConnected ? "#b7e4c7" : "#ffb3b3"}` }}>
              {mlConnected ? "● ML Active" : "○ ML Offline"}
            </span>
            <InterviewTimer isRunning={isRunning} />
            <button
              onClick={handleFinish} disabled={isLoading}
              style={{ padding: "9px 20px", borderRadius: "6px", background: "transparent", border: "2px solid #e53935", color: "#e53935", fontWeight: 700, fontSize: "13px", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1, transition: "all 0.2s", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
              onMouseOver={(e) => { if (!isLoading) { e.currentTarget.style.background = "#e53935"; e.currentTarget.style.color = "#fff"; } }}
              onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e53935"; }}
            >{isLoading ? "Saving..." : "End Interview"}</button>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888", marginBottom: "6px" }}>
            <span>Question {currentQ + 1} of {ALL_QUESTIONS.length}</span>
            <span>{progress}% answered</span>
          </div>
          <div style={{ height: "5px", background: "#e8e8e8", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#2f8d46,#52c278)", borderRadius: "3px", transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

          {/* LEFT — Webcam */}
          <div style={{ ...card, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "13px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>📹 Webcam Preview</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {isListening && (
                  <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "999px", fontWeight: 700, background: "#fff0f0", color: "#e53935", border: "1px solid #ffb3b3" }}>🎙️ LISTENING</span>
                )}
                <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "999px", fontWeight: 700, background: cameraOn ? "#eaf7ee" : "#f5f5f5", color: cameraOn ? "#2f8d46" : "#aaa", border: `1px solid ${cameraOn ? "#b7e4c7" : "#e0e0e0"}` }}>
                  {cameraOn ? "● LIVE" : "○ OFFLINE"}
                </span>
              </div>
            </div>

            <div style={{ flex: 1, minHeight: "230px", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: cameraOn ? "block" : "none" }} />
              {!cameraOn && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>📷</div>
                  {permDenied ? (
                    <>
                      <p style={{ fontWeight: 700, color: "#444", fontSize: "13px", margin: "0 0 6px" }}>Camera access denied</p>
                      <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>Allow camera & microphone in browser settings, then refresh.</p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontWeight: 700, color: "#444", fontSize: "13px", margin: "0 0 12px" }}>Camera not active</p>
                      <button onClick={startCamera}
                        style={{ padding: "9px 22px", borderRadius: "6px", background: "#2f8d46", color: "#fff", fontWeight: 700, fontSize: "13px", border: "none", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#257a3c")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "#2f8d46")}
                      >▶ Start Camera</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ML + NLP Score boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px", padding: "12px 14px", borderTop: "1px solid #f0f0f0" }}>
              {[
                ["👁️ Eye Contact", `${mlScores.eyeContact}%`, "#2f8d46", mlConnected],
                ["🧍 Posture", `${mlScores.postureScore}%`, "#4a90d9", mlConnected],
                ["⭐ ML Score", `${mlScores.overallScore}%`, "#f4a426", mlConnected],
                ["🗣️ Confidence", `${nlpScores.confidenceScore}/10`, "#7b5ea7", nlpScores.nlpScore > 0],
                ["✍️ Grammar", `${nlpScores.grammarScore}/10`, "#2f8d46", nlpScores.nlpScore > 0],
                ["📊 NLP Score", `${nlpScores.nlpScore}%`, "#4a90d9", nlpScores.nlpScore > 0],
              ].map(([label, val, color, active]) => (
                <div key={label} style={{ textAlign: "center", padding: "6px", background: "#fafafa", borderRadius: "6px", border: "1px solid #f0f0f0" }}>
                  <p style={{ fontSize: "9px", color: "#aaa", margin: "0 0 2px" }}>{label}</p>
                  <p style={{ fontSize: "13px", fontWeight: 800, color, margin: 0 }}>{active ? val : "—"}</p>
                </div>
              ))}
            </div>

            {/* Filler word warning */}
            {nlpScores.fillerCount > 3 && (
              <div style={{ margin: "0 14px 10px", padding: "7px 12px", background: "#fff8ee", border: "1px solid #fde3b0", borderRadius: "6px", fontSize: "11px", color: "#f4a426", fontWeight: 600 }}>
                ⚠️ {nlpScores.fillerCount} filler words detected — try to speak more deliberately
              </div>
            )}

            {/* Confidence label */}
            {nlpScores.confidenceLabel && (
              <div style={{ margin: "0 14px 10px", padding: "7px 12px", background: "#f3eeff", border: "1px solid #d8c5f7", borderRadius: "6px", fontSize: "11px", color: "#7b5ea7", fontWeight: 600 }}>
                🎯 {nlpScores.confidenceLabel}
              </div>
            )}

            {mlConnected && mlScores.postureFeedback && mlScores.postureFeedback !== "Good posture!" && (
              <div style={{ margin: "0 14px 12px", padding: "8px 12px", background: "#fff8ee", border: "1px solid #fde3b0", borderRadius: "6px", fontSize: "12px", color: "#f4a426", fontWeight: 600 }}>
                🧍 {mlScores.postureFeedback}
              </div>
            )}
          </div>

          {/* RIGHT — Question + controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ ...card, padding: "20px", borderLeft: `4px solid ${meta.color}`, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
                <span style={{ padding: "3px 10px", background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: "4px", fontSize: "11px", color: meta.color, fontWeight: 700 }}>Q{currentQ + 1}</span>
                <span style={{ padding: "3px 10px", background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: "4px", fontSize: "11px", color: meta.color, fontWeight: 600 }}>{q?.type}</span>
                {currentQ >= selectedQ.length && (
                  <span style={{ padding: "3px 10px", background: "#eaf7ee", border: "1px solid #b7e4c7", borderRadius: "4px", fontSize: "11px", color: "#2f8d46", fontWeight: 600 }}>📄 Resume</span>
                )}
              </div>
              <p style={{ fontSize: "17px", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.55, margin: "0 0 18px" }}>{q?.text}</p>
              <div style={{ padding: "10px 12px", background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: "6px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ fontSize: "12px" }}>💡</span>
                <p style={{ fontSize: "12px", color: "#666", margin: 0, lineHeight: 1.5 }}><strong style={{ color: "#444" }}>Tip:</strong> {q?.tip}</p>
              </div>
            </div>

            {completed ? (
              <button onClick={handleFinish} disabled={isLoading}
                style={{ padding: "12px", borderRadius: "6px", background: isLoading ? "#aaa" : "#2f8d46", color: "#fff", fontWeight: 700, fontSize: "14px", border: "none", cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
                onMouseOver={(e) => { if (!isLoading) e.currentTarget.style.background = "#257a3c"; }}
                onMouseOut={(e) => { if (!isLoading) e.currentTarget.style.background = "#2f8d46"; }}
              >{isLoading ? "⏳ Evaluating with AI..." : "🏁 View Results →"}</button>
            ) : (
              <button onClick={handleNext} disabled={isLoading}
                style={{ padding: "12px", borderRadius: "6px", background: "transparent", border: "2px solid #2f8d46", color: "#2f8d46", fontWeight: 700, fontSize: "14px", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1, fontFamily: "'Open Sans','Segoe UI',sans-serif", transition: "all 0.2s" }}
                onMouseOver={(e) => { if (!isLoading) { e.currentTarget.style.background = "#2f8d46"; e.currentTarget.style.color = "#fff"; } }}
                onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2f8d46"; }}
              >{isLoading ? "⏳ Saving..." : currentQ === ALL_QUESTIONS.length - 1 ? "Finish & View Results →" : "Next Question →"}</button>
            )}

            <button onClick={() => setShowWarning(true)}
              style={{ padding: "9px", borderRadius: "6px", background: "transparent", border: "1px solid #f4a426", color: "#f4a426", fontWeight: 600, fontSize: "12px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#fff8ee")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
            >👁️ Test Eye-Contact Warning</button>
          </div>
        </div>

        {/* ── Live Transcript ── */}
        <div style={{ ...card, padding: "20px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "4px", height: "16px", borderRadius: "2px", background: "#4a90d9", display: "inline-block" }} />
              Live Transcript
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "11px", color: isListening ? "#e53935" : "#aaa" }}>
                {isListening ? "🔴 Listening..." : cameraOn ? "⏸ Mic paused" : "Start camera to begin"}
              </span>
              <button onClick={() => setTranscript("")}
                style={{ background: "none", border: "none", fontSize: "11px", color: "#aaa", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#e53935")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#aaa")}
              >Clear</button>
            </div>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={isListening ? "Speak now — your words will appear here in real time..." : "Start camera to begin transcription, or type manually..."}
            style={{ width: "100%", minHeight: "110px", border: `1px solid ${isListening ? "#4a90d9" : "#e8e8e8"}`, borderRadius: "6px", padding: "12px 14px", fontSize: "13px", color: "#444", background: "#fafafa", resize: "vertical", outline: "none", fontFamily: "'Open Sans','Segoe UI',sans-serif", lineHeight: 1.6, boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#2f8d46"; e.currentTarget.style.background = "#fff"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = isListening ? "#4a90d9" : "#e8e8e8"; e.currentTarget.style.background = "#fafafa"; }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            <span style={{ fontSize: "11px", color: "#aaa" }}>{transcript.split(/\s+/).filter(Boolean).length} words</span>
            <span style={{ fontSize: "11px", color: isListening ? "#4a90d9" : "#aaa" }}>
              {isListening ? "🎙️ Web Speech API active" : "Web Speech API ready"}
            </span>
          </div>
        </div>

        {/* ── Question Navigator ── */}
        <div style={{ ...card, padding: "18px 20px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 12px" }}>Question Navigator</h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {ALL_QUESTIONS.map((qItem, i) => {
              const isCurrent = i === currentQ;
              const isAnswered = answered.includes(i);
              const isResume = i >= selectedQ.length;
              return (
                <button key={i} onClick={() => jumpTo(i)} title={qItem.text}
                  style={{ width: "36px", height: "36px", borderRadius: "6px", border: `2px solid ${isCurrent ? "#2f8d46" : isAnswered ? "#b7e4c7" : isResume ? "#fde3b0" : "#e8e8e8"}`, background: isCurrent ? "#eaf7ee" : isAnswered ? "#f5fdf8" : isResume ? "#fff8ee" : "#fff", color: isCurrent ? "#2f8d46" : isAnswered ? "#52c278" : isResume ? "#f4a426" : "#aaa", fontWeight: 700, fontSize: "13px", cursor: "pointer", transition: "all 0.15s", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
                  onMouseOver={(e) => { if (!isCurrent) e.currentTarget.style.borderColor = "#2f8d46"; }}
                  onMouseOut={(e) => { if (!isCurrent) e.currentTarget.style.borderColor = isAnswered ? "#b7e4c7" : isResume ? "#fde3b0" : "#e8e8e8"; }}
                >{i + 1}</button>
              );
            })}
          </div>
          <p style={{ fontSize: "11px", color: "#aaa", margin: "10px 0 0" }}>
            <span style={{ color: "#2f8d46", fontWeight: 700 }}>Green</span> = current &nbsp;·&nbsp;
            <span style={{ color: "#52c278", fontWeight: 700 }}>Light green</span> = answered &nbsp;·&nbsp;
            <span style={{ color: "#f4a426", fontWeight: 700 }}>Yellow</span> = resume question &nbsp;·&nbsp;
            <span style={{ color: "#aaa" }}>Grey</span> = not visited
          </p>
        </div>

      </main>
    </div>
  );
}