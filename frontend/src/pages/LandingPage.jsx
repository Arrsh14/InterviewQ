import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────
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

const stats = [
  { value: "94%",  label: "Prediction Accuracy" },
  { value: "12K+", label: "Interviews Analyzed" },
  { value: "3.2×", label: "Faster Improvement" },
  { value: "50ms", label: "Analysis Latency" },
];

const features = [
  { label: "Speech Analysis",        desc: "Tone, pacing, filler words, and vocal clarity scored in real time." },
  { label: "Eye Contact Tracking",   desc: "Computer vision detects gaze direction and engagement throughout." },
  { label: "NLP Content Scoring",    desc: "Answer relevance, depth, structure, and keyword alignment." },
  { label: "Multimodal Fusion",      desc: "Audio, video, and text signals fused into one performance index." },
  { label: "Instant AI Feedback",    desc: "Post-session reports pinpoint strengths and improvement areas." },
  { label: "Resume-Based Questions", desc: "Upload your CV — the AI generates questions tailored to your experience." },
];

const process = [
  { num: "01", title: "Upload Resume",   desc: "Drop your CV — the system reads it and generates personalised questions instantly." },
  { num: "02", title: "Start Interview", desc: "Answer questions on camera. Speech, facial signals, and content are captured live." },
  { num: "03", title: "AI Evaluates",    desc: "Gemini AI and NLP models score every dimension of your performance." },
  { num: "04", title: "Review & Improve",desc: "Get a detailed report. Retake, compare scores, and track progress over time." },
];

// ── Demo Modal (unchanged) ────────────────────────────────────────────────────
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
            {[["📹","Live webcam preview"],["📝","Real-time transcript"],["👁️","Eye-contact detection"],["🤖","AI feedback cards"],["📊","Score breakdown"],["🎯","Dimension analysis"]].map(([icon, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: T.bgCard, border: `1px solid ${T.borderSubtle}`, borderRadius: "8px" }}>
                <span style={{ fontSize: "15px" }}>{icon}</span>
                <span style={{ fontSize: "13px", color: T.textSecond }}>{label}</span>
              </div>
            ))}
          </div>
          <button onClick={startDemo} style={{ width: "100%", padding: "12px", background: T.textPrimary, border: "none", borderRadius: "8px", color: "#0A0A0A", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Start Demo →</button>
          <p style={{ fontSize: "11px", color: T.textDim, textAlign: "center", marginTop: "10px" }}>Webcam requested · No data stored · Demo only</p>
        </div>
      </div>
    </div>
  );

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
            <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
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
                {[{ label: "Eye Contact", value: `${eyeScore}%`, color: T.green },{ label: "Expression", value: "😊", color: T.blue },{ label: "Engagement", value: "High", color: T.amber }].map((m) => (
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
              <button onClick={showResults} style={{ marginTop: "auto", padding: "10px", background: T.textPrimary, border: "none", borderRadius: "8px", color: "#0A0A0A", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Finish & See Results →</button>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "12px" }}>
            {[["Confidence", scores.confidence],["Communication", scores.communication],["Attention", scores.attention],["Overall", scores.overall]].map(([label, val]) => (
              <div key={label} style={{ background: T.bgCard, border: `1px solid ${T.borderBase}`, borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: T.textMuted, margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                <p style={{ fontSize: "22px", fontWeight: 700, color: T.textPrimary, margin: 0, letterSpacing: "-0.02em" }}>{val}</p>
                <p style={{ fontSize: "10px", color: T.textDim, margin: 0 }}>/100</p>
              </div>
            ))}
          </div>
          <div style={{ background: T.bgCard, border: `1px solid ${T.borderBase}`, borderRadius: "10px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: T.textSecond, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Dimension Breakdown</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[["Subject Matter Authority", scores.dimensions.subjectMatterAuthority],["Persuasive Authority", scores.dimensions.persuasiveAuthority],["Answer Architecture", scores.dimensions.answerArchitecture],["Emotional Intelligence", scores.dimensions.emotionalIntelligence],["Response Timing", scores.dimensions.responseTiming],["Presence & Engagement", scores.dimensions.presenceEngagement]].map(([label, score]) => (
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
          <div style={{ background: T.bgCard, border: `1px solid ${T.borderBase}`, borderRadius: "10px", padding: "16px", marginBottom: "12px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: T.textSecond, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Gemini AI Feedback</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[["Content Quality", scores.feedback.contentQuality],["Vocal Delivery", scores.feedback.vocalDelivery],["Body Language", scores.feedback.bodyLanguage],["Answer Structure", scores.feedback.answerStructure]].map(([label, text]) => (
                <div key={label} style={{ background: T.bgSurface, border: `1px solid ${T.borderSubtle}`, borderRadius: "8px", padding: "12px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: T.textSecond, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
                  <p style={{ fontSize: "11px", color: T.textMuted, margin: 0, lineHeight: 1.6 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
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

// ── Orb Canvas ────────────────────────────────────────────────────────────────
function OrbCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame = 0, raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h * 0.6;
      const pulse = Math.sin(frame * 0.018) * 0.1 + 1;
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 380 * pulse);
      g1.addColorStop(0, "rgba(100,50,255,0.18)"); g1.addColorStop(0.4, "rgba(80,30,200,0.10)"); g1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g1; ctx.beginPath(); ctx.arc(cx, cy, 380 * pulse, 0, Math.PI * 2); ctx.fill();
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180 * pulse);
      g2.addColorStop(0, "rgba(160,100,255,0.45)"); g2.addColorStop(0.3, "rgba(120,60,255,0.30)"); g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(cx, cy, 180 * pulse, 0, Math.PI * 2); ctx.fill();
      const g3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70 * pulse);
      g3.addColorStop(0, "rgba(240,210,255,1)"); g3.addColorStop(0.25, "rgba(190,130,255,0.9)"); g3.addColorStop(0.6, "rgba(120,60,255,0.5)"); g3.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g3; ctx.beginPath(); ctx.arc(cx, cy, 70 * pulse, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 4; i++) {
        const r = (110 + i * 60) * pulse;
        const alpha = (0.35 - i * 0.07) * (Math.sin(frame * 0.018 + i * 0.5) * 0.15 + 1);
        ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 1.08, Math.PI * 1.92);
        ctx.strokeStyle = `rgba(180,120,255,${alpha})`; ctx.lineWidth = 1.5 - i * 0.25; ctx.stroke();
      }
      frame++; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 1000, height: "100%",
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#0e0b1f", fontFamily: "'Inter', -apple-system, sans-serif", color: "#fff", overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fu { opacity:0; animation: fadeUp 0.75s ease forwards; }
        .nav-pill-btn { background:none; border:none; color:rgba(255,255,255,0.6); font-size:14px; font-family:inherit; padding:6px 14px; border-radius:999px; cursor:pointer; transition:color 0.2s, background 0.2s; }
        .nav-pill-btn:hover { color:#fff; background:rgba(255,255,255,0.07); }
        .btn-white { background:#fff; color:#0e0b1f; border:none; border-radius:8px; padding:13px 26px; font-size:15px; font-weight:600; cursor:pointer; font-family:inherit; transition:background 0.2s; }
        .btn-white:hover { background:#ede8ff; }
        .btn-outline { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.8); border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:13px 26px; font-size:15px; font-weight:500; cursor:pointer; font-family:inherit; transition:background 0.2s; }
        .btn-outline:hover { background:rgba(255,255,255,0.12); }
        .feat-cell { padding:24px; background:#0e0b1f; transition:background 0.2s; cursor:default; }
        .feat-cell:hover { background:#13102a; }
        .stat-cell { padding:40px 0; }
      `}</style>

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 40px",
        background: "rgba(14,11,31,0.85)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#7b3fff,#4a1fcc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🧠</div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>InterviewQ</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 2, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 999, padding: "3px 6px" }}>
          {["Product","Pricing","Company","Blog","Changelog"].map(l => (
            <button key={l} className="nav-pill-btn">{l}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="nav-pill-btn" onClick={() => setShowDemo(true)}>Login</button>
          <button style={{ background: "#6c3fff", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "background 0.2s" }}
            onMouseOver={e => e.currentTarget.style.background = "#7d52ff"}
            onMouseOut={e => e.currentTarget.style.background = "#6c3fff"}
            onClick={() => navigate("/auth")}>Start free trial</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", textAlign: "center", padding: "100px 24px 0", overflow: "hidden", minHeight: 680 }}>
        <OrbCanvas />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="fu" style={{ animationDelay: "0ms", marginBottom: 28 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", fontSize: 13, color: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)" }}>
              <Sparkles size={13} color="#c0a0ff" />
              New: Our AI integration just landed
            </span>
          </div>

          <h1 className="fu" style={{ animationDelay: "100ms", fontSize: "clamp(48px,7.5vw,88px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.04, margin: "0 auto 22px", maxWidth: 820 }}>
            Think better with<br />InterviewQ
          </h1>

          <p className="fu" style={{ animationDelay: "200ms", fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, maxWidth: 440, margin: "0 auto 40px" }}>
            Never miss a gap, weakness, or opportunity. Real-time AI feedback that actually moves the needle.
          </p>

          <div className="fu" style={{ animationDelay: "300ms", display: "flex", gap: 12, justifyContent: "center", marginBottom: 72 }}>
            <button className="btn-white" onClick={() => navigate("/auth")}>Start for free →</button>
            <button className="btn-outline" onClick={() => setShowDemo(true)}>View demo</button>
          </div>

          {/* App mockup */}
          <div className="fu" style={{ animationDelay: "450ms", maxWidth: 920, margin: "0 auto" }}>
            <div style={{ background: "rgba(16,12,36,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "none", borderRadius: "14px 14px 0 0", overflow: "hidden", boxShadow: "0 -20px 80px rgba(100,50,255,0.15)" }}>
              {/* Titlebar */}
              <div style={{ display: "flex", alignItems: "center", padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", gap: 8 }}>
                {[["#ff5f57"],["#febc2e"],["#28c840"]].map(([c], i) => <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
                <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                  <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "3px 16px", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>interviewiq.app — Practice Session</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "4px 12px", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                  🔍 Search anything… <span style={{ opacity: 0.4, fontSize: 10 }}>⌘K</span>
                </div>
              </div>
              {/* Body */}
              <div style={{ display: "flex", height: 300 }}>
                {/* Sidebar */}
                <div style={{ width: 180, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "14px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
                  {[["📋","Daily notes",true],["📄","All notes"],["✅","Tasks"],["🗺️","Map"]].map(([icon,label,active]) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 6, fontSize: 13, color: active ? "#fff" : "rgba(255,255,255,0.4)", background: active ? "rgba(120,60,255,0.2)" : "transparent" }}>
                      <span>{icon}</span>{label}
                    </div>
                  ))}
                  <div style={{ marginTop: 14, padding: "0 10px", fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Pinned notes</div>
                </div>
                {/* Main */}
                <div style={{ flex: 1, padding: "20px 28px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 18, background: "#7b3fff", borderRadius: 2 }} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>Sun, April 2nd, 2023</span>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>
                    <div>• Today I started using <span style={{ color: "#9b77ff" }}>InterviewQ</span></div>
                    <div style={{ marginLeft: 16, marginTop: 6 }}>
                      <div>• What is InterviewQ?</div>
                      <div style={{ marginLeft: 16, marginTop: 4, color: "rgba(255,255,255,0.4)" }}>• A practice tool designed to mirror real interviews</div>
                      <div style={{ marginLeft: 16, marginTop: 4, color: "rgba(255,255,255,0.4)" }}>• It adapts questions based on your responses and skill level</div>
                      <div style={{ marginLeft: 16, marginTop: 4, color: "rgba(255,255,255,0.4)" }}>• Over time, you build confidence. InterviewQ becomes an extension of your prep...</div>
                    </div>
                  </div>
                </div>
                {/* Calendar */}
                <div style={{ width: 230, padding: "20px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>April 2023</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["‹","□","›"].map(c => <span key={c} style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>{c}</span>)}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, fontSize: 11, textAlign: "center" }}>
                    {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => <div key={d} style={{ color: "rgba(255,255,255,0.3)", padding: "3px 0", fontWeight: 500 }}>{d}</div>)}
                    {[27,28,29,30,31,"",2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map((d,i) => (
                      <div key={i} style={{ padding: "4px 0", borderRadius: 4, color: d===2?"#fff":(!d||d<3)?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.5)", background: d===2?"#6c3fff":"transparent" }}>{d}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.07)", maxWidth: 860, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {stats.map(({ value, label }, i) => (
            <div key={label} className="stat-cell" style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none", paddingLeft: i > 0 ? 32 : 0 }}>
              <div style={{ fontSize: "clamp(28px,3vw,40px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", marginBottom: 6 }}>{value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "100px 32px", maxWidth: 860, margin: "0 auto" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>How it works</p>
        <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", margin: "0 0 56px", lineHeight: 1.15 }}>From upload to insight<br />in four steps.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,0.06)" }}>
          {process.map((p, i) => (
            <div key={p.num} style={{ padding: 28, background: "#0e0b1f", borderRadius: i===0?"12px 0 0 0":i===1?"0 12px 0 0":i===2?"0 0 0 12px":"0 0 12px 0" }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 600, margin: "0 0 12px", letterSpacing: "0.06em" }}>{p.num}</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.01em" }}>{p.title}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "100px 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Capabilities</p>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", margin: "0 0 56px", lineHeight: 1.15 }}>Every signal, measured.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
            {features.map(f => (
              <div key={f.label} className="feat-cell">
                <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.01em" }}>{f.label}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "100px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", margin: "0 0 14px", lineHeight: 1.15 }}>Start your first session.</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: "0 0 32px", lineHeight: 1.6 }}>Free to use. No credit card required. Get your first AI performance report in minutes.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn-white" onClick={() => navigate("/auth")}>Create free account →</button>
            <button className="btn-outline" onClick={() => setShowDemo(true)}>View demo</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>InterviewQ</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>© 2025 · Multimodal AI Research Framework</span>
      </footer>
    </div>
  );
}