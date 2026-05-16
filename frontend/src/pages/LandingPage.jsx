import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import FeatureCard from "../components/FeatureCard";

const features = [
  {
    icon: "🎙️",
    title: "Real-Time Speech Analysis",
    desc: "Evaluates tone, pacing, filler words, and vocal clarity as you speak.",
  },
  {
    icon: "👁️",
    title: "Facial Expression Tracking",
    desc: "Computer vision monitors eye contact, micro-expressions, and confidence cues.",
  },
  {
    icon: "🧠",
    title: "NLP Content Scoring",
    desc: "Assesses answer relevance, depth, structure, and keyword alignment.",
  },
  {
    icon: "📊",
    title: "Multimodal Fusion Engine",
    desc: "Combines audio, video, and text signals into a holistic performance score.",
  },
  {
    icon: "⚡",
    title: "Instant AI Feedback",
    desc: "Post-session reports highlight strengths and concrete improvement areas.",
  },
  {
    icon: "🎯",
    title: "Role-Specific Questions",
    desc: "Curated question banks for tech, management, and behavioral interviews.",
  },
];

const stats = [
  { value: "94%", label: "Prediction Accuracy" },
  { value: "12K+", label: "Interviews Analyzed" },
  { value: "3.2×", label: "Faster Improvement" },
  { value: "50ms", label: "Analysis Latency" },
];

// ── Demo Modal Component ───────────────────────────────────────────────────────
function DemoModal({ onClose }) {
  const [step, setStep]               = useState("intro"); // intro | interview | results
  const [transcript, setTranscript]   = useState("");
  const [isTyping, setIsTyping]       = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [eyeScore, setEyeScore]       = useState(0);
  const [scores, setScores]           = useState(null);
  const [scoreAnim, setScoreAnim]     = useState(0);
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const navigate  = useNavigate();

  const DEMO_QUESTION = "Tell me about yourself and your greatest professional strength.";

  const FAKE_TRANSCRIPT =
    "I'm a software engineer with 3 years of experience building scalable web applications. " +
    "My greatest strength is problem-solving — I thrive when breaking down complex challenges into " +
    "clear, actionable steps. For example, at my last role I reduced API response time by 40% by " +
    "identifying and optimising a bottleneck in our database queries.";

  const DEMO_SCORES = {
    overall:       82,
    confidence:    76,
    communication: 91,
    attention:     68,
    dimensions: {
      subjectMatterAuthority: 88,
      persuasiveAuthority:    79,
      answerArchitecture:     92,
      presenceEngagement:     65,
      responseTiming:         84,
      emotionalIntelligence:  71,
    },
    feedback: {
      contentQuality:  "Excellent use of a concrete example with measurable impact. Your answer demonstrated strong subject matter authority and clear logical flow.",
      vocalDelivery:   "Confident and well-paced delivery with minimal filler words. Consider varying your tone slightly to maintain listener engagement throughout.",
      bodyLanguage:    "Good eye contact maintained for most of the response. Brief lapses detected — try to keep your gaze steady during key points.",
      answerStructure: "Strong STAR-method compliance. You clearly outlined the situation, your action, and the quantifiable result. Well structured overall.",
    },
  };

  // ── Start webcam ──────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch (_) {}
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => stopCamera(), []);

  // ── Start demo interview ──────────────────────────────────────────────────
  const startDemo = async () => {
    setStep("interview");
    await startCamera();

    // Simulate eye contact score rising
    let score = 0;
    const eyeInterval = setInterval(() => {
      score = Math.min(85, score + Math.random() * 8);
      setEyeScore(Math.round(score));
    }, 800);

    // Show eye contact warning after 2 seconds
    setTimeout(() => {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }, 2000);

    // Start fake transcript typing after 1.5 seconds
    setTimeout(() => {
      setIsTyping(true);
      let i = 0;
      const typeInterval = setInterval(() => {
        i += 3;
        setTranscript(FAKE_TRANSCRIPT.slice(0, i));
        if (i >= FAKE_TRANSCRIPT.length) {
          clearInterval(typeInterval);
          setIsTyping(false);
          clearInterval(eyeInterval);
          setEyeScore(85);
        }
      }, 30);
    }, 1500);
  };

  // ── Show results ──────────────────────────────────────────────────────────
  const showResults = () => {
    stopCamera();
    setStep("results");
    setScores(DEMO_SCORES);

    // Animate score counter
    let s = 0;
    const interval = setInterval(() => {
      s += 2;
      setScoreAnim(Math.min(s, DEMO_SCORES.overall));
      if (s >= DEMO_SCORES.overall) clearInterval(interval);
    }, 20);
  };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const overlayStyle = {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(0,0,0,0.85)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px",
    backdropFilter: "blur(4px)",
  };

  const modalStyle = {
    background: "#0d1117",
    border: "1px solid #21262d",
    borderRadius: "16px",
    width: "100%",
    maxWidth: step === "results" ? "860px" : "780px",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
  };

  // ── INTRO STEP ─────────────────────────────────────────────────────────────
  if (step === "intro") return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "32px", textAlign: "center" }}>
          <button onClick={onClose} style={{ position: "absolute", top: "16px", right: "20px", background: "none", border: "none", color: "#666", fontSize: "22px", cursor: "pointer" }}>✕</button>

          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
          <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#fff", marginBottom: "8px" }}>
            Interactive Demo
          </h2>
          <p style={{ color: "#8b949e", marginBottom: "28px", lineHeight: 1.6 }}>
            Experience a live mock interview with AI evaluation, eye-contact tracking, real-time transcription, and a full performance report.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px", textAlign: "left" }}>
            {[
              { icon: "📹", label: "Live webcam preview" },
              { icon: "📝", label: "Real-time transcript" },
              { icon: "👁️", label: "Eye-contact warning" },
              { icon: "🤖", label: "AI feedback cards" },
              { icon: "📊", label: "Score visualization" },
              { icon: "🎯", label: "Dimension breakdown" },
            ].map((f) => (
              <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#161b22", border: "1px solid #21262d", borderRadius: "8px" }}>
                <span style={{ fontSize: "18px" }}>{f.icon}</span>
                <span style={{ fontSize: "13px", color: "#c9d1d9" }}>{f.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={startDemo}
            style={{ padding: "14px 36px", background: "linear-gradient(135deg, #06b6d4, #6366f1)", border: "none", borderRadius: "10px", color: "#fff", fontWeight: 800, fontSize: "15px", cursor: "pointer", width: "100%" }}
          >
            ▶ Start Demo Interview
          </button>
          <p style={{ fontSize: "11px", color: "#484f58", marginTop: "10px" }}>
            Webcam will be requested · No data is stored · Demo only
          </p>
        </div>
      </div>
    </div>
  );

  // ── INTERVIEW STEP ─────────────────────────────────────────────────────────
  if (step === "interview") return (
    <div style={overlayStyle}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "10px", color: "#06b6d4", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Live Demo Session</span>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", margin: "4px 0 0" }}>Mock Interview</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse 1s infinite" }} />
              <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 700 }}>LIVE</span>
            </div>
          </div>

          {/* Eye Contact Warning */}
          {showWarning && (
            <div style={{ background: "#ff000015", border: "1px solid #ef4444", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", animation: "slideIn 0.3s ease" }}>
              <span style={{ fontSize: "20px" }}>👁️</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#ef4444", margin: 0 }}>Eye Contact Warning</p>
                <p style={{ fontSize: "11px", color: "#8b949e", margin: 0 }}>Please look directly at the camera</p>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>

            {/* Webcam */}
            <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #21262d", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#c9d1d9" }}>📹 Webcam</span>
                <span style={{ fontSize: "10px", padding: "2px 8px", background: "#0d4429", border: "1px solid #1a7f37", borderRadius: "999px", color: "#3fb950", fontWeight: 700 }}>● LIVE</span>
              </div>
              <div style={{ position: "relative", minHeight: "180px", background: "#010409", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "180px", objectFit: "cover" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", padding: "10px" }}>
                {[
                  { label: "Eye Contact", value: `${eyeScore}%`, color: "#3fb950" },
                  { label: "Facial Tone", value: "😊", color: "#06b6d4" },
                  { label: "Engagement", value: "High", color: "#f4a426" },
                ].map((m) => (
                  <div key={m.label} style={{ textAlign: "center", padding: "6px", background: "#010409", borderRadius: "6px", border: "1px solid #21262d" }}>
                    <p style={{ fontSize: "9px", color: "#484f58", margin: "0 0 2px" }}>{m.label}</p>
                    <p style={{ fontSize: "13px", fontWeight: 800, color: m.color, margin: 0 }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Question */}
            <div style={{ background: "#161b22", border: "1px solid #21262d", borderLeft: "4px solid #06b6d4", borderRadius: "10px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ padding: "2px 8px", background: "#0d1f2e", border: "1px solid #1f6feb", borderRadius: "4px", fontSize: "10px", color: "#58a6ff", fontWeight: 700 }}>Q1</span>
                <span style={{ padding: "2px 8px", background: "#0d1f2e", border: "1px solid #1f6feb", borderRadius: "4px", fontSize: "10px", color: "#58a6ff", fontWeight: 600 }}>Behavioral</span>
              </div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", lineHeight: 1.5, margin: 0 }}>
                {DEMO_QUESTION}
              </p>
              <div style={{ padding: "10px", background: "#010409", border: "1px solid #21262d", borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: "#8b949e", margin: 0 }}>
                  💡 <strong style={{ color: "#c9d1d9" }}>Tip:</strong> Use the Present–Past–Future structure. Keep it under 2 minutes.
                </p>
              </div>

              <button
                onClick={showResults}
                style={{ marginTop: "auto", padding: "10px", background: "linear-gradient(135deg,#06b6d4,#6366f1)", border: "none", borderRadius: "8px", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
              >
                🏁 Finish & See AI Results →
              </button>
            </div>
          </div>

          {/* Live Transcript */}
          <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "10px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#c9d1d9" }}>
                <span style={{ width: "4px", height: "14px", background: "#06b6d4", display: "inline-block", borderRadius: "2px", marginRight: "8px", verticalAlign: "middle" }} />
                Live Transcript
              </span>
              <span style={{ fontSize: "11px", color: isTyping ? "#ef4444" : "#484f58" }}>
                {isTyping ? "🔴 Transcribing..." : "● Ready"}
              </span>
            </div>
            <div style={{ minHeight: "70px", background: "#010409", border: "1px solid #21262d", borderRadius: "6px", padding: "12px", fontSize: "13px", color: "#c9d1d9", lineHeight: 1.7 }}>
              {transcript || <span style={{ color: "#484f58" }}>Listening for speech…</span>}
              {isTyping && <span style={{ animation: "blink 1s infinite", color: "#06b6d4" }}>|</span>}
            </div>
            <p style={{ fontSize: "11px", color: "#484f58", marginTop: "6px" }}>
              {transcript.split(/\s+/).filter(Boolean).length} words · AI transcription demo
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── RESULTS STEP ──────────────────────────────────────────────────────────
  if (step === "results" && scores) return (
    <div style={overlayStyle}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "10px", color: "#06b6d4", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Demo Results</span>
              <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#fff", margin: "4px 0 0" }}>AI Performance Report</h2>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#666", fontSize: "20px", cursor: "pointer" }}>✕</button>
          </div>

          {/* Score hero */}
          <div style={{ background: "#161b22", border: "1px solid #21262d", borderLeft: "4px solid #3fb950", borderRadius: "10px", padding: "20px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: "#0d4429", border: "3px solid #3fb950", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "28px", fontWeight: 900, color: "#3fb950" }}>{scoreAnim}</span>
                <span style={{ fontSize: "10px", color: "#484f58" }}>/100</span>
              </div>
              <p style={{ fontSize: "10px", color: "#484f58", margin: "6px 0 0", fontWeight: 700, textTransform: "uppercase" }}>Overall</p>
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>Great performance! 🎉</h3>
              <p style={{ fontSize: "12px", color: "#8b949e", margin: 0, lineHeight: 1.6 }}>
                Strong communication score with excellent answer architecture. Eye contact consistency can be improved for a higher overall score.
              </p>
            </div>
          </div>

          {/* 4 Score cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "16px" }}>
            {[
              { label: "Confidence",     value: scores.confidence,    color: "#58a6ff", bg: "#0d1f2e", border: "#1f6feb" },
              { label: "Communication",  value: scores.communication, color: "#bc8cff", bg: "#1a0d2e", border: "#6e40c9" },
              { label: "Attention",      value: scores.attention,     color: "#f4a426", bg: "#1f1500", border: "#7d4e00" },
              { label: "Overall",        value: scores.overall,       color: "#3fb950", bg: "#0d4429", border: "#1a7f37" },
            ].map((s) => (
              <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: "8px", padding: "14px", textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: "#8b949e", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
                <p style={{ fontSize: "24px", fontWeight: 900, color: s.color, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: "10px", color: "#484f58", margin: 0 }}>/100</p>
              </div>
            ))}
          </div>

          {/* Dimension bars */}
          <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#c9d1d9", margin: "0 0 14px" }}>📊 Dimension Breakdown</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "Subject Matter Authority", score: scores.dimensions.subjectMatterAuthority, color: "#3fb950" },
                { label: "Persuasive Authority",     score: scores.dimensions.persuasiveAuthority,    color: "#58a6ff" },
                { label: "Answer Architecture",      score: scores.dimensions.answerArchitecture,     color: "#bc8cff" },
                { label: "Emotional Intelligence",   score: scores.dimensions.emotionalIntelligence,  color: "#f4a426" },
                { label: "Response Timing",          score: scores.dimensions.responseTiming,         color: "#3fb950" },
                { label: "Presence & Engagement",    score: scores.dimensions.presenceEngagement,     color: "#58a6ff" },
              ].map((d) => (
                <div key={d.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                    <span style={{ color: "#8b949e" }}>{d.label}</span>
                    <span style={{ color: d.color, fontWeight: 700 }}>{d.score}%</span>
                  </div>
                  <div style={{ height: "5px", background: "#21262d", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${d.score}%`, background: d.color, borderRadius: "3px", transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Feedback */}
          <div style={{ background: "#161b22", border: "1px solid #21262d", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#c9d1d9", margin: "0 0 12px" }}>🤖 Gemini AI Feedback</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { icon: "🧠", label: "Content Quality",  text: scores.feedback.contentQuality,  color: "#3fb950", bg: "#0d4429", border: "#1a7f37" },
                { icon: "🎙️", label: "Vocal Delivery",   text: scores.feedback.vocalDelivery,   color: "#58a6ff", bg: "#0d1f2e", border: "#1f6feb" },
                { icon: "🪞", label: "Body Language",    text: scores.feedback.bodyLanguage,    color: "#bc8cff", bg: "#1a0d2e", border: "#6e40c9" },
                { icon: "📋", label: "Answer Structure", text: scores.feedback.answerStructure, color: "#f4a426", bg: "#1f1500", border: "#7d4e00" },
              ].map((fb) => (
                <div key={fb.label} style={{ background: fb.bg, border: `1px solid ${fb.border}`, borderRadius: "8px", padding: "12px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: fb.color, margin: "0 0 6px" }}>{fb.icon} {fb.label}</p>
                  <p style={{ fontSize: "11px", color: "#8b949e", margin: 0, lineHeight: 1.6 }}>{fb.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              onClick={() => { onClose(); }}
              style={{ padding: "12px", background: "transparent", border: "2px solid #21262d", borderRadius: "8px", color: "#8b949e", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
            >
              ✕ Close Demo
            </button>
            <button
              onClick={() => { onClose(); navigate("/auth"); }}
              style={{ padding: "12px", background: "linear-gradient(135deg,#06b6d4,#6366f1)", border: "none", borderRadius: "8px", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
            >
              🚀 Start Real Interview →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}

// ── Main Landing Page ──────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-[#060810] text-white font-sans">
      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-24 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-24 left-1/4 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-mono mb-8 tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Multimodal AI · Real-Time · Research Grade
          </span>

          <h1 className="text-6xl md:text-7xl font-black leading-none tracking-tight mb-6">
            <span className="text-white">Interview</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Q</span>
          </h1>

          <p className="text-2xl md:text-3xl font-light text-slate-300 mb-4 leading-snug">
            A Multimodal AI Framework for
          </p>
          <p className="text-2xl md:text-3xl font-semibold text-white mb-8 leading-snug">
            Real-Time Interview Performance Evaluation
          </p>

          <p className="text-slate-400 max-w-2xl mx-auto mb-12 text-lg leading-relaxed">
            InterviewQ fuses speech acoustics, facial behaviour, and NLP signals into a unified
            performance index — giving candidates the edge elite preparation demands.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/auth")}
              className="group relative px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]"
            >
              Start Interview
              <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
            </button>
            <button
              onClick={() => setShowDemo(true)}
              className="px-8 py-4 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 font-semibold rounded-xl text-lg transition-all duration-300 hover:bg-slate-800/50"
            >
              View Demo ▶
            </button>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-slate-800 py-10 px-6 bg-slate-900/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-black text-cyan-400 mb-1">{s.value}</div>
              <div className="text-slate-500 text-sm uppercase tracking-widest font-mono">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6 leading-tight">
                Beyond keyword matching.{" "}
                <span className="text-cyan-400">Beyond gut feel.</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Traditional mock interview tools score answers based on text similarity alone. InterviewQ captures{" "}
                <span className="text-slate-200 font-semibold">every dimension of human communication</span> — the words you choose,
                how your voice projects confidence, and the subtle signals your face reveals.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Built as an academic research framework, the system produces interpretable, multi-dimensional reports
                that show exactly where performance breaks down and how to fix it — fast.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 font-mono text-sm space-y-3">
              {[
                { layer: "INPUT",    items: ["🎤 Audio Stream", "📹 Video Feed", "📝 Transcript"], color: "text-indigo-400" },
                { layer: "ANALYSIS", items: ["Acoustic Features", "Vision Embeddings", "NLP Vectors"], color: "text-cyan-400" },
                { layer: "FUSION",   items: ["Multimodal Transformer"], color: "text-emerald-400" },
                { layer: "OUTPUT",   items: ["Performance Score", "Actionable Report"], color: "text-amber-400" },
              ].map((row) => (
                <div key={row.layer} className="flex items-start gap-3">
                  <span className={`${row.color} font-bold w-20 shrink-0 text-xs pt-0.5`}>{row.layer}</span>
                  <div className="flex flex-wrap gap-2">
                    {row.items.map((item) => (
                      <span key={item} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 bg-slate-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black mb-4">Core Capabilities</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Six integrated modules that turn a nervous rehearsal into data-driven mastery.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-4xl font-black mb-4">Ready to evaluate your performance?</h2>
        <p className="text-slate-500 mb-8">Create a free account and run your first AI-evaluated session in minutes.</p>
        <button
          onClick={() => navigate("/auth")}
          className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(6,182,212,0.35)]"
        >
          Get Started Free
        </button>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-slate-600 text-sm">
        © 2025 InterviewQ · Multimodal AI Research Framework
      </footer>
    </div>
  );
}