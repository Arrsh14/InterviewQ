import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import ScoreCard from "../components/Scorecard.jsx";
import AttemptRow from "../components/AttemptRow";
import VideoRecorder from "../components/VideoRecorder";

/* ─── Design tokens (same as ResultsPage) ─────────────────────────────────── */
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
  radius:  "10px",
  font:    "'DM Sans', 'Segoe UI', sans-serif",
};

const summaryCards = [
  { label: "Overall Score",         value: "0", unit: "/100", delta: "No sessions yet", color: "green"  },
  { label: "Articulate Delivery",   value: "0", unit: "%",    delta: "No sessions yet", color: "blue"   },
  { label: "Presence & Engagement", value: "0", unit: "%",    delta: "No sessions yet", color: "purple" },
  { label: "Discourse Precision",   value: "0", unit: "/min", delta: "No sessions yet", color: "orange" },
];

const attempts = [];

const skillRadar = [
  { skill: "Subject Matter Authority", score: 0 },
  { skill: "Persuasive Authority",     score: 0 },
  { skill: "Answer Architecture",      score: 0 },
  { skill: "Presence & Engagement",    score: 0 },
  { skill: "Response Timing",          score: 0 },
  { skill: "Emotional Intelligence",   score: 0 },
];

const SKILL_COLORS = ["#2e7d32", "#1565c0", "#6a1b9a", "#e65100", "#2e7d32", "#1565c0"];

/* ─── Reusable card shell ──────────────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.white, border: `1px solid ${T.border}`,
    borderRadius: T.radius, padding: "22px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)", ...style,
  }}>{children}</div>
);

/* ─── Section title with left accent bar ──────────────────────────────────── */
const SectionTitle = ({ children, accent = T.accent, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ width: "3px", height: "16px", borderRadius: "2px", background: accent, flexShrink: 0 }} />
      <h3 style={{ fontSize: "14px", fontWeight: 700, color: T.text, margin: 0 }}>{children}</h3>
    </div>
    {action}
  </div>
);

/* ─── Stat chip ────────────────────────────────────────────────────────────── */
const StatChip = ({ label, value, color, bg, border, icon }) => (
  <div style={{
    background: T.white, border: `1px solid ${T.border}`,
    borderRadius: T.radius, padding: "16px 18px",
    display: "flex", alignItems: "center", gap: "12px",
  }}>
    <div style={{
      width: "40px", height: "40px", borderRadius: "9px",
      background: bg, border: `1px solid ${border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "18px", flexShrink: 0,
    }}>{icon}</div>
    <div>
      <p style={{ fontSize: "11px", color: T.muted, margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ fontSize: "20px", fontWeight: 800, color, margin: 0, lineHeight: 1 }}>{value}</p>
    </div>
  </div>
);

/* ─── Ghost bar (empty state placeholder) ─────────────────────────────────── */
const GhostBars = () => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "100px", opacity: 0.1 }}>
    {[40, 60, 35, 75, 55].map((h, i) => (
      <div key={i} style={{ flex: 1, borderRadius: "4px 4px 0 0", background: T.accent, height: `${h}%` }} />
    ))}
  </div>
);

/* ─── Main ─────────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate   = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const stored = localStorage.getItem("iq_user_name");
    if (stored) setUserName(stored);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .iq-fade { animation: fadeUp 0.35s ease both; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", background: T.bg, fontFamily: T.font, color: T.text }}>
        <Sidebar />

        <main style={{ marginLeft: "240px", flex: 1, overflowY: "auto" }}>

          {/* ── Top bar ── */}
          <div style={{
            background: T.white, borderBottom: `1px solid ${T.border}`,
            padding: "0 32px", display: "flex", alignItems: "center",
            justifyContent: "space-between", height: "58px",
            position: "sticky", top: 0, zIndex: 10,
          }}>
            <div>
              <span style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>Dashboard</span>
              <span style={{ fontSize: "12px", color: T.muted, marginLeft: "8px" }}>Precision Interview Analytics</span>
            </div>
            <button
              onClick={() => navigate("/pre-interview")}
              style={{
                padding: "7px 18px", borderRadius: "8px",
                background: T.accent, border: "none", color: "#fff",
                fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: T.font,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#4a5ab0"}
              onMouseLeave={e => e.currentTarget.style.background = T.accent}
            >
              + Start New Interview
            </button>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: "28px 32px" }} className="iq-fade">

            {/* ── Welcome row ── */}
            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontSize: "11px", color: T.muted, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: "4px" }}>
                Welcome back
              </p>
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: T.text, margin: "0 0 4px" }}>
                {userName} 👋
              </h1>
              <p style={{ fontSize: "13px", color: T.muted, margin: 0 }}>
                Unlock your peak potential — precision tracking for every performance dimension.
              </p>
            </div>

            {/* ── 4 stat chips ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "22px" }}>
              <StatChip label="Overall Score"         value="0/100" color={T.green}  bg={T.greenBg}  border={T.greenBd}  icon="🏆" />
              <StatChip label="Articulate Delivery"   value="0%"    color={T.blue}   bg={T.blueBg}   border={T.blueBd}   icon="🎙️" />
              <StatChip label="Presence & Engagement" value="0%"    color={T.purple} bg={T.purpleBg} border={T.purpleBd} icon="👁️" />
              <StatChip label="Discourse Precision"   value="0/min" color={T.amber}  bg={T.amberBg}  border={T.amberBd}  icon="⚡" />
            </div>

            {/* ── Middle row: dimensions + trend ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px", marginBottom: "22px" }}>

              {/* Performance Dimensions */}
              <Card>
                <SectionTitle accent={T.green}>Performance Dimensions</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {skillRadar.map((s, i) => (
                    <div key={s.skill}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                        <span style={{ color: T.text, fontWeight: 500 }}>{s.skill}</span>
                        <span style={{ color: SKILL_COLORS[i], fontWeight: 700 }}>{s.score === 0 ? "—" : `${s.score}%`}</span>
                      </div>
                      <div style={{ height: "5px", borderRadius: "3px", background: T.bg, overflow: "hidden" }}>
                        {s.score === 0
                          ? <div style={{ height: "100%", width: "100%", background: `repeating-linear-gradient(90deg,${T.border} 0,${T.border} 6px,transparent 6px,transparent 12px)` }} />
                          : <div style={{ height: "100%", borderRadius: "3px", background: SKILL_COLORS[i], width: `${s.score}%`, transition: "width 0.7s" }} />
                        }
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: "14px", fontSize: "11px", color: T.muted, textAlign: "center" }}>
                  Scores populate after your first session
                </p>
              </Card>

              {/* Score Trend */}
              <Card>
                <SectionTitle
                  accent={T.blue}
                  action={<span style={{ fontSize: "12px", color: T.muted }}>Last 5 sessions</span>}
                >
                  Performance Trend
                </SectionTitle>

                {attempts.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "140px", gap: "12px" }}>
                    <GhostBars />
                    <p style={{ fontSize: "12px", color: T.muted }}>Complete an interview to see your trend</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "140px" }}>
                    {attempts.slice().reverse().map((a) => (
                      <div key={a.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11px", color: T.muted }}>{a.score}</span>
                        <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: T.accent, height: `${a.score}%` }} />
                        <span style={{ fontSize: "10px", color: T.muted }}>{a.date.split(",")[0]}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* ── Live Monitor ── */}
            <Card style={{ marginBottom: "22px" }}>
              <SectionTitle accent={T.purple}>Live Interview Monitoring</SectionTitle>
              <p style={{ fontSize: "12px", color: T.muted, marginTop: "-12px", marginBottom: "16px" }}>
                AI-powered facial engagement and communication tracking.
              </p>
              <VideoRecorder isRecording={false} />
            </Card>

            {/* ── Previous Attempts ── */}
            <Card>
              <SectionTitle
                accent={T.amber}
                action={<span style={{ fontSize: "12px", color: T.muted }}>{attempts.length} sessions archived</span>}
              >
                Previous Interview Attempts
              </SectionTitle>

              {attempts.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: "10px" }}>
                  <div style={{
                    width: "52px", height: "52px", borderRadius: "10px",
                    background: T.bg, border: `1px solid ${T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
                  }}>
                    <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Body */}
                      <rect x="1.5" y="5.5" width="25" height="15" rx="2.5" fill="#6b6f78" stroke="#1a1d23" strokeWidth="1.6"/>
                      {/* Top white strip */}
                      <rect x="1.5" y="5.5" width="25" height="4" rx="2.5" fill="#e9eaec" stroke="#1a1d23" strokeWidth="1.6"/>
                      {/* Viewfinder bump */}
                      <rect x="10" y="2" width="5" height="4" rx="1.2" fill="#555" stroke="#1a1d23" strokeWidth="1.4"/>
                      {/* Flash bump */}
                      <rect x="4" y="3" width="4" height="3" rx="1" fill="#6b6f78" stroke="#1a1d23" strokeWidth="1.2"/>
                      {/* Lens outer ring */}
                      <circle cx="14" cy="13.5" r="5.5" fill="#888" stroke="#1a1d23" strokeWidth="1.6"/>
                      {/* Lens inner */}
                      <circle cx="14" cy="13.5" r="4" fill="#bcd9f5"/>
                      {/* Lens shine */}
                      <path d="M11.8 11.5 Q12.5 10.8 13.5 11" stroke="white" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
                      {/* Right indicator dot */}
                      <rect x="22.5" y="7" width="2" height="1.2" rx="0.6" fill="#888"/>
                      {/* Bottom feet */}
                      <rect x="3" y="19.5" width="2" height="1.5" rx="0.5" fill="#555"/>
                      <rect x="23" y="19.5" width="2" height="1.5" rx="0.5" fill="#555"/>
                    </svg>
                  </div>
                  <p style={{ fontWeight: 700, color: T.text, fontSize: "14px", margin: "4px 0 0" }}>No interviews yet</p>
                  <p style={{ fontSize: "12px", color: T.muted, textAlign: "center", maxWidth: "260px", margin: "2px 0 0" }}>
                    Start your first AI-evaluated session and your results will appear here.
                  </p>
                  <button
                    onClick={() => navigate("/pre-interview")}
                    style={{
                      marginTop: "10px", padding: "8px 22px", borderRadius: "8px",
                      background: "none", color: T.accent, fontWeight: 700, fontSize: "13px",
                      border: `1.5px solid ${T.accent}`, cursor: "pointer", fontFamily: T.font,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = T.accent; }}
                  >
                    + Start Interview
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {attempts.map((a) => <AttemptRow key={a.id} attempt={a} />)}
                </div>
              )}
            </Card>

          </div>
        </main>
      </div>
    </>
  );
}