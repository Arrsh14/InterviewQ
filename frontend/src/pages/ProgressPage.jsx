import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell, Legend
} from "recharts";

// ── Custom Tooltip for Line Chart ─────────────────────────────────────────────
const CustomLineTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "8px", padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}>
            <p style={{ fontSize: "11px", color: "#888", marginBottom: "6px", fontWeight: 600 }}>{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: p.color }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: p.color }} />
                    {p.name}: {p.value}%
                </div>
            ))}
        </div>
    );
};

// ── Custom Tooltip for Bar Chart ──────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "8px", padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.10)", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}>
            <p style={{ fontSize: "11px", color: "#888", marginBottom: "4px", fontWeight: 600 }}>{d.skill}</p>
            <div style={{ fontSize: "18px", fontWeight: 900, color: d.color }}>{d.value}%</div>
            {d.prev !== null && (
                <div style={{ fontSize: "11px", color: d.value - d.prev >= 0 ? "#2f8d46" : "#e53935", fontWeight: 700, marginTop: "3px" }}>
                    {d.value - d.prev >= 0 ? "▲" : "▼"} {Math.abs(d.value - d.prev)} pts from last
                </div>
            )}
        </div>
    );
};

// ── Circular Progress Ring ────────────────────────────────────────────────────
function ScoreRing({ score, size = 100, stroke = 8, color = "#2f8d46", label }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f0f0" strokeWidth={stroke} />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth={stroke}
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                />
                <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
                    fill="#1a1a1a" fontSize={size * 0.22} fontWeight="900"
                    style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px`, fontFamily: "'Open Sans','Segoe UI',sans-serif" }}>
                    {score}
                </text>
            </svg>
            {label && <span style={{ fontSize: "11px", color: "#888", fontWeight: 600 }}>{label}</span>}
        </div>
    );
}

// ── Improvement Pill ──────────────────────────────────────────────────────────
function ImprovementPill({ value, size = "normal" }) {
    if (value === null) return <span style={{ fontSize: "11px", color: "#bbb", fontStyle: "italic" }}>Baseline</span>;
    const up = value >= 0;
    const fs = size === "large" ? "15px" : "12px";
    const pad = size === "large" ? "5px 14px" : "3px 10px";
    return (
        <span style={{ fontSize: fs, fontWeight: 700, padding: pad, borderRadius: "20px", background: up ? "#eaf7ee" : "#fff0f0", color: up ? "#2f8d46" : "#e53935", border: `1.5px solid ${up ? "#b7e4c7" : "#ffcdd2"}`, display: "inline-flex", alignItems: "center", gap: "4px" }}>
            {up ? "▲" : "▼"} {up ? "+" : ""}{value}%
        </span>
    );
}

// ── Skill Bar with animation ──────────────────────────────────────────────────
function SkillBar({ label, value, prevValue, color }) {
    const delta = prevValue !== null ? value - prevValue : null;
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", marginBottom: "6px" }}>
                <span style={{ color: "#555", fontWeight: 600 }}>{label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {delta !== null && <ImprovementPill value={delta} />}
                    <span style={{ color, fontWeight: 800, fontSize: "13px" }}>{value ?? "—"}%</span>
                </div>
            </div>
            <div style={{ height: "8px", background: "#f0f0f0", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${value || 0}%`, background: color, borderRadius: "4px", transition: "width 1s ease" }} />
            </div>
            {prevValue !== null && (
                <div style={{ height: "3px", background: "transparent", borderRadius: "4px", marginTop: "2px", position: "relative" }}>
                    <div style={{ position: "absolute", left: `${prevValue || 0}%`, top: 0, width: "2px", height: "8px", background: "#ccc", borderRadius: "1px", transform: "translateX(-50%) translateY(-100%)" }} title={`Previous: ${prevValue}%`} />
                </div>
            )}
        </div>
    );
}

// ── Attempt Badge ─────────────────────────────────────────────────────────────
function AttemptBadge({ n }) {
    const colors = [
        { bg: "#eaf7ee", color: "#2f8d46", border: "#b7e4c7" },
        { bg: "#eaf2fb", color: "#4a90d9", border: "#b3d4f5" },
        { bg: "#f3eeff", color: "#7b5ea7", border: "#d8c5f7" },
        { bg: "#fff8ee", color: "#f4a426", border: "#fde3b0" },
        { bg: "#fff0f0", color: "#e53935", border: "#ffcdd2" },
    ];
    const c = colors[(n - 1) % colors.length];
    return (
        <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "4px", background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
            Attempt {n}
        </span>
    );
}

// ── Card style ────────────────────────────────────────────────────────────────
const card = {
    background: "#fff",
    border: "1px solid #e8e8e8",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    fontFamily: "'Open Sans','Segoe UI',sans-serif",
};

const SKILL_CONFIG = [
    { key: "overallScore", label: "Overall", color: "#2f8d46", radarKey: "Overall" },
    { key: "communicationScore", label: "Communication", color: "#4a90d9", radarKey: "Communication" },
    { key: "confidenceScore", label: "Confidence", color: "#7b5ea7", radarKey: "Confidence" },
    { key: "attentionScore", label: "Eye Contact", color: "#f4a426", radarKey: "Eye Contact" },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function ProgressPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("iq_token");

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [activeTab, setActiveTab] = useState("overview"); // overview | history

    // ── Fetch sessions ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!token) {
            navigate("/auth");
            return;
        }
        const fetchSessions = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/interviews", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!data.success) { setError("Failed to load sessions."); setLoading(false); return; }

                const completed = data.interviews
                    .filter((i) => i.status === "completed")
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                const detailed = await Promise.all(
                    completed.map(async (s) => {
                        const r = await fetch(`http://localhost:5000/api/interviews/${s._id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const d = await r.json();
                        return d.success ? d.interview : s;
                    })
                );
                setSessions(detailed);
            } catch {
                setError("Could not connect to server.");
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, [token,navigate]);

    // ── Derived data ──────────────────────────────────────────────────────────
    const total = sessions.length;
    const latest = sessions[total - 1] || null;
    const previous = sessions[total - 2] || null;

    const overallDelta = latest && previous
        ? (latest.overallScore ?? 0) - (previous.overallScore ?? 0)
        : null;

    const overallPct = overallDelta !== null && previous?.overallScore
        ? Math.round((overallDelta / previous.overallScore) * 100)
        : null;

    // Line chart data — one point per session
    const trendData = sessions.map((s, i) => ({
        name: `#${i + 1}`,
        Overall: s.overallScore ?? 0,
        Communication: s.communicationScore ?? 0,
        Confidence: s.confidenceScore ?? 0,
        "Eye Contact": s.attentionScore ?? 0,
    }));

    // Bar chart — latest vs previous
    const barData = SKILL_CONFIG.map((sk) => ({
        skill: sk.label,
        value: latest?.[sk.key] ?? 0,
        prev: previous?.[sk.key] ?? null,
        color: sk.color,
    }));

    // Radar chart — latest session
    const radarData = SKILL_CONFIG.map((sk) => ({
        subject: sk.radarKey,
        score: latest?.[sk.key] ?? 0,
        prev: previous?.[sk.key] ?? 0,
        fullMark: 100,
    }));

    const formatDate = (str) => str
        ? new Date(str).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "—";

    const bestSkill = SKILL_CONFIG.slice(1).sort((a, b) => (latest?.[b.key] ?? 0) - (latest?.[a.key] ?? 0))[0]?.label ?? "—";
    const weakSkill = SKILL_CONFIG.slice(1).sort((a, b) => (latest?.[a.key] ?? 0) - (latest?.[b.key] ?? 0))[0]?.label ?? "—";
    const avgScore = total > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.overallScore ?? 0), 0) / total) : 0;

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg,#dce8f5 0%,#eaf1fb 50%,#dce8f5 100%)", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}>
            <Sidebar activePage="Project Analysis" />
            <main style={{ marginLeft: "240px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px", animation: "pulse 1.5s infinite" }}>📊</div>
                    <p style={{ fontSize: "16px", fontWeight: 700, color: "#444" }}>Analysing your progress...</p>
                </div>
            </main>
        </div>
    );

    // ── Main ──────────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg,#dce8f5 0%,#eaf1fb 50%,#dce8f5 100%)", fontFamily: "'Open Sans','Segoe UI',sans-serif", color: "#2d2d2d" }}>
            <Sidebar activePage="Project Analysis" />

            <main style={{ marginLeft: "240px", padding: "32px 36px", flex: 1, overflowY: "auto" }}>

                {/* ── Header ── */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
                    <div>
                        <p style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "5px", fontWeight: 600 }}>InterviewQ · Growth Tracker</p>
                        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#1a1a1a", margin: 0 }}>
                            Progress <span style={{ color: "#2f8d46" }}>Analysis</span>
                        </h1>
                        <p style={{ fontSize: "13px", color: "#666", marginTop: "6px" }}>
                            {total > 0
                                ? `${total} session${total > 1 ? "s" : ""} completed · Last: ${formatDate(latest?.createdAt)}`
                                : "Complete your first interview to begin tracking."}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => navigate("/pre-interview")} style={{ padding: "10px 20px", borderRadius: "6px", background: "#2f8d46", border: "none", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
                            onMouseOver={(e) => e.currentTarget.style.background = "#257a3c"}
                            onMouseOut={(e) => e.currentTarget.style.background = "#2f8d46"}>
                            🔁 New Session
                        </button>
                        <button onClick={() => navigate("/dashboard")} style={{ padding: "10px 20px", borderRadius: "6px", background: "transparent", border: "2px solid #4a90d9", color: "#4a90d9", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
                            onMouseOver={(e) => { e.currentTarget.style.background = "#4a90d9"; e.currentTarget.style.color = "#fff"; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4a90d9"; }}>
                            ← Dashboard
                        </button>
                    </div>
                </div>

                {/* ── Empty State ── */}
                {total === 0 && (
                    <div style={{ ...card, padding: "70px 40px", textAlign: "center" }}>
                        <div style={{ fontSize: "60px", marginBottom: "16px" }}>📈</div>
                        <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#1a1a1a", marginBottom: "8px" }}>No sessions yet</h2>
                        <p style={{ fontSize: "14px", color: "#888", marginBottom: "24px", maxWidth: "420px", margin: "0 auto 24px" }}>
                            Complete your first mock interview to unlock score graphs, skill radar charts, percentage improvement tracking, and AI feedback comparisons.
                        </p>
                        <button onClick={() => navigate("/pre-interview")} style={{ padding: "12px 32px", borderRadius: "6px", background: "#2f8d46", border: "none", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}>
                            Start First Interview →
                        </button>
                    </div>
                )}

                {total > 0 && (
                    <>
                        {/* ── Tabs ── */}
                        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "#e8f0fb", borderRadius: "8px", padding: "4px", width: "fit-content" }}>
                            {["overview", "history"].map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 22px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "'Open Sans','Segoe UI',sans-serif", background: activeTab === tab ? "#fff" : "transparent", color: activeTab === tab ? "#1a1a1a" : "#888", boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.10)" : "none", transition: "all 0.2s" }}>
                                    {tab === "overview" ? "📊 Overview" : "📋 Session History"}
                                </button>
                            ))}
                        </div>

                        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
                        {activeTab === "overview" && (
                            <>
                                {/* ── Metric cards ── */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "22px" }}>
                                    {[
                                        { label: "Sessions Done", value: String(total), unit: "", icon: "🗂️", note: "total completed", accent: "#4a90d9" },
                                        { label: "Latest Score", value: String(latest?.overallScore ?? 0), unit: "/100", icon: "🏆", note: overallPct !== null ? `${overallPct >= 0 ? "+" : ""}${overallPct}% from last` : "First attempt", accent: "#2f8d46", noteColor: overallPct !== null ? (overallPct >= 0 ? "#2f8d46" : "#e53935") : "#aaa" },
                                        { label: "Session Avg", value: String(avgScore), unit: "/100", icon: "📉", note: "across all attempts", accent: "#7b5ea7" },
                                        { label: "Needs Work", value: weakSkill, unit: "", icon: "🎯", note: "focus here next time", accent: "#f4a426" },
                                    ].map((m) => (
                                        <div key={m.label} style={{ ...card, padding: "18px 20px", borderTop: `3px solid ${m.accent}` }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                                                <span style={{ fontSize: "18px" }}>{m.icon}</span>
                                                <span style={{ fontSize: "10px", color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</span>
                                            </div>
                                            <div style={{ fontSize: m.value.length > 6 ? "15px" : "26px", fontWeight: 900, color: "#1a1a1a", lineHeight: 1 }}>
                                                {m.value}<span style={{ fontSize: "12px", color: "#aaa", fontWeight: 600 }}>{m.unit}</span>
                                            </div>
                                            <div style={{ fontSize: "11px", color: m.noteColor || "#aaa", marginTop: "6px", fontWeight: 600 }}>{m.note}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Score Rings + Improvement summary ── */}
                                {latest && (
                                    <div style={{ ...card, padding: "24px 28px", marginBottom: "22px" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                                            <div>
                                                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1a1a1a", margin: "0 0 4px" }}>Latest Session Snapshot</h3>
                                                <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>Attempt #{total} · {formatDate(latest?.createdAt)}</p>
                                            </div>
                                            {overallDelta !== null && (
                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px", fontWeight: 600 }}>IMPROVEMENT FROM LAST</div>
                                                    <ImprovementPill value={overallPct} size="large" />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "20px" }}>
                                            {SKILL_CONFIG.map((sk) => (
                                                <div key={sk.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                                    <ScoreRing score={latest[sk.key] ?? 0} color={sk.color} size={90} label={sk.label} />
                                                    {previous && (
                                                        <ImprovementPill value={Math.round(((latest[sk.key] ?? 0) - (previous[sk.key] ?? 0)))} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Charts row ── */}
                                <div style={{ display: "grid", gridTemplateColumns: total >= 2 ? "1.6fr 1fr" : "1fr", gap: "18px", marginBottom: "22px" }}>

                                    {/* Score Trend Line Chart */}
                                    <div style={{ ...card, padding: "22px 20px" }}>
                                        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>Score Trend — All Attempts</h3>
                                        <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "16px" }}>How each skill evolved across your interview sessions</p>
                                        <div style={{ display: "flex", gap: "16px", marginBottom: "12px", flexWrap: "wrap" }}>
                                            {SKILL_CONFIG.map((sk) => (
                                                <div key={sk.key} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                    <div style={{ width: "10px", height: "3px", borderRadius: "2px", background: sk.color }} />
                                                    <span style={{ fontSize: "11px", color: "#888" }}>{sk.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {total >= 2 ? (
                                            <ResponsiveContainer width="100%" height={200}>
                                                <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#aaa" }} />
                                                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#aaa" }} />
                                                    <Tooltip content={<CustomLineTooltip />} />
                                                    {SKILL_CONFIG.map((sk) => (
                                                        <Line key={sk.key} type="monotone" dataKey={sk.radarKey || sk.label} name={sk.label} stroke={sk.color} strokeWidth={2.5} dot={{ r: 5, fill: sk.color, strokeWidth: 0 }} activeDot={{ r: 7 }} />
                                                    ))}
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px" }}>
                                                <span style={{ fontSize: "32px" }}>📈</span>
                                                <p style={{ fontSize: "12px", color: "#bbb", margin: 0 }}>Complete 2+ sessions to see the trend line</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Radar Chart */}
                                    {latest && (
                                        <div style={{ ...card, padding: "22px 20px" }}>
                                            <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>Skill Radar</h3>
                                            <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "8px" }}>
                                                {previous ? "Latest vs previous session" : "Latest session skills"}
                                            </p>
                                            <ResponsiveContainer width="100%" height={220}>
                                                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                                                    <PolarGrid stroke="#f0f0f0" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#888", fontWeight: 600 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#ccc" }} />
                                                    <Radar name="Latest" dataKey="score" stroke="#2f8d46" fill="#2f8d46" fillOpacity={0.20} strokeWidth={2} />
                                                    {previous && (
                                                        <Radar name="Previous" dataKey="prev" stroke="#4a90d9" fill="#4a90d9" fillOpacity={0.10} strokeWidth={1.5} strokeDasharray="4 3" />
                                                    )}
                                                    {previous && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />}
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                {/* ── Bar chart: latest vs previous ── */}
                                {latest && (
                                    <div style={{ ...card, padding: "22px 20px", marginBottom: "22px" }}>
                                        <h3 style={{ fontSize: "14px", fontWeight: 800, color: "#1a1a1a", marginBottom: "4px" }}>
                                            Skill Comparison — {previous ? "Latest vs Previous" : "Latest Session"}
                                        </h3>
                                        <p style={{ fontSize: "11px", color: "#aaa", marginBottom: "16px" }}>Bar shows your latest score · Grey marker shows previous</p>
                                        <ResponsiveContainer width="100%" height={180}>
                                            <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={36}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                                <XAxis dataKey="skill" tick={{ fontSize: 12, fill: "#888", fontWeight: 600 }} />
                                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#aaa" }} />
                                                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                                                <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                                                    {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                                </Bar>
                                                {previous && (
                                                    <Bar dataKey="prev" radius={[5, 5, 0, 0]} fill="#e8e8e8" name="Previous" />
                                                )}
                                            </BarChart>
                                        </ResponsiveContainer>
                                        {previous && (
                                            <div style={{ display: "flex", gap: "16px", marginTop: "10px", justifyContent: "flex-end" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#2f8d46" }} /><span style={{ fontSize: "11px", color: "#888" }}>Latest</span></div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#e8e8e8", border: "1px solid #ccc" }} /><span style={{ fontSize: "11px", color: "#888" }}>Previous</span></div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Latest AI Feedback ── */}
                                {latest?.aiFeedback && (
                                    <div style={{ ...card, padding: "24px 26px", marginBottom: "22px" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                                            <div>
                                                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#1a1a1a", margin: "0 0 4px" }}>🤖 AI Feedback — Latest Session</h3>
                                                <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>Attempt #{total} · {formatDate(latest?.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                                            {[
                                                { label: "Content Quality", icon: "🧠", color: "#2f8d46", bg: "#f1fbf4", border: "#b7e4c7", text: latest.aiFeedback?.contentQuality },
                                                { label: "Vocal Delivery", icon: "🎙️", color: "#4a90d9", bg: "#eaf2fb", border: "#b3d4f5", text: latest.aiFeedback?.vocalDelivery },
                                                { label: "Body Language", icon: "🪞", color: "#7b5ea7", bg: "#f5f0ff", border: "#d8c5f7", text: latest.aiFeedback?.bodyLanguage },
                                                { label: "Answer Structure", icon: "📋", color: "#f4a426", bg: "#fffbf0", border: "#fde3b0", text: latest.aiFeedback?.answerStructure },
                                            ].filter((f) => f.text).map((fb) => (
                                                <div key={fb.label} style={{ background: fb.bg, border: `1px solid ${fb.border}`, borderRadius: "10px", padding: "14px 16px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "7px" }}>
                                                        <span style={{ fontSize: "16px" }}>{fb.icon}</span>
                                                        <span style={{ fontSize: "12px", fontWeight: 800, color: fb.color }}>{fb.label}</span>
                                                    </div>
                                                    <p style={{ fontSize: "12px", color: "#555", margin: 0, lineHeight: 1.7 }}>{fb.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {latest.aiFeedback?.summary && (
                                            <div style={{ marginTop: "14px", background: "#f8f8f8", border: "1px solid #e8e8e8", borderRadius: "10px", padding: "14px 16px" }}>
                                                <p style={{ fontSize: "12px", color: "#555", margin: 0, lineHeight: 1.8 }}>
                                                    <strong style={{ color: "#1a1a1a" }}>📝 Summary:</strong> {latest.aiFeedback.summary}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ═══════════════ HISTORY TAB ═══════════════ */}
                        {activeTab === "history" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                {[...sessions].reverse().map((session, revIdx) => {
                                    const idx = total - 1 - revIdx;
                                    const prev = sessions[idx - 1] || null;
                                    const delta = prev ? (session.overallScore ?? 0) - (prev.overallScore ?? 0) : null;
                                    const deltaPct = delta !== null && prev?.overallScore
                                        ? Math.round((delta / prev.overallScore) * 100) : null;
                                    const isOpen = expanded === session._id;
                                    const isLatest = idx === total - 1;

                                    return (
                                        <div key={session._id} style={{ ...card, overflow: "hidden", border: isLatest ? "1.5px solid #b7e4c7" : "1px solid #e8e8e8" }}>

                                            {/* Header */}
                                            <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: isLatest ? "#f8fdf9" : "#fff" }}
                                                onClick={() => setExpanded(isOpen ? null : session._id)}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                                    <AttemptBadge n={idx + 1} />
                                                    {isLatest && <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: "#2f8d46", color: "#fff" }}>LATEST</span>}
                                                    <span style={{ fontSize: "13px", color: "#888" }}>{formatDate(session.createdAt)}</span>
                                                    <span style={{ fontSize: "13px", color: "#aaa" }}>·</span>
                                                    <span style={{ fontSize: "13px", color: "#666" }}>{session.role || "General Interview"}</span>
                                                </div>

                                                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                                    <div style={{ textAlign: "right" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <span style={{ fontSize: "24px", fontWeight: 900, color: "#1a1a1a" }}>{session.overallScore ?? 0}</span>
                                                            <span style={{ fontSize: "12px", color: "#aaa" }}>/100</span>
                                                            {delta !== null
                                                                ? <ImprovementPill value={deltaPct} />
                                                                : <span style={{ fontSize: "11px", color: "#bbb", fontStyle: "italic" }}>Baseline</span>}
                                                        </div>
                                                        <div style={{ fontSize: "10px", color: "#aaa", textAlign: "right" }}>Overall Score</div>
                                                    </div>
                                                    <span style={{ fontSize: "18px", color: "#ccc", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
                                                </div>
                                            </div>

                                            {/* Expanded */}
                                            {isOpen && (
                                                <div style={{ padding: "0 22px 22px", borderTop: "1px solid #f0f0f0" }}>
                                                    <div style={{ paddingTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

                                                        {/* Skill bars */}
                                                        <div>
                                                            <p style={{ fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>Skill Scores vs Previous</p>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                                                {SKILL_CONFIG.map((sk) => (
                                                                    <SkillBar
                                                                        key={sk.key}
                                                                        label={sk.label}
                                                                        value={session[sk.key] ?? 0}
                                                                        prevValue={prev ? (prev[sk.key] ?? 0) : null}
                                                                        color={sk.color}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* AI Feedback */}
                                                        <div>
                                                            <p style={{ fontSize: "11px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>AI Feedback</p>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                                {[
                                                                    { label: "Content Quality", icon: "🧠", color: "#2f8d46", bg: "#f1fbf4", border: "#b7e4c7", text: session.aiFeedback?.contentQuality },
                                                                    { label: "Vocal Delivery", icon: "🎙️", color: "#4a90d9", bg: "#eaf2fb", border: "#b3d4f5", text: session.aiFeedback?.vocalDelivery },
                                                                    { label: "Body Language", icon: "🪞", color: "#7b5ea7", bg: "#f5f0ff", border: "#d8c5f7", text: session.aiFeedback?.bodyLanguage },
                                                                    { label: "Answer Structure", icon: "📋", color: "#f4a426", bg: "#fffbf0", border: "#fde3b0", text: session.aiFeedback?.answerStructure },
                                                                ].filter((f) => f.text).map((fb) => (
                                                                    <div key={fb.label} style={{ background: fb.bg, border: `1px solid ${fb.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                                                                            <span style={{ fontSize: "14px" }}>{fb.icon}</span>
                                                                            <span style={{ fontSize: "12px", fontWeight: 800, color: fb.color }}>{fb.label}</span>
                                                                        </div>
                                                                        <p style={{ fontSize: "12px", color: "#555", margin: 0, lineHeight: 1.65 }}>{fb.text}</p>
                                                                    </div>
                                                                ))}
                                                                {!session.aiFeedback && (
                                                                    <div style={{ background: "#fafafa", border: "1px dashed #ddd", borderRadius: "8px", padding: "20px", textAlign: "center" }}>
                                                                        <p style={{ fontSize: "12px", color: "#bbb", margin: 0 }}>No AI feedback for this session.</p>
                                                                    </div>
                                                                )}
                                                                {session.aiFeedback?.summary && (
                                                                    <div style={{ background: "#f8f8f8", border: "1px solid #e8e8e8", borderRadius: "8px", padding: "12px 14px" }}>
                                                                        <p style={{ fontSize: "12px", color: "#555", margin: 0, lineHeight: 1.7 }}>
                                                                            <strong>📝 Summary:</strong> {session.aiFeedback.summary}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end" }}>
                                                        <button onClick={() => navigate("/results")} style={{ padding: "8px 18px", borderRadius: "6px", background: "transparent", border: "1.5px solid #4a90d9", color: "#4a90d9", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
                                                            onMouseOver={(e) => { e.currentTarget.style.background = "#4a90d9"; e.currentTarget.style.color = "#fff"; }}
                                                            onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4a90d9"; }}>
                                                            View Full Report →
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}