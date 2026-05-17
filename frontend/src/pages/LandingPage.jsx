import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// ── Design tokens (matching index.css) ────────────────────────────────────────
const T = {
  bgBase:      "#0A0A0A",
  bgSurface:   "#111111",
  bgCard:      "#141414",
  bgElevated:  "#1A1A1A",
  bgHover:     "#1E1E1E",
  borderSubtle:"#1E1E1E",
  borderBase:  "#2A2A2A",
  borderStrong:"#3A3A3A",
  textPrimary: "#F5F0E8",
  textSecond:  "#A0A0A0",
  textMuted:   "#666666",
  textDim:     "#444444",
  green:       "#4ADE80",
  red:         "#F87171",
  amber:       "#FBBF24",
  blue:        "#60A5FA",
};

const features = [
  { icon: "—", label: "Speech Analysis",       desc: "Tone, pacing, filler words, and vocal clarity scored in real time." },
  { icon: "—", label: "Eye Contact Tracking",  desc: "Computer vision detects gaze direction and engagement throughout." },
  { icon: "—", label: "NLP Content Scoring",   desc: "Answer relevance, depth, structure, and keyword alignment." },
  { icon: "—", label: "Multimodal Fusion",     desc: "Audio, video, and text signals fused into one performance index." },
  { icon: "—", label: "Instant AI Feedback",   desc: "Post-session reports pinpoint strengths and improvement areas." },
  { icon: "—", label: "Resume-Based Questions",desc: "Upload your CV — the AI generates questions tailored to your experience." },
];

const stats = [
  { value: "94%",  label: "Prediction Accuracy" },
  { value: "12K+", label: "Interviews Analyzed" },
  { value: "3.2×", label: "Faster Improvement" },
  { value: "50ms", label: "Analysis Latency" },
];

const process = [
  { num: "01", title: "Upload Resume",      desc: "Drop your CV — the system reads it and generates personalised questions instantly." },
  { num: "02", title: "Start Interview",    desc: "Answer questions on camera. Speech, facial signals, and content are captured live." },
  { num: "03", title: "AI Evaluates",       desc: "Gemini AI and NLP models score every dimension of your performance." },
  { num: "04", title: "Review & Improve",   desc: "Get a detailed report. Retake, compare scores, and track progress over time." },
];

// ── Demo Modal ────────────────────────────────────────────────────────────────
function DemoModal({ onClose }) {
  const [step,        setStep]        = useState("intro");
  const [transcript,  setTranscript]  = useState("");
  const [isTyping,    setIsTyping]    = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [eyeScore,    setEyeScore]    = useState(0);
  const [scores,      setScores]      = useState(null);
  const [scoreAnim,   setScoreAnim]   = useState(0);
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const navigate  = useNavigate();

  const DEMO_QUESTION   = "Tell me about yourself and your greatest professional strength.";
  const FAKE_TRANSCRIPT = "I'm a software engineer with 3 years of experience building scalable web applications. My greatest strength is problem-solving — I thrive when breaking down complex challenges into clear, actionable steps. At my last role I reduced API response time by 40% by identifying a bottleneck in our database queries.";
  const DEMO_SCORES     = {
    overall: 82, confidence: 76, communication: 91, attention: 68,
    dimensions: { subjectMatterAuthority: 88, persuasiveAuthority: 79, answerArchitecture: 92, presenceEngagement: 65, responseTiming: 84, emotionalIntelligence: 71 },
    feedback: {
      contentQuality:  "Excellent use of a concrete example with measurable impact. Strong subject matter authority and clear logical flow.",
      vocalDelivery:   "Confident and well-paced with minimal filler words. Consider varying tone to maintain engagement.",
      bodyLanguage:    "Good eye contact for most of the response. Brief lapses detected — keep gaze steady at key points.",
      answerStructure: "Strong STAR-method compliance. Situation, action, and quantifiable result clearly outlined.",
    },
  };

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

  useEffect(() => () => stopCamera(), []);

  const startDemo = async () => {
    setStep("interview");
    await startCamera();
    let score = 0;
    const eyeInterval = setInterval(() => { score = Math.min(85, score + Math.random() * 8); setEyeScore(Math.round(score)); }, 800);
    setTimeout(() => { setShowWarning(true); setTimeout(() => setShowWarning(false), 3000); }, 2000);
    setTimeout(() => {
      setIsTyping(true);
      let i = 0;
      const typeInterval = setInterval(() => {
        i += 3;
        setTranscript(FAKE_TRANSCRIPT.slice(0, i));
        if (i >= FAKE_TRANSCRIPT.length) { clearInterval(typeInterval); setIsTyping(false); clearInterval(eyeInterval); setEyeScore(85); }
      }, 30);
    }, 1500);
  };

  const showResults = () => {
    stopCamera(); setStep("results"); setScores(DEMO_SCORES);
    let s = 0;
    const interval = setInterval(() => { s += 2; setScoreAnim(Math.min(s, DEMO_SCORES.overall)); if (s >= DEMO_SCORES.overall) clearInterval(interval); }, 20);
  };

  const overlay = { position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(8px)" };
  const modal   = { background: T.bgSurface, border: `1px solid ${T.borderBase}`, borderRadius: "12px", width: "100%", maxWidth: step === "results" ? "860px" : "760px", maxHeight: "90vh", overflowY: "auto", position: "relative" };

  // INTRO
  if (step === "intro") return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
            <div>
              <p style={{ fontSize: "11px", color: T.textMuted, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>Interactive Demo</p>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: T.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>See InterviewQ in action</h2>
            </div>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${T.borderBase}`, color: T.textMuted, width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "24px" }}>
            {[["📹", "Live webcam preview"], ["📝", "Real-time transcript"], ["👁️", "Eye-contact detection"], ["🤖", "AI feedback cards"], ["📊", "Score breakdown"], ["🎯", "Dimension analysis"]].map(([icon, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: T.bgCard, border: `1px solid ${T.borderSubtle}`, borderRadius: "8px" }}>
                <span style={{ fontSize: "15px" }}>{icon}</span>
                <span style={{ fontSize: "13px", color: T.textSecond }}>{label}</span>
              </div>
            ))}
          </div>

          <button onClick={startDemo} style={{ width: "100%", padding: "12px", background: T.textPrimary, border: "none", borderRadius: "8px", color: "#0A0A0A", fontWeight: 700, fontSize: "14px", cursor: "pointer", letterSpacing: "-0.01em" }}>
            Start Demo →
          </button>
          <p style={{ fontSize: "11px", color: T.textDim, textAlign: "center", marginTop: "10px" }}>Webcam requested · No data stored · Demo only</p>
        </div>
      </div>
    </div>
  );

  // INTERVIEW
  if (step === "interview") return (
    <div style={overlay}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <p style={{ fontSize: "10px", color: T.textMuted, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>Live Demo</p>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: T.textPrimary, margin: 0 }}>Mock Interview</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "999px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.red, display: "inline-block" }} />
              <span style={{ fontSize: "11px", color: T.red, fontWeight: 600 }}>LIVE</span>
            </div>
          </div>

          {showWarning && (
            <div style={{ background: "rgba(248,113,113,0.06)", border: `1px solid rgba(248,113,113,0.2)`, borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px" }}>👁️</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: T.red, margin: 0 }}>Eye Contact Warning</p>
                <p style={{ fontSize: "11px", color: T.textMuted, margin: 0 }}>Please look directly at the camera</p>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div style={{ background: T.bgCard, border: `1px solid ${T.borderBase}`, borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: T.textSecond }}>Webcam</span>
                <span style={{ fontSize: "10px", padding: "2px 8px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "999px", color: T.green, fontWeight: 600 }}>● LIVE</span>
              </div>
              <div style={{ minHeight: "160px", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "160px", objectFit: "cover" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", padding: "10px" }}>
                {[{ label: "Eye Contact", value: `${eyeScore}%`, color: T.green }, { label: "Expression", value: "😊", color: T.blue }, { label: "Engagement", value: "High", color: T.amber }].map((m) => (
                  <div key={m.label} style={{ textAlign: "center", padding: "6px", background: T.bgSurface, borderRadius: "6px", border: `1px solid ${T.borderSubtle}` }}>
                    <p style={{ fontSize: "9px", color: T.textDim, margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase" }}>{m.label}</p>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: m.color, margin: 0 }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: T.bgCard, border: `1px solid ${T.borderBase}`, borderLeft: `2px solid ${T.textPrimary}`, borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "6px" }}>
                <span style={{ padding: "2px 8px", background: T.bgElevated, border: `1px solid ${T.borderBase}`, borderRadius: "4px", fontSize: "10px", color: T.textSecond, fontWeight: 600 }}>Q1</span>
                <span style={{ padding: "2px 8px", background: T.bgElevated, border: `1px solid ${T.borderBase}`, borderRadius: "4px", fontSize: "10px", color: T.textSecond, fontWeight: 600 }}>Behavioral</span>
              </div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: T.textPrimary, lineHeight: 1.5, margin: 0 }}>{DEMO_QUESTION}</p>
              <div style={{ padding: "8px 10px", background: T.bgSurface, border: `1px solid ${T.borderSubtle}`, borderRadius: "6px" }}>
                <p style={{ fontSize: "11px", color: T.textMuted, margin: 0 }}>Use Present–Past–Future structure. Keep it under 2 minutes.</p>
              </div>
              <button onClick={showResults} style={{ marginTop: "auto", padding: "10px", background: T.textPrimary, border: "none", borderRadius: "8px", color: "#0A0A0A", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                Finish & See Results →
              </button>
            </div>
          </div>

          <div style={{ background: T.bgCard, border: `1px solid ${T.borderBase}`, borderRadius: "10px", padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: T.textSecond }}>Live Transcript</span>
              <span style={{ fontSize: "11px", color: isTyping ? T.red : T.textDim }}>{isTyping ? "🔴 Transcribing..." : "Ready"}</span>
            </div>
            <div style={{ minHeight: "60px", background: T.bgSurface, border: `1px solid ${T.borderSubtle}`, borderRadius: "6px", padding: "10px", fontSize: "13px", color: T.textSecond, lineHeight: 1.7 }}>
              {transcript || <span style={{ color: T.textDim }}>Listening for speech…</span>}
              {isTyping && <span style={{ color: T.textPrimary }}>|</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // RESULTS
  if (step === "results" && scores) return (
    <div style={overlay}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <p style={{ fontSize: "10px", color: T.textMuted, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px" }}>Demo Results</p>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: T.textPrimary, margin: 0 }}>AI Performance Report</h2>
            </div>
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${T.borderBase}`, color: T.textMuted, width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          {/* Score hero */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.borderBase}`, borderRadius: "10px", padding: "20px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: T.bgElevated, border: `2px solid ${T.borderStrong}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "26px", fontWeight: 700, color: T.textPrimary, lineHeight: 1 }}>{scoreAnim}</span>
                <span style={{ fontSize: "10px", color: T.textMuted }}>/100</span>
              </div>
              <p style={{ fontSize: "10px", color: T.textMuted, margin: "6px 0 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Overall</p>
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: T.textPrimary, margin: "0 0 6px" }}>Strong performance</h3>
              <p style={{ fontSize: "12px", color: T.textSecond, margin: 0, lineHeight: 1.6 }}>Communication and answer architecture scored above average. Eye contact consistency has room to improve.</p>
            </div>
          </div>

          {/* 4 score cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "12px" }}>
            {[["Confidence", scores.confidence], ["Communication", scores.communication], ["Attention", scores.attention], ["Overall", scores.overall]].map(([label, val]) => (
              <div key={label} style={{ background: T.bgCard, border: `1px solid ${T.borderBase}`, borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: T.textMuted, margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                <p style={{ fontSize: "22px", fontWeight: 700, color: T.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>{val}</p>
                <p style={{ fontSize: "10px", color: T.textDim, margin: 0 }}>/100</p>
              </div>
            ))}
          </div>

          {/* Dimension bars */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.borderBase}`, borderRadius: "10px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: T.textSecond, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Dimension Breakdown</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[["Subject Matter Authority", scores.dimensions.subjectMatterAuthority], ["Persuasive Authority", scores.dimensions.persuasiveAuthority], ["Answer Architecture", scores.dimensions.answerArchitecture], ["Emotional Intelligence", scores.dimensions.emotionalIntelligence], ["Response Timing", scores.dimensions.responseTiming], ["Presence & Engagement", scores.dimensions.presenceEngagement]].map(([label, score]) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                    <span style={{ color: T.textSecond }}>{label}</span>
                    <span style={{ color: T.textPrimary, fontWeight: 600 }}>{score}%</span>
                  </div>
                  <div style={{ height: "3px", background: T.borderSubtle, borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${score}%`, background: T.textPrimary, borderRadius: "999px", transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Feedback */}
          <div style={{ background: T.bgCard, border: `1px solid ${T.borderBase}`, borderRadius: "10px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: T.textSecond, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Gemini AI Feedback</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[["Content Quality", scores.feedback.contentQuality], ["Vocal Delivery", scores.feedback.vocalDelivery], ["Body Language", scores.feedback.bodyLanguage], ["Answer Structure", scores.feedback.answerStructure]].map(([label, text]) => (
                <div key={label} style={{ background: T.bgSurface, border: `1px solid ${T.borderSubtle}`, borderRadius: "8px", padding: "12px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: T.textSecond, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
                  <p style={{ fontSize: "11px", color: T.textMuted, margin: 0, lineHeight: 1.6 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button onClick={onClose} style={{ padding: "11px", background: "transparent", border: `1px solid ${T.borderBase}`, borderRadius: "8px", color: T.textSecond, fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Close Demo</button>
            <button onClick={() => { onClose(); navigate("/auth"); }} style={{ padding: "11px", background: T.textPrimary, border: "none", borderRadius: "8px", color: "#0A0A0A", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Start Real Interview →</button>
          </div>
        </div>
      </div>
    </div>
  );

  return null;
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate  = useNavigate();
  const [showDemo, setShowDemo] = useState(false);

  return (
    // ✅ CHANGE 2: background updated to linear-gradient
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #0f2520 0%, #0A0A0A 45%)", fontFamily: "'Inter', -apple-system, sans-serif", color: T.textSecond }}>
      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}

      {/* ── Navbar ── */}
      {/* ✅ CHANGE 1: navbar background updated to rgba(15,37,32,0.92) */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, height: "56px", background: "rgba(15,37,32,0.92)", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", zIndex: 50, backdropFilter: "blur(12px)" }}>
        <span style={{ fontSize: "15px", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.03em", cursor: "pointer" }} onClick={() => navigate("/")}>
          InterviewQ
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={() => setShowDemo(true)} style={{ padding: "7px 14px", background: "transparent", border: `1px solid ${T.borderBase}`, borderRadius: "6px", color: T.textSecond, fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = T.borderStrong; e.currentTarget.style.color = T.textPrimary; }}
            onMouseOut={(e)  => { e.currentTarget.style.borderColor = T.borderBase;   e.currentTarget.style.color = T.textSecond; }}
          >Demo</button>
          <button onClick={() => navigate("/auth")} style={{ padding: "7px 16px", background: T.textPrimary, border: "none", borderRadius: "6px", color: "#0A0A0A", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#E8E3DB")}
            onMouseOut={(e)  => (e.currentTarget.style.background = T.textPrimary)}
          >Get Started</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop: "140px", paddingBottom: "100px", paddingLeft: "32px", paddingRight: "32px", maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", background: T.bgCard, border: `1px solid ${T.borderBase}`, borderRadius: "999px", marginBottom: "32px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.green, display: "inline-block" }} />
          <span style={{ fontSize: "12px", color: T.textMuted, fontWeight: 500, letterSpacing: "0.04em" }}>Multimodal AI · Real-Time Evaluation</span>
        </div>

        <h1 style={{ fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.03em", lineHeight: 1.08, margin: "0 0 20px" }}>
          Interview performance,<br />evaluated precisely.
        </h1>

        <p style={{ fontSize: "17px", color: T.textSecond, lineHeight: 1.7, maxWidth: "540px", margin: "0 0 36px" }}>
          InterviewQ fuses speech acoustics, facial behaviour, and NLP signals into a single performance index — giving candidates data-driven feedback that actually moves the needle.
        </p>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/auth")} style={{ padding: "11px 24px", background: T.textPrimary, border: "none", borderRadius: "8px", color: "#0A0A0A", fontSize: "14px", fontWeight: 600, cursor: "pointer", letterSpacing: "-0.01em" }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#E8E3DB")}
            onMouseOut={(e)  => (e.currentTarget.style.background = T.textPrimary)}
          >Start for free →</button>
          <button onClick={() => setShowDemo(true)} style={{ padding: "11px 24px", background: "transparent", border: `1px solid ${T.borderBase}`, borderRadius: "8px", color: T.textSecond, fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = T.borderStrong; e.currentTarget.style.color = T.textPrimary; }}
            onMouseOut={(e)  => { e.currentTarget.style.borderColor = T.borderBase;   e.currentTarget.style.color = T.textSecond; }}
          >View demo</button>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ borderTop: `1px solid ${T.borderSubtle}`, borderBottom: `1px solid ${T.borderSubtle}`, padding: "40px 32px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "32px" }}>
          {stats.map((s) => (
            <div key={s.label}>
              <p style={{ fontSize: "28px", fontWeight: 700, color: T.textPrimary, margin: "0 0 4px", letterSpacing: "-0.03em" }}>{s.value}</p>
              <p style={{ fontSize: "12px", color: T.textMuted, margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: "100px 32px", maxWidth: "860px", margin: "0 auto" }}>
        <p style={{ fontSize: "11px", color: T.textMuted, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>How it works</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.03em", margin: "0 0 56px", lineHeight: 1.15 }}>
          From upload to insight<br />in four steps.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
          {process.map((p, i) => (
            <div key={p.num} style={{ padding: "28px", background: i % 2 === 0 ? T.bgCard : T.bgSurface, border: `1px solid ${T.borderSubtle}`, borderRadius: i === 0 ? "12px 0 0 0" : i === 1 ? "0 12px 0 0" : i === 2 ? "0 0 0 12px" : "0 0 12px 0" }}>
              <p style={{ fontSize: "11px", color: T.textDim, fontWeight: 600, margin: "0 0 12px", letterSpacing: "0.06em" }}>{p.num}</p>
              <p style={{ fontSize: "15px", fontWeight: 600, color: T.textPrimary, margin: "0 0 8px", letterSpacing: "-0.01em" }}>{p.title}</p>
              <p style={{ fontSize: "13px", color: T.textMuted, margin: 0, lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ borderTop: `1px solid ${T.borderSubtle}`, padding: "100px 32px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", color: T.textMuted, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>Capabilities</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.03em", margin: "0 0 56px", lineHeight: 1.15 }}>
            Every signal, measured.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", background: T.borderSubtle, border: `1px solid ${T.borderSubtle}`, borderRadius: "12px", overflow: "hidden" }}>
            {features.map((f) => (
              <div key={f.label} style={{ padding: "24px", background: T.bgBase }}
                onMouseOver={(e) => (e.currentTarget.style.background = T.bgCard)}
                onMouseOut={(e)  => (e.currentTarget.style.background = T.bgBase)}
              >
                <p style={{ fontSize: "14px", fontWeight: 600, color: T.textPrimary, margin: "0 0 8px", letterSpacing: "-0.01em" }}>{f.label}</p>
                <p style={{ fontSize: "13px", color: T.textMuted, margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture diagram ── */}
      <section style={{ borderTop: `1px solid ${T.borderSubtle}`, padding: "100px 32px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "11px", color: T.textMuted, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>Architecture</p>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.03em", margin: "0 0 16px", lineHeight: 1.15 }}>
              Beyond keyword matching.
            </h2>
            <p style={{ fontSize: "14px", color: T.textMuted, lineHeight: 1.7, margin: "0 0 16px" }}>
              Traditional tools score text similarity alone. InterviewQ captures every dimension of human communication — what you say, how you say it, and what your face reveals.
            </p>
            <p style={{ fontSize: "14px", color: T.textMuted, lineHeight: 1.7, margin: 0 }}>
              The multimodal fusion engine combines these signals into a single interpretable score with actionable breakdowns.
            </p>
          </div>

          <div style={{ background: T.bgCard, border: `1px solid ${T.borderBase}`, borderRadius: "12px", padding: "24px", fontFamily: "monospace" }}>
            {[
              { layer: "INPUT",    items: ["Audio Stream", "Video Feed", "Transcript"],       color: T.blue },
              { layer: "ANALYSIS", items: ["Acoustic Model", "Vision API", "NLP Engine"],     color: T.green },
              { layer: "FUSION",   items: ["Multimodal Transformer"],                          color: T.textPrimary },
              { layer: "OUTPUT",   items: ["Performance Score", "Actionable Report"],          color: T.amber },
            ].map((row, i) => (
              <div key={row.layer} style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: i < 3 ? "16px" : 0 }}>
                <span style={{ fontSize: "10px", fontWeight: 700, color: T.textDim, width: "64px", flexShrink: 0, paddingTop: "2px", letterSpacing: "0.04em" }}>{row.layer}</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {row.items.map((item) => (
                    <span key={item} style={{ padding: "3px 8px", background: T.bgSurface, border: `1px solid ${T.borderBase}`, borderRadius: "4px", fontSize: "11px", color: row.color }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderTop: `1px solid ${T.borderSubtle}`, padding: "100px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.03em", margin: "0 0 14px", lineHeight: 1.15 }}>
            Start your first session.
          </h2>
          <p style={{ fontSize: "15px", color: T.textMuted, margin: "0 0 32px", lineHeight: 1.6 }}>
            Free to use. No credit card required. Get your first AI performance report in minutes.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={() => navigate("/auth")} style={{ padding: "12px 28px", background: T.textPrimary, border: "none", borderRadius: "8px", color: "#0A0A0A", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#E8E3DB")}
              onMouseOut={(e)  => (e.currentTarget.style.background = T.textPrimary)}
            >Create free account →</button>
            <button onClick={() => setShowDemo(true)} style={{ padding: "12px 24px", background: "transparent", border: `1px solid ${T.borderBase}`, borderRadius: "8px", color: T.textSecond, fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = T.borderStrong; e.currentTarget.style.color = T.textPrimary; }}
              onMouseOut={(e)  => { e.currentTarget.style.borderColor = T.borderBase;   e.currentTarget.style.color = T.textSecond; }}
            >View demo</button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${T.borderSubtle}`, padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.02em" }}>InterviewQ</span>
        <span style={{ fontSize: "12px", color: T.textDim }}>© 2025 · Multimodal AI Research Framework</span>
      </footer>
    </div>
  );
}