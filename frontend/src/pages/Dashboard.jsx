import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import ScoreCard from "../components/Scorecard.jsx";
import AttemptRow from "../components/AttemptRow";
import VideoRecorder from "../components/VideoRecorder";

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const stored = localStorage.getItem("iq_user_name");
    if (stored) setUserName(stored);
  }, []);

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "linear-gradient(135deg, #dce8f5 0%, #eaf1fb 50%, #dce8f5 100%)",
        fontFamily: "'Open Sans', 'Segoe UI', sans-serif",
        color: "#2d2d2d",
      }}
    >
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" style={{ marginLeft: "240px", padding: "32px 36px" }}>

        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
          }}
        >
          <div>
            <p style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "6px", fontWeight: 600 }}>
              Precision Interview Analytics
            </p>
            <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
              Welcome back, <span style={{ color: "#2f8d46" }}>{userName}</span> 👋
            </h1>
            <p style={{ fontSize: "13px", color: "#666", marginTop: "6px" }}>
              Unlock your peak potential — precision tracking for every performance dimension.
            </p>
          </div>

          <button
            onClick={() => navigate("/pre-interview")}
            style={{
              padding: "10px 22px",
              borderRadius: "6px",
              background: "#2f8d46",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#257a3c")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#2f8d46")}
          >
            ＋ Start New Interview
          </button>
        </div>

        {/* ── Summary Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          {summaryCards.map((c) => (
            <ScoreCard key={c.label} {...c} />
          ))}
        </div>

        {/* ── Analytics Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "18px", marginBottom: "28px" }}>

          {/* Performance Dimensions */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
              padding: "22px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "4px", height: "18px", borderRadius: "2px", background: "#2f8d46", display: "inline-block" }} />
              Performance Dimensions
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {skillRadar.map((s) => (
                <div key={s.skill}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                    <span style={{ color: "#444" }}>{s.skill}</span>
                    <span style={{ color: "#2f8d46", fontWeight: 600 }}>{s.score === 0 ? "—" : s.score}</span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "3px", background: "#f0f0f0", overflow: "hidden" }}>
                    {s.score === 0 ? (
                      <div style={{ height: "100%", width: "100%", background: "repeating-linear-gradient(90deg,#ddd 0,#ddd 6px,transparent 6px,transparent 12px)" }} />
                    ) : (
                      <div style={{ height: "100%", borderRadius: "3px", background: "linear-gradient(90deg,#2f8d46,#52c278)", width: `${s.score}%`, transition: "width 0.7s" }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: "16px", fontSize: "11px", color: "#aaa", textAlign: "center" }}>
              Scores populate after your first session
            </p>
          </div>

          {/* Score Trend */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderRadius: "8px",
              padding: "22px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "4px", height: "18px", borderRadius: "2px", background: "#4a90d9", display: "inline-block" }} />
                Performance Trend — Last 5 Sessions
              </h3>
              <span style={{ fontSize: "12px", color: "#aaa" }}>No data yet</span>
            </div>

            {attempts.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "160px", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", height: "80px", opacity: 0.12 }}>
                  {[40, 55, 35, 65, 50].map((h, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: "4px 4px 0 0", background: "#4a90d9", height: `${h}%` }} />
                  ))}
                </div>
                <p style={{ fontSize: "12px", color: "#aaa" }}>Complete an interview to see your trend</p>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "160px" }}>
                {attempts.slice().reverse().map((a) => (
                  <div key={a.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#888" }}>{a.score}</span>
                    <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: "linear-gradient(180deg,#4a90d9,#2f8d46)", height: `${a.score}%` }} />
                    <span style={{ fontSize: "10px", color: "#aaa" }}>{a.date.split(",")[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Video Recorder ── */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: "8px",
            padding: "22px 20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            marginBottom: "28px",
          }}
        >
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a", marginBottom: "4px" }}>
            Live Interview Monitoring
          </h3>
          <p style={{ fontSize: "12px", color: "#888", marginBottom: "16px" }}>
            AI-powered facial engagement and communication tracking.
          </p>
          <VideoRecorder isRecording={false} />
        </div>

        {/* ── Previous Attempts ── */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: "8px",
            padding: "22px 20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "4px", height: "18px", borderRadius: "2px", background: "#f4a426", display: "inline-block" }} />
              Previous Interview Attempts
            </h3>
            <span style={{ fontSize: "12px", color: "#aaa" }}>{attempts.length} sessions archived</span>
          </div>

          {attempts.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: "10px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "8px", background: "#f5f5f5", border: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                🎙️
              </div>
              <p style={{ fontWeight: 700, color: "#444", fontSize: "14px" }}>No interviews yet</p>
              <p style={{ fontSize: "12px", color: "#aaa", textAlign: "center", maxWidth: "260px" }}>
                Start your first AI-evaluated session and your results will appear here.
              </p>
              <button
                onClick={() => navigate("/pre-interview")}
                style={{
                  marginTop: "8px",
                  padding: "9px 22px",
                  borderRadius: "6px",
                  background: "transparent",
                  color: "#2f8d46",
                  fontWeight: 700,
                  fontSize: "13px",
                  border: "2px solid #2f8d46",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "#2f8d46"; e.currentTarget.style.color = "#fff"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2f8d46"; }}
              >
                ＋ Start Interview
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {attempts.map((a) => (
                <AttemptRow key={a.id} attempt={a} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}