import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import ResultScoreCard from "../components/Resultscorecard.jsx";
import PlaceholderChart from "../components/PlaceholderChart.jsx";

const card = {
  background: "#fff",
  border: "1px solid #e8e8e8",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  fontFamily: "'Open Sans','Segoe UI',sans-serif",
};

export default function ResultsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("iq_token");

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Fetch the most recent completed interview ──────────────────────────────
  useEffect(() => {
    const fetchLatestResult = async () => {
      try {
        // Step 1: Get all interviews
        const res = await fetch("http://localhost:5000/api/interviews", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const data = await res.json();

        if (!data.success || data.interviews.length === 0) {
          setError("No completed sessions yet.");
          setLoading(false);
          return;
        }

        // Step 2: Get the most recent completed one
        const latest = data.interviews.find((i) => i.status === "completed");
        if (!latest) {
          setError("No completed sessions yet.");
          setLoading(false);
          return;
        }

        // Step 3: Fetch full details of that interview
        const detailRes = await fetch(`http://localhost:5000/api/interviews/${latest._id}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const detailData = await detailRes.json();

        if (detailData.success) {
          setResult(detailData.interview);
        } else {
          setError("Failed to load results.");
        }
      } catch (err) {
        setError("Could not connect to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResult();
  }, []);

  // ── Score cards built from real data ──────────────────────────────────────
  const scoreCards = result ? [
    {
      label: "Overall Score",
      value: String(result.overallScore),
      unit: "/100",
      icon: "🏆",
      color: "green",
      description: "Composite score across all evaluation dimensions.",
    },
    {
      label: "Confidence Score",
      value: String(result.confidenceScore),
      unit: "/100",
      icon: "💪",
      color: "blue",
      description: "Vocal steadiness, pace control, and assertive delivery.",
    },
    {
      label: "Communication Score",
      value: String(result.communicationScore),
      unit: "/100",
      icon: "🗣️",
      color: "purple",
      description: "Clarity, structure, vocabulary, and answer relevance.",
    },
    {
      label: "Attention Score",
      value: String(result.attentionScore),
      unit: "/100",
      icon: "👁️",
      color: "orange",
      description: "Eye contact, facial engagement, and focus consistency.",
    },
  ] : [];

  // ── Dimension bars from real data ─────────────────────────────────────────
  const dimensionBars = result ? [
    { label: "Subject Matter Authority", score: result.dimensions?.subjectMatterAuthority || 0, color: "#2f8d46" },
    { label: "Persuasive Delivery",       score: result.dimensions?.persuasiveAuthority    || 0, color: "#4a90d9" },
    { label: "Answer Architecture",       score: result.dimensions?.answerArchitecture     || 0, color: "#7b5ea7" },
    { label: "Emotional Intelligence",    score: result.dimensions?.emotionalIntelligence  || 0, color: "#f4a426" },
    { label: "Response Timing",           score: result.dimensions?.responseTiming         || 0, color: "#2f8d46" },
    { label: "Presence & Engagement",     score: result.dimensions?.presenceEngagement     || 0, color: "#4a90d9" },
  ] : [];

  // ── AI Feedback from real data ────────────────────────────────────────────
  const feedbackItems = result?.aiFeedback ? [
    {
      category: "Content Quality",
      icon: "🧠",
      color: "#2f8d46",
      bg: "#eaf7ee",
      border: "#b7e4c7",
      point: result.aiFeedback.contentQuality,
    },
    {
      category: "Vocal Delivery",
      icon: "🎙️",
      color: "#4a90d9",
      bg: "#eaf2fb",
      border: "#b3d4f5",
      point: result.aiFeedback.vocalDelivery,
    },
    {
      category: "Body Language",
      icon: "🪞",
      color: "#7b5ea7",
      bg: "#f3eeff",
      border: "#d8c5f7",
      point: result.aiFeedback.bodyLanguage,
    },
    {
      category: "Answer Structure",
      icon: "📋",
      color: "#f4a426",
      bg: "#fff8ee",
      border: "#fde3b0",
      point: result.aiFeedback.answerStructure,
    },
  ] : [];

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg,#dce8f5 0%,#eaf1fb 50%,#dce8f5 100%)", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}>
        <Sidebar activePage="Results" />
        <main style={{ marginLeft: "240px", padding: "32px 36px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#444" }}>Loading your results...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg,#dce8f5 0%,#eaf1fb 50%,#dce8f5 100%)",
        fontFamily: "'Open Sans','Segoe UI',sans-serif",
        color: "#2d2d2d",
      }}
    >
      <Sidebar activePage="Results" />

      <main style={{ marginLeft: "240px", padding: "32px 36px", flex: 1, overflowY: "auto" }}>

        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <p style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "5px", fontWeight: 600 }}>
              Session Analysis
            </p>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
              Interview <span style={{ color: "#2f8d46" }}>Results</span>
            </h1>
            <p style={{ fontSize: "13px", color: "#666", marginTop: "6px" }}>
              {result
                ? `Role: ${result.role} · ${result.questionsAnswered} of ${result.questionsTotal} questions answered`
                : "Complete a session to unlock your personalised AI performance report."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => navigate("/interview")}
              style={{ padding: "10px 20px", borderRadius: "6px", background: "transparent", border: "2px solid #2f8d46", color: "#2f8d46", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif", transition: "all 0.2s" }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#2f8d46"; e.currentTarget.style.color = "#fff"; }}
              onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2f8d46"; }}
            >
              ↺ Retake Interview
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ padding: "10px 20px", borderRadius: "6px", background: "#2f8d46", border: "none", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif", transition: "background 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#257a3c")}
              onMouseOut={(e)  => (e.currentTarget.style.background = "#2f8d46")}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* ── Overall score hero banner ── */}
        <div style={{ ...card, padding: "24px 28px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "32px", borderLeft: "5px solid #2f8d46" }}>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "#eaf7ee", border: "3px solid #b7e4c7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "32px", fontWeight: 900, color: "#2f8d46", lineHeight: 1 }}>
                {result ? result.overallScore : 0}
              </span>
              <span style={{ fontSize: "11px", color: "#aaa", fontWeight: 600 }}>/100</span>
            </div>
            <p style={{ fontSize: "11px", color: "#aaa", margin: "8px 0 0", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Overall</p>
          </div>

          <div style={{ flex: 1 }}>
            {result ? (
              <>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a1a", margin: "0 0 8px" }}>
                  {result.overallScore >= 70 ? "Great performance! 🎉" : result.overallScore >= 50 ? "Good effort — keep improving! 💪" : "Room to grow — practice makes perfect! 📈"}
                </h2>
                <p style={{ fontSize: "13px", color: "#666", margin: "0 0 14px", lineHeight: 1.6 }}>
                  {result.aiFeedback?.summary || "AI evaluation complete."}
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a1a", margin: "0 0 8px" }}>No session completed yet</h2>
                <p style={{ fontSize: "13px", color: "#666", margin: "0 0 14px", lineHeight: 1.6 }}>
                  {error || "Complete an interview to see your results here."}
                </p>
              </>
            )}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["Content Analysis", "Speech AI", "Facial AI", "NLP Scoring"].map((tag) => (
                <span key={tag} style={{ padding: "4px 10px", background: result ? "#eaf7ee" : "#f5f5f5", border: `1px solid ${result ? "#b7e4c7" : "#e8e8e8"}`, borderRadius: "4px", fontSize: "11px", color: result ? "#2f8d46" : "#888", fontWeight: 600 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div style={{ padding: "14px 20px", background: result ? "#eaf7ee" : "#fff8ee", border: `1px solid ${result ? "#b7e4c7" : "#fde3b0"}`, borderRadius: "8px", textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>{result ? "✅" : "📊"}</div>
            <p style={{ fontSize: "12px", color: result ? "#2f8d46" : "#f4a426", fontWeight: 700, margin: 0 }}>{result ? "Complete" : "Awaiting"}</p>
            <p style={{ fontSize: "11px", color: "#aaa", margin: "2px 0 0" }}>Session Data</p>
          </div>
        </div>

        {/* ── 4 Score cards ── */}
        {result && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "18px", marginBottom: "24px" }}>
            {scoreCards.map((c) => (
              <ResultScoreCard key={c.label} {...c} />
            ))}
          </div>
        )}

        {/* ── Charts row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px", marginBottom: "24px" }}>
          <PlaceholderChart title="Score per Question" type="bar" color="green" height={160} note="Bar chart — score breakdown per question" />
          <PlaceholderChart title="Confidence Over Time" type="line" color="blue" height={160} note="Line chart — confidence trend during session" />
          <PlaceholderChart title="Dimension Breakdown" type="donut" color="purple" height={160} note="Donut — proportional score by dimension" />
        </div>

        {/* ── Dimension bars + AI Feedback ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "24px" }}>

          <div style={{ ...card, padding: "22px 20px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "4px", height: "18px", borderRadius: "2px", background: "#2f8d46", display: "inline-block" }} />
              Dimension Scores
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {(result ? dimensionBars : [
                { label: "Subject Matter Authority", score: 0, color: "#2f8d46" },
                { label: "Persuasive Delivery",       score: 0, color: "#4a90d9" },
                { label: "Answer Architecture",       score: 0, color: "#7b5ea7" },
                { label: "Emotional Intelligence",    score: 0, color: "#f4a426" },
                { label: "Response Timing",           score: 0, color: "#2f8d46" },
                { label: "Presence & Engagement",     score: 0, color: "#4a90d9" },
              ]).map((d) => (
                <div key={d.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                    <span style={{ color: "#444" }}>{d.label}</span>
                    <span style={{ color: d.color, fontWeight: 700 }}>{result ? `${d.score}%` : "—"}</span>
                  </div>
                  <div style={{ height: "6px", background: "#f0f0f0", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${d.score}%`, background: `linear-gradient(90deg, ${d.color}, ${d.color}88)`, borderRadius: "3px", transition: "width 0.8s ease" }} />
                  </div>
                </div>
              ))}
            </div>
            {!result && (
              <p style={{ fontSize: "11px", color: "#aaa", textAlign: "center", marginTop: "16px" }}>
                Scores populate after your first completed session
              </p>
            )}
          </div>

          <PlaceholderChart title="Answer Length vs Score Correlation" type="line" color="orange" height={220} note="Scatter/line — connect backend to populate" />
        </div>

        {/* ── AI Feedback Section ── */}
        <div style={{ ...card, padding: "22px 20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "4px", height: "18px", borderRadius: "2px", background: "#7b5ea7", display: "inline-block" }} />
              AI Feedback Report
            </h3>
            <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "4px", background: "#f5f5f5", border: "1px solid #e8e8e8", color: "#aaa", fontWeight: 600 }}>
              Powered by Gemini AI
            </span>
          </div>

          {result && feedbackItems.length > 0 ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {feedbackItems.map((fb) => (
                  <div
                    key={fb.category}
                    style={{ background: fb.bg, border: `1px solid ${fb.border}`, borderRadius: "8px", padding: "16px", transition: "transform 0.2s, box-shadow 0.2s", cursor: "default" }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
                    onMouseOut={(e)  => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "16px" }}>{fb.icon}</span>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: fb.color, margin: 0 }}>{fb.category}</p>
                    </div>
                    <p style={{ fontSize: "12px", color: "#666", margin: 0, lineHeight: 1.6 }}>{fb.point}</p>
                  </div>
                ))}
              </div>

              {/* AI Summary */}
              <div style={{ marginTop: "16px", padding: "18px", background: "#f8f8f8", border: "1px solid #e8e8e8", borderRadius: "8px" }}>
                <p style={{ fontSize: "13px", color: "#444", margin: 0, lineHeight: 1.8 }}>
                  📝 <strong>AI Summary:</strong> {result.aiFeedback?.summary}
                </p>
              </div>
            </>
          ) : (
            <div style={{ padding: "18px", background: "#fafafa", border: "1px dashed #ddd", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#bbb", margin: 0, lineHeight: 1.8 }}>
                📝 <strong style={{ color: "#aaa" }}>Detailed narrative feedback</strong> will appear here after session completion.
              </p>
            </div>
          )}
        </div>

        {/* ── Action buttons ── */}
        <div style={{ ...card, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 2px" }}>Ready to improve your score?</p>
            <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>Practice consistently — track every dimension over time.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              { label: "📥 Download Report", border: "#4a90d9", color: "#4a90d9" },
              { label: "📤 Share Results",   border: "#7b5ea7", color: "#7b5ea7" },
              { label: "🔁 New Session",     bg: "#2f8d46",    color: "#fff",    border: "none" },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => btn.label.includes("New") && navigate("/interview")}
                style={{ padding: "9px 18px", borderRadius: "6px", background: btn.bg || "transparent", border: btn.border !== "none" ? `2px solid ${btn.border}` : "none", color: btn.color, fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif", transition: "all 0.2s" }}
                onMouseOver={(e) => { if (!btn.bg) { e.currentTarget.style.background = btn.border; e.currentTarget.style.color = "#fff"; } else { e.currentTarget.style.background = "#257a3c"; } }}
                onMouseOut={(e)  => { if (!btn.bg) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = btn.color; } else { e.currentTarget.style.background = "#2f8d46"; } }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}