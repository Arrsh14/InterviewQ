import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import InterviewTimer from "../components/InterviewTimer.jsx";
import EyeContactWarning from "../components/EyeContactWarning.jsx";
import useMultiFaceDetection, { MultiFaceWarning } from "../hooks/useMultiFaceDetection.jsx";

/* ─── Design tokens ────────────────────────────────────────────────────────── */
const T = {
  bg:      "#f7f8fa",
  white:   "#ffffff",
  border:  "#e9eaec",
  text:    "#1a1d23",
  muted:   "#8a8f9d",
  accent:  "#5c6bc0",
  green:   "#2e7d32",
  greenBg: "#e8f5e9",
  greenBd: "#c8e6c9",
  blue:    "#1565c0",
  blueBg:  "#e3f2fd",
  blueBd:  "#bbdefb",
  purple:  "#6a1b9a",
  purpleBg:"#f3e5f5",
  purpleBd:"#e1bee7",
  amber:   "#e65100",
  amberBg: "#fff3e0",
  amberBd: "#ffe0b2",
  red:     "#c62828",
  redBg:   "#ffebee",
  redBd:   "#ffcdd2",
  radius:  "10px",
  font:    "'DM Sans', 'Segoe UI', sans-serif",
};

/* ─── Question bank ────────────────────────────────────────────────────────── */
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

const typeMeta = {
  Behavioral:  { bg: T.greenBg,  border: T.greenBd,  color: T.green  },
  Situational: { bg: T.blueBg,   border: T.blueBd,   color: T.blue   },
  Motivational:{ bg: T.amberBg,  border: T.amberBd,  color: T.amber  },
  Career:      { bg: T.purpleBg, border: T.purpleBd, color: T.purple },
  Technical:   { bg: T.redBg,    border: T.redBd,    color: T.red    },
};

/* ─── Reusable card ────────────────────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.white, border: `1px solid ${T.border}`,
    borderRadius: T.radius, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", ...style,
  }}>{children}</div>
);

/* ─── Card header bar ──────────────────────────────────────────────────────── */
const CardHeader = ({ children }) => (
  <div style={{
    padding: "12px 18px", borderBottom: `1px solid ${T.border}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  }}>{children}</div>
);

/* ─── Pill ─────────────────────────────────────────────────────────────────── */
const Pill = ({ children, color = T.accent, bg, border }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", padding: "2px 10px",
    borderRadius: "20px", fontSize: "11px", fontWeight: 600,
    background: bg || color + "18", color,
    border: `1px solid ${border || color + "30"}`,
  }}>{children}</span>
);

/* ─── Mini metric tile ─────────────────────────────────────────────────────── */
const MetricTile = ({ label, value, color, active }) => (
  <div style={{
    textAlign: "center", padding: "8px 6px",
    background: T.bg, borderRadius: "8px", border: `1px solid ${T.border}`,
  }}>
    <p style={{ fontSize: "9px", color: T.muted, margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
    <p style={{ fontSize: "14px", fontWeight: 800, color: active ? color : T.muted, margin: 0 }}>{active ? value : "—"}</p>
  </div>
);

/* ─── Main ─────────────────────────────────────────────────────────────────── */
export default function InterviewPage() {
  const QUESTION_COUNT = parseInt(localStorage.getItem("iq_question_count") || "5");
  const TRACK = localStorage.getItem("iq_track") || "general";
  const savedResumeQ = localStorage.getItem("iq_resume_questions");
  const resumeQuestions = savedResumeQ ? JSON.parse(savedResumeQ) : [];
  const trackQuestions = QUESTION_BANK[TRACK] || QUESTION_BANK.general;
  const selectedQ = trackQuestions.slice(0, QUESTION_COUNT);
  const ALL_QUESTIONS = [...selectedQ, ...resumeQuestions];
  const ENABLE_EYE_CONTACT      = localStorage.getItem("iq_eye_contact")           !== "false";
  const ENABLE_FACIAL_ANALYSIS  = localStorage.getItem("iq_facial_analysis")       !== "false";
  const ENABLE_SPEECH           = localStorage.getItem("iq_speech_transcription")  !== "false";
  const ENABLE_NLP              = localStorage.getItem("iq_nlp_scoring")           !== "false";
  const ENABLE_POSTURE          = localStorage.getItem("iq_posture_detection")     === "true";

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const recognitionRef = useRef(null);
  const mlIntervalRef = useRef(null);
  const cameraOnRef = useRef(false);

  const [currentQ,    setCurrentQ]    = useState(0);
  const [isRunning,   setIsRunning]   = useState(false);
  const [cameraOn,    setCameraOn]    = useState(false);
  const [permDenied,  setPermDenied]  = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [transcript,  setTranscript]  = useState("");
  const [answered,    setAnswered]    = useState([]);
  const [completed,   setCompleted]   = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [interviewId, setInterviewId] = useState(null);
  const [mlConnected, setMlConnected] = useState(false);
  const [mlScores,    setMlScores]    = useState({ eyeContact: 0, postureScore: 0, overallScore: 0, postureFeedback: "", makingContact: false });
  const [nlpScores,   setNlpScores]   = useState({ nlpScore: 0, fillerScore: 0, grammarScore: 0, confidenceScore: 0, confidenceLabel: "", fillerCount: 0 });

  const { multiFaceWarning, multiFaceCount } = useMultiFaceDetection(videoRef, cameraOn);
  const token = localStorage.getItem("iq_token");
  const q = ALL_QUESTIONS[currentQ];
  const meta = typeMeta[q?.type] || typeMeta.Behavioral;
  const progress = Math.round((answered.length / ALL_QUESTIONS.length) * 100);

  useEffect(() => () => { stopCamera(); stopSTT(); }, []);

  const captureAndAnalyse = async () => {
    if (!videoRef.current || !cameraOnRef.current) return;
    if (videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
      const base64Frame = canvas.toDataURL("image/jpeg", 0.7);
      if (base64Frame === "data:,") return;
      const res = await fetch("http://localhost:5001/analyse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ frame: base64Frame }) });
      const data = await res.json();
      if (data.success) {
        setMlConnected(true);
        setMlScores({ eyeContact: data.eye_contact?.confidence || 0, postureScore: data.posture?.score || 0, overallScore: data.overall_score || 0, postureFeedback: data.posture?.feedback || "", makingContact: data.eye_contact?.making_contact || false });
        if (ENABLE_EYE_CONTACT && !data.eye_contact?.making_contact) {
          setShowWarning(true); clearTimeout(warningTimeoutRef.current);
          warningTimeoutRef.current = setTimeout(() => setShowWarning(false), 3000);
        } else { clearTimeout(warningTimeoutRef.current); setShowWarning(false); }
      }
    } catch (err) { if (err.message?.includes("fetch") || err.message?.includes("Failed")) setMlConnected(false); }
  };

  const startSTT = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !ENABLE_SPEECH) return;
    const recognition = new SR();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = "en-US";
    let final = "";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      setTranscript(final + interim);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => { if (streamRef.current) recognition.start(); else setIsListening(false); };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSTT = () => {
    if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); recognitionRef.current = null; }
    setIsListening(false);
  };

  useEffect(() => {
    if (!cameraOn || !ENABLE_EYE_CONTACT) return;
    let intervalId; let modelsLoaded = false;
    const loadModels = async () => {
      const faceapi = await import("@vladmandic/face-api");
      await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri("/models"), faceapi.nets.faceLandmark68Net.loadFromUri("/models")]);
      modelsLoaded = true; return faceapi;
    };
    const detectEyeContact = async (faceapi) => {
      if (!videoRef.current || !modelsLoaded || videoRef.current.readyState < 2) return;
      const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
      let lookingAway = !detection;
      if (detection) {
        const lm = detection.landmarks;
        const nose = lm.getNose()[3];
        const le = lm.getLeftEye(), re = lm.getRightEye();
        const eyeMidX = (le.reduce((s,p) => s+p.x,0)/le.length + re.reduce((s,p) => s+p.x,0)/re.length) / 2;
        lookingAway = (Math.abs(nose.x - eyeMidX) / detection.detection.box.width) > 0.12;
      }
      if (lookingAway) { setShowWarning(true); clearTimeout(warningTimeoutRef.current); warningTimeoutRef.current = setTimeout(() => setShowWarning(false), 3000); }
      else { clearTimeout(warningTimeoutRef.current); setShowWarning(false); }
    };
    loadModels().then(faceapi => { intervalId = setInterval(() => detectEyeContact(faceapi), 1500); }).catch(() => {});
    return () => { clearInterval(intervalId); clearTimeout(warningTimeoutRef.current); };
  }, [cameraOn]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream; cameraOnRef.current = true;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setCameraOn(true); setIsRunning(true); setPermDenied(false);
      startSTT();
      if (ENABLE_FACIAL_ANALYSIS || ENABLE_POSTURE) mlIntervalRef.current = setInterval(captureAndAnalyse, 1000);
      fetch("http://localhost:5001/health").then(r => r.json()).then(d => { if (d.status === "ok") setMlConnected(true); }).catch(() => setMlConnected(false));
    } catch { setPermDenied(true); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null; cameraOnRef.current = false;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false); setIsRunning(false); stopSTT();
    clearInterval(mlIntervalRef.current); mlIntervalRef.current = null;
  };

  const analyseNLP = async (text) => {
    if (!ENABLE_NLP || !text || text.split(/\s+/).filter(Boolean).length < 5) return;
    try {
      const res = await fetch("http://localhost:5001/analyse/nlp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: text, question: q.text }) });
      const data = await res.json();
      if (data.success) setNlpScores({ nlpScore: data.nlp_score || 0, fillerScore: data.filler_words?.filler_score || 0, grammarScore: data.grammar?.grammar_score || 0, confidenceScore: data.confidence?.confidence_score || 0, confidenceLabel: data.confidence?.confidence_label || "", fillerCount: data.filler_words?.total_fillers || 0 });
    } catch {}
  };

  const saveAnswer = async (qIndex, qText, qType, text) => {
    analyseNLP(text);
    try {
      let currentId = interviewId;
      if (!currentId) {
        const res = await fetch("http://localhost:5000/api/interviews/start", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ role: "General Interview" }) });
        const data = await res.json();
        currentId = data.interview?.id; setInterviewId(currentId);
        if (currentId) localStorage.setItem("iq_last_interview_id", currentId);
      }
      if (!currentId) return;
      await fetch(`http://localhost:5000/api/interviews/${currentId}/answer`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ questionIndex: qIndex, questionText: qText, questionType: qType, transcript: text, wordCount: text.split(/\s+/).filter(Boolean).length, eyeContactScore: mlScores.eyeContact, postureScore: mlScores.postureScore, nlpScore: nlpScores.nlpScore, fillerScore: nlpScores.fillerScore, grammarScore: nlpScores.grammarScore, confidenceScore: nlpScores.confidenceScore }) });
    } catch {}
  };

  const handleNext = async () => {
    setIsLoading(true);
    await saveAnswer(currentQ, q.text, q.type, transcript);
    setIsLoading(false);
    if (!answered.includes(currentQ)) setAnswered(a => [...a, currentQ]);
    if (currentQ < ALL_QUESTIONS.length - 1) {
      setCurrentQ(p => p + 1); setTranscript(""); stopSTT();
      setTimeout(() => { if (streamRef.current) startSTT(); }, 300);
    } else { stopCamera(); setCompleted(true); }
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const currentId = interviewId || localStorage.getItem("iq_last_interview_id");
      const multiFaceWarnings = parseInt(localStorage.getItem("iq_multi_face_warnings") || "0");
      if (currentId) {
        await fetch(`http://localhost:5000/api/interviews/${currentId}/complete`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ durationSeconds: 0, eyeContactWarnings: 0, multiFaceWarnings, eyeContactScore: mlScores.eyeContact, postureScore: mlScores.postureScore }) });
        await fetch(`http://localhost:5000/api/ai/evaluate/${currentId}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ eyeContactScore: mlScores.eyeContact, facialEngagementScore: mlScores.overallScore, postureScore: mlScores.postureScore }) });
        localStorage.setItem("iq_last_interview_id", currentId);
      }
    } catch {} finally { setIsLoading(false); }
    localStorage.removeItem("iq_resume_questions");
    stopCamera(); navigate("/results");
  };

  const jumpTo = (i) => {
    if (!answered.includes(currentQ) && transcript.trim()) setAnswered(a => [...a, currentQ]);
    setCurrentQ(i); setTranscript(""); stopSTT();
    setTimeout(() => { if (streamRef.current) startSTT(); }, 300);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .iq-fade { animation: fadeUp 0.35s ease both; }
        textarea:focus { outline: none; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", background: T.bg, fontFamily: T.font, color: T.text }}>
        <Sidebar activePage="Interviews" />
        <EyeContactWarning visible={showWarning} onDismiss={() => setShowWarning(false)} />
        <MultiFaceWarning visible={multiFaceWarning} count={multiFaceCount} />

        <main style={{ marginLeft: "240px", flex: 1, overflowY: "auto" }}>

          {/* ── Sticky top bar ── */}
          <div style={{
            background: T.white, borderBottom: `1px solid ${T.border}`,
            padding: "0 28px", display: "flex", alignItems: "center",
            justifyContent: "space-between", height: "58px",
            position: "sticky", top: 0, zIndex: 10,
          }}>
            {/* Left: title + ML status */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>Live Session</span>
                {resumeQuestions.length > 0 && (
                  <span style={{ fontSize: "12px", color: T.green, marginLeft: "8px", fontWeight: 600 }}>
                    ✓ {resumeQuestions.length} resume questions added
                  </span>
                )}
              </div>
              <Pill color={mlConnected ? T.green : T.red} bg={mlConnected ? T.greenBg : T.redBg} border={mlConnected ? T.greenBd : T.redBd}>
                {mlConnected ? "● ML Active" : "○ ML Offline"}
              </Pill>
            </div>

            {/* Right: timer + end button */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <InterviewTimer isRunning={isRunning} />
              <button onClick={handleFinish} disabled={isLoading}
                style={{
                  padding: "7px 16px", borderRadius: "8px",
                  background: "none", border: `1.5px solid ${T.red}`,
                  color: T.red, fontWeight: 700, fontSize: "12px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1, fontFamily: T.font, transition: "all 0.18s",
                }}
                onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = T.red; e.currentTarget.style.color = "#fff"; }}}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = T.red; }}
              >{isLoading ? "Saving…" : "End Interview"}</button>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "24px 28px" }} className="iq-fade">

            {/* ── Progress strip ── */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: T.muted, marginBottom: "6px", fontWeight: 600 }}>
                <span>Question {currentQ + 1} of {ALL_QUESTIONS.length}</span>
                <span>{progress}% answered</span>
              </div>
              <div style={{ height: "4px", background: T.border, borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: T.accent, borderRadius: "2px", transition: "width 0.5s ease" }} />
              </div>
            </div>

            {/* ── Main 2-col grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

              {/* ── LEFT: Webcam card ── */}
              <Card style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <CardHeader>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>Webcam Preview</span>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {isListening && <Pill color={T.red} bg={T.redBg} border={T.redBd}>🎙 Listening</Pill>}
                    <Pill color={cameraOn ? T.green : T.muted} bg={cameraOn ? T.greenBg : T.bg} border={cameraOn ? T.greenBd : T.border}>
                      {cameraOn ? "● Live" : "○ Offline"}
                    </Pill>
                  </div>
                </CardHeader>

                {/* Video area */}
                <div style={{ flex: 1, minHeight: "220px", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: cameraOn ? "block" : "none" }} />
                  {!cameraOn && (
                    <div style={{ textAlign: "center", padding: "24px" }}>
                      {/* Camera SVG icon */}
                      <div style={{ width: "64px", height: "64px", borderRadius: "12px", background: T.white, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                        <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
                          <rect x="1" y="7" width="34" height="19" rx="3" fill="#6b6f78" stroke="#1a1d23" strokeWidth="1.8"/>
                          <rect x="1" y="7" width="34" height="5" rx="3" fill="#e9eaec" stroke="#1a1d23" strokeWidth="1.8"/>
                          <rect x="13" y="2" width="7" height="6" rx="1.5" fill="#555" stroke="#1a1d23" strokeWidth="1.5"/>
                          <rect x="4" y="3.5" width="6" height="4" rx="1.2" fill="#6b6f78" stroke="#1a1d23" strokeWidth="1.3"/>
                          <circle cx="18" cy="17" r="7" fill="#888" stroke="#1a1d23" strokeWidth="1.8"/>
                          <circle cx="18" cy="17" r="5" fill="#bcd9f5"/>
                          <path d="M15 14.5 Q16 13.5 17.5 14" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                          <rect x="28" y="9" width="3" height="1.5" rx="0.7" fill="#888"/>
                        </svg>
                      </div>
                      {permDenied ? (
                        <>
                          <p style={{ fontWeight: 700, color: T.text, fontSize: "13px", margin: "0 0 4px" }}>Camera access denied</p>
                          <p style={{ fontSize: "12px", color: T.muted, margin: 0 }}>Allow camera & mic in browser settings, then refresh.</p>
                        </>
                      ) : (
                        <>
                          <p style={{ fontWeight: 700, color: T.text, fontSize: "13px", margin: "0 0 12px" }}>Camera not active</p>
                          <button onClick={startCamera} style={{ padding: "8px 22px", borderRadius: "8px", background: T.accent, color: "#fff", fontWeight: 700, fontSize: "13px", border: "none", cursor: "pointer", fontFamily: T.font }}>
                            ▶ Start Camera
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Metric grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px", padding: "12px 14px", borderTop: `1px solid ${T.border}` }}>
                  <MetricTile label="Eye Contact" value={`${mlScores.eyeContact}%`}      color={T.green}  active={mlConnected} />
                  <MetricTile label="Posture"     value={`${mlScores.postureScore}%`}    color={T.blue}   active={mlConnected} />
                  <MetricTile label="ML Score"    value={`${mlScores.overallScore}%`}    color={T.amber}  active={mlConnected} />
                  <MetricTile label="Confidence"  value={`${nlpScores.confidenceScore}/10`} color={T.purple} active={nlpScores.nlpScore > 0} />
                  <MetricTile label="Grammar"     value={`${nlpScores.grammarScore}/10`} color={T.green}  active={nlpScores.nlpScore > 0} />
                  <MetricTile label="NLP Score"   value={`${nlpScores.nlpScore}%`}       color={T.blue}   active={nlpScores.nlpScore > 0} />
                </div>

                {/* Inline alerts */}
                {nlpScores.fillerCount > 3 && (
                  <div style={{ margin: "0 14px 10px", padding: "7px 12px", background: T.amberBg, border: `1px solid ${T.amberBd}`, borderRadius: "8px", fontSize: "11px", color: T.amber, fontWeight: 600 }}>
                    ⚠️ {nlpScores.fillerCount} filler words detected — try to speak more deliberately
                  </div>
                )}
                {nlpScores.confidenceLabel && (
                  <div style={{ margin: "0 14px 10px", padding: "7px 12px", background: T.purpleBg, border: `1px solid ${T.purpleBd}`, borderRadius: "8px", fontSize: "11px", color: T.purple, fontWeight: 600 }}>
                    🎯 {nlpScores.confidenceLabel}
                  </div>
                )}
                {mlConnected && mlScores.postureFeedback && mlScores.postureFeedback !== "Good posture!" && (
                  <div style={{ margin: "0 14px 12px", padding: "7px 12px", background: T.amberBg, border: `1px solid ${T.amberBd}`, borderRadius: "8px", fontSize: "11px", color: T.amber, fontWeight: 600 }}>
                    🧍 {mlScores.postureFeedback}
                  </div>
                )}
              </Card>

              {/* ── RIGHT: Question + controls ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                {/* Question card */}
                <Card style={{ flex: 1, padding: "20px", borderLeft: `3px solid ${meta.color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
                    <Pill color={meta.color} bg={meta.bg} border={meta.border}>Q{currentQ + 1}</Pill>
                    <Pill color={meta.color} bg={meta.bg} border={meta.border}>{q?.type}</Pill>
                    {currentQ >= selectedQ.length && <Pill color={T.green} bg={T.greenBg} border={T.greenBd}>📄 Resume</Pill>}
                  </div>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: T.text, lineHeight: 1.55, margin: "0 0 16px" }}>{q?.text}</p>
                  <div style={{ padding: "10px 14px", background: T.bg, border: `1px solid ${T.border}`, borderRadius: "8px", display: "flex", gap: "8px" }}>
                    <span style={{ fontSize: "14px" }}>💡</span>
                    <p style={{ fontSize: "12px", color: T.muted, margin: 0, lineHeight: 1.55 }}>
                      <strong style={{ color: T.text }}>Tip: </strong>{q?.tip}
                    </p>
                  </div>
                </Card>

                {/* Action buttons */}
                {completed ? (
                  <button onClick={handleFinish} disabled={isLoading}
                    style={{ padding: "12px", borderRadius: "8px", background: isLoading ? T.muted : T.accent, color: "#fff", fontWeight: 700, fontSize: "14px", border: "none", cursor: isLoading ? "not-allowed" : "pointer", fontFamily: T.font }}>
                    {isLoading ? "⏳ Evaluating with AI…" : "🏁 View Results →"}
                  </button>
                ) : (
                  <button onClick={handleNext} disabled={isLoading}
                    style={{ padding: "12px", borderRadius: "8px", background: "none", border: `1.5px solid ${T.accent}`, color: T.accent, fontWeight: 700, fontSize: "14px", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1, fontFamily: T.font, transition: "all 0.18s" }}
                    onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = "#fff"; }}}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = T.accent; }}
                  >{isLoading ? "⏳ Saving…" : currentQ === ALL_QUESTIONS.length - 1 ? "Finish & View Results →" : "Next Question →"}</button>
                )}

                <button onClick={() => setShowWarning(true)}
                  style={{ padding: "9px", borderRadius: "8px", background: "none", border: `1px solid ${T.border}`, color: T.muted, fontWeight: 600, fontSize: "12px", cursor: "pointer", fontFamily: T.font, transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.amber}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                >👁️ Test Eye-Contact Warning</button>
              </div>
            </div>

            {/* ── Live Transcript ── */}
            <Card style={{ marginBottom: "16px" }}>
              <CardHeader>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "3px", height: "14px", borderRadius: "2px", background: T.blue }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>Live Transcript</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "11px", color: isListening ? T.red : T.muted }}>
                    {isListening ? "🔴 Listening…" : cameraOn ? "⏸ Mic paused" : "Start camera to begin"}
                  </span>
                  <button onClick={() => setTranscript("")}
                    style={{ background: "none", border: "none", fontSize: "11px", color: T.muted, cursor: "pointer", fontFamily: T.font }}
                    onMouseEnter={e => e.currentTarget.style.color = T.red}
                    onMouseLeave={e => e.currentTarget.style.color = T.muted}
                  >Clear</button>
                </div>
              </CardHeader>
              <div style={{ padding: "14px 18px" }}>
                <textarea
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder={isListening ? "Speak now — your words will appear here in real time…" : "Start camera to begin transcription, or type manually…"}
                  style={{
                    width: "100%", minHeight: "100px", border: `1.5px solid ${isListening ? T.blue : T.border}`,
                    borderRadius: "8px", padding: "12px 14px", fontSize: "13px", color: T.text,
                    background: T.bg, resize: "vertical", fontFamily: T.font, lineHeight: 1.6,
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.background = T.white; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = isListening ? T.blue : T.border; e.currentTarget.style.background = T.bg; }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                  <span style={{ fontSize: "11px", color: T.muted }}>{transcript.split(/\s+/).filter(Boolean).length} words</span>
                  <span style={{ fontSize: "11px", color: isListening ? T.blue : T.muted }}>
                    {isListening ? "🎙️ Web Speech API active" : "Web Speech API ready"}
                  </span>
                </div>
              </div>
            </Card>

            {/* ── Question Navigator ── */}
            <Card style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: T.text, margin: "0 0 12px" }}>Question Navigator</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {ALL_QUESTIONS.map((qItem, i) => {
                  const isCurrent  = i === currentQ;
                  const isAnswered = answered.includes(i);
                  const isResume   = i >= selectedQ.length;
                  return (
                    <button key={i} onClick={() => jumpTo(i)} title={qItem.text}
                      style={{
                        width: "36px", height: "36px", borderRadius: "8px",
                        border: `1.5px solid ${isCurrent ? T.accent : isAnswered ? T.greenBd : isResume ? T.amberBd : T.border}`,
                        background: isCurrent ? T.accent : isAnswered ? T.greenBg : isResume ? T.amberBg : T.white,
                        color: isCurrent ? "#fff" : isAnswered ? T.green : isResume ? T.amber : T.muted,
                        fontWeight: 700, fontSize: "13px", cursor: "pointer",
                        transition: "all 0.15s", fontFamily: T.font,
                      }}
                      onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.borderColor = T.accent; }}
                      onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.borderColor = isAnswered ? T.greenBd : isResume ? T.amberBd : T.border; }}
                    >{i + 1}</button>
                  );
                })}
              </div>
              <p style={{ fontSize: "11px", color: T.muted, margin: "10px 0 0" }}>
                <span style={{ color: T.accent, fontWeight: 700 }}>Indigo</span> = current &nbsp;·&nbsp;
                <span style={{ color: T.green,  fontWeight: 700 }}>Green</span> = answered &nbsp;·&nbsp;
                <span style={{ color: T.amber,  fontWeight: 700 }}>Amber</span> = resume question &nbsp;·&nbsp;
                <span style={{ color: T.muted }}>Grey</span> = not visited
              </p>
            </Card>

          </div>
        </main>
      </div>
    </>
  );
}