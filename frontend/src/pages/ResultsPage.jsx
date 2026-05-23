import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import ResultScoreCard from "../components/ResultScoreCard.jsx";
import generatePDF from "../utils/generatePDF";

/* ─── Design tokens ────────────────────────────────────────────────────────── */
const T = {
  bg:       "#f7f8fa",
  white:    "#ffffff",
  border:   "#e9eaec",
  text:     "#1a1d23",
  muted:    "#8a8f9d",
  accent:   "#5c6bc0",       // indigo — Uxcel-like primary
  green:    "#2e7d32",
  greenBg:  "#e8f5e9",
  greenBd:  "#c8e6c9",
  blue:     "#1565c0",
  blueBg:   "#e3f2fd",
  blueBd:   "#bbdefb",
  purple:   "#6a1b9a",
  purpleBg: "#f3e5f5",
  purpleBd: "#e1bee7",
  amber:    "#e65100",
  amberBg:  "#fff3e0",
  amberBd:  "#ffe0b2",
  radius:   "10px",
  font:     "'DM Sans', 'Segoe UI', sans-serif",
};

/* ─── Tiny reusable pill ───────────────────────────────────────────────────── */
const Pill = ({ children, color = T.accent }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", padding: "2px 10px",
    borderRadius: "20px", fontSize: "11px", fontWeight: 600,
    background: color + "18", color, border: `1px solid ${color}30`,
  }}>{children}</span>
);

/* ─── Section card ─────────────────────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.white, border: `1px solid ${T.border}`,
    borderRadius: T.radius, padding: "22px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)", ...style,
  }}>{children}</div>
);

/* ─── Section header ───────────────────────────────────────────────────────── */
const SectionTitle = ({ children, accent = T.accent }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
    <div style={{ width: "3px", height: "16px", borderRadius: "2px", background: accent, flexShrink: 0 }} />
    <h3 style={{ fontSize: "14px", fontWeight: 700, color: T.text, margin: 0 }}>{children}</h3>
  </div>
);

/* ─── Bar Chart ────────────────────────────────────────────────────────────── */
function BarChart({ scores = [], color = T.green }) {
  const max = Math.max(...scores, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "110px" }}>
      {scores.map((score, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", height: "100%" }}>
          <span style={{ fontSize: "10px", color: T.muted, fontWeight: 600 }}>{score}</span>
          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
            <div style={{
              width: "100%", height: `${(score / max) * 100}%`, minHeight: score > 0 ? "4px" : "0",
              background: color, borderRadius: "4px 4px 0 0", opacity: score === 0 ? 0.15 : 1,
              transition: "height 0.8s ease",
            }} />
          </div>
          <span style={{ fontSize: "10px", color: T.muted }}>Q{i + 1}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Line Chart ───────────────────────────────────────────────────────────── */
function LineChart({ points = [], color = T.blue }) {
  const w = 300, h = 110, pad = 14;
  const max = Math.max(...points, 1);
  const xs = points.map((_, i) => pad + (i / Math.max(points.length - 1, 1)) * (w - pad * 2));
  const ys = points.map(v => h - pad - ((v / max) * (h - pad * 2)));
  const pathD = points.length < 2 ? "" : xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const areaD = points.length < 2 ? "" : `${pathD} L${xs[xs.length - 1]},${h - pad} L${xs[0]},${h - pad} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ height: "110px" }}>
      {points.length >= 2 ? (
        <>
          <path d={areaD} fill={color} fillOpacity="0.08" />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r="3.5" fill={T.white} stroke={color} strokeWidth="2" />)}
        </>
      ) : (
        <text x={w / 2} y={h / 2} textAnchor="middle" fill={T.muted} fontSize="11">No data yet</text>
      )}
      {points.map((_, i) => (
        <text key={i} x={xs[i]} y={h - 1} textAnchor="middle" fill={T.muted} fontSize="9">Q{i + 1}</text>
      ))}
    </svg>
  );
}

/* ─── Donut Chart ──────────────────────────────────────────────────────────── */
function DonutChart({ segments = [] }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const cx = 56, cy = 56, r = 42, strokeW = 14, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      <svg width="112" height="112" viewBox="0 0 112 112" style={{ flexShrink: 0 }}>
        {segments.every(s => s.value === 0) ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.border} strokeWidth={strokeW} />
        ) : segments.map((seg, i) => {
          const pct = seg.value / total;
          const rotate = (cumulative / total) * 360 - 90;
          cumulative += seg.value;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={strokeW}
              strokeDasharray={`${pct * circ} ${circ}`}
              style={{ transform: `rotate(${rotate}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: "stroke-dasharray 0.8s ease" }}
            />
          );
        })}
        <text x={cx} y={cy - 3} textAnchor="middle" fill={T.text} fontSize="15" fontWeight="800">
          {total === 1 ? "0" : Math.round(total / segments.length)}
        </text>
        <text x={cx} y={cy + 13} textAnchor="middle" fill={T.muted} fontSize="9">/100</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "7px", flex: 1 }}>
        {segments.map(seg => (
          <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: "11px", color: T.muted, flex: 1 }}>{seg.label}</span>
            <span style={{ fontSize: "11px", color: T.text, fontWeight: 700 }}>{seg.value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Score ring (hero) ────────────────────────────────────────────────────── */
function ScoreRing({ score = 0, size = 96 }) {
  const r = (size - 10) / 2, circ = 2 * Math.PI * r;
  const pct = score / 100;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth="8" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.accent} strokeWidth="8"
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 1s ease" }}
      />
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fill={T.text} fontSize="20" fontWeight="800">{score}</text>
      <text x={size / 2} y={size / 2 + 13} textAnchor="middle" fill={T.muted} fontSize="10">/100</text>
    </svg>
  );
}

/* ─── Tab bar (Uxcel-style top nav) ────────────────────────────────────────── */
const TABS = ["Overview", "Scores", "AI Feedback", "Dimensions"];

function TabBar({ active, onChange }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0",
      borderBottom: `1px solid ${T.border}`, marginBottom: "24px",
    }}>
      {TABS.map(tab => (
        <button key={tab} onClick={() => onChange(tab)}
          style={{
            padding: "12px 20px", fontSize: "13px", fontWeight: 600,
            background: "none", border: "none", cursor: "pointer",
            color: active === tab ? T.accent : T.muted,
            borderBottom: active === tab ? `2px solid ${T.accent}` : "2px solid transparent",
            marginBottom: "-1px", fontFamily: T.font, transition: "color 0.15s",
          }}
        >{tab}</button>
      ))}
    </div>
  );
}

/* ─── Mini stat tile ───────────────────────────────────────────────────────── */
function StatTile({ label, value, unit, icon, color, bg, border }) {
  return (
    <div style={{
      background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radius,
      padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px",
    }}>
      <div style={{
        width: "44px", height: "44px", borderRadius: "10px",
        background: bg, border: `1px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0,
      }}>{icon}</div>
      <div>
        <p style={{ fontSize: "11px", color: T.muted, margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ fontSize: "22px", fontWeight: 800, color, margin: 0, lineHeight: 1 }}>
          {value}<span style={{ fontSize: "12px", color: T.muted, fontWeight: 600, marginLeft: "2px" }}>{unit}</span>
        </p>
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */
export default function ResultsPage() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("iq_token");
  const userName = localStorage.getItem("iq_user_name") || "Candidate";

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState("Overview");

  useEffect(() => {
    const fetchLatestResult = async () => {
      try {
        const res  = await fetch("http://localhost:5000/api/interviews", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success || !data.interviews?.length) { setError("No completed sessions yet."); setLoading(false); return; }
        const latest = data.interviews.find(i => i.status === "completed");
        if (!latest) { setError("No completed sessions yet."); setLoading(false); return; }
        const dr   = await fetch(`http://localhost:5000/api/interviews/${latest._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dd   = await dr.json();
        if (dd.success) setResult(dd.interview);
        else setError("Failed to load results.");
      } catch { setError("Could not connect to server."); }
      finally   { setLoading(false); }
    };
    fetchLatestResult();
  }, []);

  const dimensionBars = [
    { label: "Subject Matter Authority", score: result?.dimensions?.subjectMatterAuthority || 0, color: T.green },
    { label: "Persuasive Delivery",      score: result?.dimensions?.persuasiveAuthority    || 0, color: "#1565c0" },
    { label: "Answer Architecture",      score: result?.dimensions?.answerArchitecture     || 0, color: "#6a1b9a" },
    { label: "Emotional Intelligence",   score: result?.dimensions?.emotionalIntelligence  || 0, color: "#e65100" },
    { label: "Response Timing",          score: result?.dimensions?.responseTiming         || 0, color: T.green },
    { label: "Eye Contact Consistency",  score: result?.dimensions?.presenceEngagement     || 0, color: "#1565c0" },
  ];

  const feedbackItems = [
    { category: "Content Quality",  icon: "🧠", color: T.green,  bg: T.greenBg,  border: T.greenBd,  point: result?.aiFeedback?.contentQuality  || "Complete an interview to receive content feedback." },
    { category: "Vocal Delivery",   icon: "🎙️", color: T.blue,   bg: T.blueBg,   border: T.blueBd,   point: result?.aiFeedback?.vocalDelivery   || "Speech analysis will appear after your first recorded session." },
    { category: "Body Language",    icon: "🪞",  color: T.purple, bg: T.purpleBg, border: T.purpleBd, point: result?.aiFeedback?.bodyLanguage    || "Facial expression and posture insights appear after a completed session." },
    { category: "Answer Structure", icon: "📋",  color: T.amber,  bg: T.amberBg,  border: T.amberBd,  point: result?.aiFeedback?.answerStructure || "STAR-method compliance and logical flow scoring will be shown here." },
  ];

  const questionScores     = result?.questionScores?.length     ? result.questionScores     : [0, 0, 0, 0, 0];
  const confidenceOverTime = result?.confidenceOverTime?.length ? result.confidenceOverTime : [0, 0, 0, 0, 0];

  const donutSegments = [
    { label: "Content",   value: result?.dimensions?.subjectMatterAuthority || 0, color: T.green },
    { label: "Delivery",  value: result?.dimensions?.persuasiveAuthority    || 0, color: "#1565c0" },
    { label: "Attention", value: result?.dimensions?.presenceEngagement     || 0, color: "#6a1b9a" },
    { label: "Composure", value: result?.dimensions?.emotionalIntelligence  || 0, color: "#e65100" },
  ];

  const handleDownloadPDF = () => generatePDF({
    userName, role: result?.role || "General Interview",
    questionsAnswered: result?.questionsAnswered || 0, questionsTotal: result?.questionsTotal || 5,
    overallScore: result?.overallScore || 0, confidenceScore: result?.confidenceScore || 0,
    communicationScore: result?.communicationScore || 0, attentionScore: result?.attentionScore || 0,
    dimensionBars, feedbackItems, feedbackSummary: result?.aiFeedback?.summary || "",
  });

  /* ── Loading ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", background: T.bg, fontFamily: T.font }}>
      <Sidebar activePage="Results" />
      <main style={{ marginLeft: "240px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: `3px solid ${T.border}`, borderTop: `3px solid ${T.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: "14px", color: T.muted, fontWeight: 600 }}>Loading results…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </main>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .iq-fade { animation: fadeUp 0.35s ease both; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", background: T.bg, fontFamily: T.font, color: T.text }}>
        <Sidebar activePage="Results" />

        <main style={{ marginLeft: "240px", flex: 1, overflowY: "auto" }}>

          {/* ── Top bar ── */}
          <div style={{
            background: T.white, borderBottom: `1px solid ${T.border}`,
            padding: "0 32px", display: "flex", alignItems: "center",
            justifyContent: "space-between", height: "58px", position: "sticky", top: 0, zIndex: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => navigate("/dashboard")}
                style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: "18px", lineHeight: 1, padding: "4px" }}>
                ←
              </button>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>Session Results</span>
                {result && <span style={{ fontSize: "12px", color: T.muted, marginLeft: "8px" }}>
                  {result.role} · {result.questionsAnswered}/{result.questionsTotal} questions
                </span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Pill color={result ? T.green : T.amber}>{result ? "✓ Complete" : "Awaiting session"}</Pill>
              <button onClick={() => navigate("/pre-interview")}
                style={{ padding: "7px 16px", borderRadius: "8px", background: "none", border: `1.5px solid ${T.border}`, color: T.text, fontWeight: 600, fontSize: "12px", cursor: "pointer", fontFamily: T.font }}>
                ↺ Retake
              </button>
              <button onClick={handleDownloadPDF}
                style={{ padding: "7px 16px", borderRadius: "8px", background: T.accent, border: "none", color: "#fff", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: T.font }}>
                ↓ Download PDF
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "28px 32px" }} className="iq-fade">

            {/* ── Hero row ── */}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "20px", marginBottom: "24px" }}>
              {/* Score ring card */}
              <Card style={{ display: "flex", alignItems: "center", gap: "20px", padding: "20px 28px" }}>
                <ScoreRing score={result?.overallScore ?? 0} size={96} />
                <div>
                  <p style={{ fontSize: "11px", color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Overall Score</p>
                  <h2 style={{ fontSize: "18px", fontWeight: 800, color: T.text, margin: "0 0 6px" }}>
                    {result
                      ? result.overallScore >= 70 ? "Great performance! 🎉"
                        : result.overallScore >= 50 ? "Good effort — keep improving 💪"
                        : "Room to grow — practice makes perfect 📈"
                      : "No session completed yet"}
                  </h2>
                  <p style={{ fontSize: "13px", color: T.muted, margin: "0 0 10px", lineHeight: 1.5, maxWidth: "360px" }}>
                    {result?.aiFeedback?.summary || error || "Complete an interview to see your AI performance report here."}
                  </p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {["Content Analysis", "Speech AI", "Facial AI", "NLP Scoring"].map(tag => (
                      <Pill key={tag} color={T.accent}>{tag}</Pill>
                    ))}
                  </div>
                </div>
              </Card>

              {/* 4 mini stat tiles */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <StatTile label="Overall"       value={result?.overallScore       ?? 0} unit="/100" icon="🏆" color={T.green}  bg={T.greenBg}  border={T.greenBd} />
                <StatTile label="Confidence"    value={result?.confidenceScore    ?? 0} unit="/100" icon="💪" color={T.blue}   bg={T.blueBg}   border={T.blueBd} />
                <StatTile label="Communication" value={result?.communicationScore ?? 0} unit="/100" icon="🗣️" color={T.purple} bg={T.purpleBg} border={T.purpleBd} />
                <StatTile label="Attention"     value={result?.attentionScore     ?? 0} unit="/100" icon="👁️" color={T.amber}  bg={T.amberBg}  border={T.amberBd} />
              </div>
            </div>

            {/* ── Tab navigation ── */}
            <TabBar active={tab} onChange={setTab} />

            {/* ════ TAB: Overview ════ */}
            {tab === "Overview" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <Card>
                  <SectionTitle accent={T.green}>Score per Question</SectionTitle>
                  <BarChart scores={questionScores} color={T.green} />
                </Card>
                <Card>
                  <SectionTitle accent="#1565c0">Confidence Over Time</SectionTitle>
                  <LineChart points={confidenceOverTime} color="#1565c0" />
                </Card>
                <Card>
                  <SectionTitle accent="#6a1b9a">Dimension Breakdown</SectionTitle>
                  <DonutChart segments={donutSegments} />
                </Card>
              </div>
            )}

            {/* ════ TAB: Scores ════ */}
            {tab === "Scores" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Card>
                  <SectionTitle accent={T.green}>Dimension Scores</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {dimensionBars.map(d => (
                      <div key={d.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                          <span style={{ color: T.text, fontWeight: 500 }}>{d.label}</span>
                          <span style={{ color: d.color, fontWeight: 700 }}>{result ? `${d.score}%` : "—"}</span>
                        </div>
                        <div style={{ height: "6px", background: T.bg, borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${d.score || 0}%`,
                            background: d.color, borderRadius: "3px",
                            transition: "width 1s ease",
                            opacity: d.score > 0 ? 1 : 0,
                          }} />
                        </div>
                      </div>
                    ))}
                    {!result && <p style={{ fontSize: "12px", color: T.muted, textAlign: "center", marginTop: "8px" }}>Scores populate after your first completed session</p>}
                  </div>
                </Card>
                <Card>
                  <SectionTitle accent="#e65100">Answer Length vs Score</SectionTitle>
                  <LineChart points={questionScores} color="#e65100" />
                  <p style={{ fontSize: "11px", color: T.muted, textAlign: "center", marginTop: "10px" }}>Correlation between answer length and score per question</p>
                </Card>
              </div>
            )}

            {/* ════ TAB: AI Feedback ════ */}
            {tab === "AI Feedback" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  {feedbackItems.map(fb => (
                    <Card key={fb.category} style={{ borderLeft: `3px solid ${fb.color}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "18px" }}>{fb.icon}</span>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: fb.color }}>{fb.category}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: T.muted, margin: 0, lineHeight: 1.65 }}>{fb.point}</p>
                    </Card>
                  ))}
                </div>
                {result?.aiFeedback?.summary ? (
                  <Card style={{ borderLeft: `3px solid ${T.accent}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <span style={{ fontSize: "18px" }}>📝</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: T.accent }}>AI Summary</span>
                      <Pill color={T.muted}>Powered by Gemini AI</Pill>
                    </div>
                    <p style={{ fontSize: "13px", color: T.muted, margin: 0, lineHeight: 1.7 }}>{result.aiFeedback.summary}</p>
                  </Card>
                ) : (
                  <Card style={{ textAlign: "center", border: `1px dashed ${T.border}` }}>
                    <p style={{ fontSize: "13px", color: T.muted, margin: 0 }}>
                      Detailed narrative feedback will appear here after session completion.
                    </p>
                  </Card>
                )}
              </div>
            )}

            {/* ════ TAB: Dimensions ════ */}
            {tab === "Dimensions" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <Card>
                  <SectionTitle accent="#6a1b9a">Dimension Breakdown</SectionTitle>
                  <DonutChart segments={donutSegments} />
                </Card>
                <Card>
                  <SectionTitle accent={T.green}>Score per Question</SectionTitle>
                  <BarChart scores={questionScores} color={T.green} />
                </Card>
                <Card style={{ gridColumn: "1 / -1" }}>
                  <SectionTitle accent="#1565c0">All Dimensions</SectionTitle>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    {dimensionBars.map(d => (
                      <div key={d.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                          <span style={{ color: T.text, fontWeight: 500 }}>{d.label}</span>
                          <span style={{ color: d.color, fontWeight: 700 }}>{result ? `${d.score}%` : "—"}</span>
                        </div>
                        <div style={{ height: "7px", background: T.bg, borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${d.score || 0}%`, background: d.color, borderRadius: "4px", transition: "width 1s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── Bottom action strip ── */}
            <div style={{
              marginTop: "24px", background: T.white, border: `1px solid ${T.border}`,
              borderRadius: T.radius, padding: "16px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: T.text, margin: "0 0 2px" }}>Ready to improve your score?</p>
                <p style={{ fontSize: "12px", color: T.muted, margin: 0 }}>Practice consistently — track every dimension over time.</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => navigate("/pre-interview")}
                  style={{ padding: "8px 18px", borderRadius: "8px", background: T.accent, border: "none", color: "#fff", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: T.font }}>
                  🔁 New Session
                </button>
                <button onClick={() => navigate("/dashboard")}
                  style={{ padding: "8px 18px", borderRadius: "8px", background: "none", border: `1.5px solid ${T.border}`, color: T.text, fontWeight: 600, fontSize: "12px", cursor: "pointer", fontFamily: T.font }}>
                  ← Dashboard
                </button>
                <button onClick={handleDownloadPDF}
                  style={{ padding: "8px 18px", borderRadius: "8px", background: "none", border: `1.5px solid ${T.border}`, color: T.text, fontWeight: 600, fontSize: "12px", cursor: "pointer", fontFamily: T.font }}>
                  ↓ PDF
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}