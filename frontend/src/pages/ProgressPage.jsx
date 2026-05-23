import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell, Legend
} from "recharts";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg:        "#0f1117",
    surface:   "#161b27",
    surface2:  "#1c2333",
    border:    "rgba(255,255,255,0.07)",
    borderHi:  "rgba(255,255,255,0.13)",
    green:     "#22c55e",
    greenDim:  "#16a34a",
    greenGlow: "rgba(34,197,94,0.18)",
    blue:      "#60a5fa",
    purple:    "#a78bfa",
    amber:     "#fbbf24",
    red:       "#f87171",
    text:      "#f1f5f9",
    textMid:   "#94a3b8",
    textDim:   "#475569",
};

const font = "'DM Sans', 'Segoe UI', system-ui, sans-serif";

const glass = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: "14px",
};

const glassHover = {
    background: C.surface2,
    border: `1px solid ${C.borderHi}`,
    borderRadius: "14px",
};

// ── Custom Tooltip — Line Chart ───────────────────────────────────────────────
const CustomLineTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: C.surface2, border: `1px solid ${C.borderHi}`,
            borderRadius: "10px", padding: "10px 14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)", fontFamily: font,
        }}>
            <p style={{ fontSize: "11px", color: C.textMid, marginBottom: "8px", fontWeight: 600, letterSpacing: "0.06em" }}>{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12px", fontWeight: 700, color: p.color, marginBottom: "3px" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: p.color }} />
                    {p.name}: <span style={{ color: C.text }}>{p.value}%</span>
                </div>
            ))}
        </div>
    );
};

// ── Custom Tooltip — Bar Chart ────────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{
            background: C.surface2, border: `1px solid ${C.borderHi}`,
            borderRadius: "10px", padding: "10px 14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)", fontFamily: font,
        }}>
            <p style={{ fontSize: "11px", color: C.textMid, marginBottom: "4px", fontWeight: 600 }}>{d.skill}</p>
            <div style={{ fontSize: "20px", fontWeight: 800, color: d.color }}>{d.value}%</div>
            {d.prev !== null && (
                <div style={{ fontSize: "11px", color: d.value - d.prev >= 0 ? C.green : C.red, fontWeight: 700, marginTop: "3px" }}>
                    {d.value - d.prev >= 0 ? "▲" : "▼"} {Math.abs(d.value - d.prev)} pts from last
                </div>
            )}
        </div>
    );
};

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 96, stroke = 7, color = C.green, label }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ position: "relative", width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
                    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
                    <circle
                        cx={size/2} cy={size/2} r={r} fill="none"
                        stroke={color} strokeWidth={stroke}
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${color}88)` }}
                    />
                </svg>
                <div style={{
                    position: "absolute", inset: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: size * 0.22, fontWeight: 800, color: C.text, fontFamily: font,
                }}>
                    {score}
                </div>
            </div>
            {label && <span style={{ fontSize: "11px", color: C.textMid, fontWeight: 500, letterSpacing: "0.04em" }}>{label}</span>}
        </div>
    );
}

// ── Improvement Pill ──────────────────────────────────────────────────────────
function ImprovementPill({ value, size = "normal" }) {
    if (value === null) return <span style={{ fontSize: "11px", color: C.textDim, fontStyle: "italic" }}>Baseline</span>;
    const up = value >= 0;
    const fs = size === "large" ? "14px" : "11px";
    const pad = size === "large" ? "5px 13px" : "3px 9px";
    return (
        <span style={{
            fontSize: fs, fontWeight: 700, padding: pad, borderRadius: "20px",
            background: up ? "rgba(34,197,94,0.12)" : "rgba(248,113,113,0.12)",
            color: up ? C.green : C.red,
            border: `1px solid ${up ? "rgba(34,197,94,0.3)" : "rgba(248,113,113,0.3)"}`,
            display: "inline-flex", alignItems: "center", gap: "4px",
        }}>
            {up ? "▲" : "▼"} {up ? "+" : ""}{value}%
        </span>
    );
}

// ── Skill Bar ─────────────────────────────────────────────────────────────────
function SkillBar({ label, value, prevValue, color }) {
    const delta = prevValue !== null ? value - prevValue : null;
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: C.textMid, fontWeight: 500 }}>{label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {delta !== null && <ImprovementPill value={delta} />}
                    <span style={{ fontSize: "13px", fontWeight: 700, color }}>{value ?? "—"}%</span>
                </div>
            </div>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{
                    height: "100%", width: `${value || 0}%`,
                    background: `linear-gradient(90deg, ${color}99, ${color})`,
                    borderRadius: "3px", transition: "width 1.1s cubic-bezier(.4,0,.2,1)",
                    boxShadow: `0 0 8px ${color}55`,
                }} />
            </div>
            {prevValue !== null && (
                <div style={{ height: "3px", position: "relative", marginTop: "2px" }}>
                    <div style={{
                        position: "absolute", left: `${prevValue || 0}%`,
                        top: 0, width: "2px", height: "8px",
                        background: C.textDim, borderRadius: "1px",
                        transform: "translateX(-50%) translateY(-80%)",
                    }} title={`Previous: ${prevValue}%`} />
                </div>
            )}
        </div>
    );
}

// ── Attempt Badge ─────────────────────────────────────────────────────────────
function AttemptBadge({ n }) {
    const colors = [C.green, C.blue, C.purple, C.amber, C.red];
    const c = colors[(n - 1) % colors.length];
    return (
        <span style={{
            fontSize: "11px", fontWeight: 700, padding: "3px 10px",
            borderRadius: "5px",
            background: `${c}18`, color: c, border: `1px solid ${c}44`,
        }}>
            Attempt {n}
        </span>
    );
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ icon, label, value, unit, note, noteColor, accent }) {
    return (
        <div style={{
            ...glass,
            padding: "20px",
            borderTop: `2px solid ${accent}`,
            position: "relative", overflow: "hidden",
        }}>
            <div style={{
                position: "absolute", top: "-20px", right: "-20px",
                width: "80px", height: "80px", borderRadius: "50%",
                background: `${accent}0d`,
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ fontSize: "16px" }}>{icon}</span>
                <span style={{ fontSize: "10px", color: C.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
            </div>
            <div style={{ fontSize: value?.length > 6 ? "16px" : "26px", fontWeight: 800, color: C.text, lineHeight: 1 }}>
                {value}
                <span style={{ fontSize: "12px", color: C.textDim, fontWeight: 500 }}>{unit}</span>
            </div>
            <div style={{ fontSize: "11px", color: noteColor || C.textDim, marginTop: "8px", fontWeight: 500 }}>{note}</div>
        </div>
    );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, sub, accent = C.green }) {
    return (
        <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "3px" }}>
                <div style={{ width: "3px", height: "16px", borderRadius: "2px", background: accent, flexShrink: 0 }} />
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: C.text, margin: 0 }}>{title}</h3>
            </div>
            {sub && <p style={{ fontSize: "11px", color: C.textDim, margin: "0 0 0 12px" }}>{sub}</p>}
        </div>
    );
}

const SKILL_CONFIG = [
    { key: "overallScore",       label: "Overall",       color: C.green,  radarKey: "Overall" },
    { key: "communicationScore", label: "Communication", color: C.blue,   radarKey: "Communication" },
    { key: "confidenceScore",    label: "Confidence",    color: C.purple, radarKey: "Confidence" },
    { key: "attentionScore",     label: "Eye Contact",   color: C.amber,  radarKey: "Eye Contact" },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProgressPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("iq_token");

    const [sessions,   setSessions]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [expanded,   setExpanded]   = useState(null);
    const [activeTab,  setActiveTab]  = useState("overview");

    useEffect(() => {
        if (!token) { navigate("/auth"); return; }
        const fetchSessions = async () => {
            try {
                const res  = await fetch("http://localhost:5000/api/interviews", { headers: { Authorization: `Bearer ${token}` } });
                const data = await res.json();
                if (!data.success) { setError("Failed to load sessions."); setLoading(false); return; }

                const completed = data.interviews
                    .filter((i) => i.status === "completed")
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                const detailed = await Promise.all(
                    completed.map(async (s) => {
                        const r = await fetch(`http://localhost:5000/api/interviews/${s._id}`, { headers: { Authorization: `Bearer ${token}` } });
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
    }, [token, navigate]);

    // ── Derived ───────────────────────────────────────────────────────────────
    const total    = sessions.length;
    const latest   = sessions[total - 1] || null;
    const previous = sessions[total - 2] || null;

    const overallDelta = latest && previous
        ? (latest.overallScore ?? 0) - (previous.overallScore ?? 0) : null;
    const overallPct = overallDelta !== null && previous?.overallScore
        ? Math.round((overallDelta / previous.overallScore) * 100) : null;

    const trendData = sessions.map((s, i) => ({
        name: `#${i + 1}`,
        Overall:       s.overallScore       ?? 0,
        Communication: s.communicationScore ?? 0,
        Confidence:    s.confidenceScore    ?? 0,
        "Eye Contact": s.attentionScore     ?? 0,
    }));

    const barData = SKILL_CONFIG.map((sk) => ({
        skill: sk.label,
        value: latest?.[sk.key] ?? 0,
        prev:  previous?.[sk.key] ?? null,
        color: sk.color,
    }));

    const radarData = SKILL_CONFIG.map((sk) => ({
        subject:  sk.radarKey,
        score:    latest?.[sk.key]   ?? 0,
        prev:     previous?.[sk.key] ?? 0,
        fullMark: 100,
    }));

    const formatDate = (str) => str
        ? new Date(str).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "—";

    const avgScore  = total > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.overallScore ?? 0), 0) / total) : 0;
    const weakSkill = SKILL_CONFIG.slice(1).sort((a, b) => (latest?.[a.key] ?? 0) - (latest?.[b.key] ?? 0))[0]?.label ?? "—";

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", background: C.bg, fontFamily: font }}>
            <Sidebar activePage="Project Analysis" />
            <main style={{ marginLeft: "220px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "44px", marginBottom: "16px" }}>📊</div>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: C.textMid }}>Analysing your progress...</p>
                </div>
            </main>
        </div>
    );

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error) return (
        <div style={{ minHeight: "100vh", display: "flex", background: C.bg, fontFamily: font }}>
            <Sidebar activePage="Project Analysis" />
            <main style={{ marginLeft: "220px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: C.red }}>{error}</p>
            </main>
        </div>
    );

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: "100vh", display: "flex", background: C.bg, fontFamily: font, color: C.text }}>
            <Sidebar activePage="Project Analysis" />

            <main style={{ marginLeft: "220px", padding: "28px 32px", flex: 1, overflowY: "auto" }}>

                {/* ── Header ── */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
                    <div>
                        <p style={{ fontSize: "10px", color: C.textDim, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 600, marginBottom: "5px" }}>
                            InterviewQ · Growth Tracker
                        </p>
                        <h1 style={{ fontSize: "26px", fontWeight: 800, color: C.text, margin: "0 0 5px" }}>
                            Progress <span style={{ color: C.green }}>Analysis</span>
                        </h1>
                        <p style={{ fontSize: "13px", color: C.textMid, margin: 0 }}>
                            {total > 0
                                ? `${total} session${total > 1 ? "s" : ""} completed · Last: ${formatDate(latest?.createdAt)}`
                                : "Complete your first interview to begin tracking."}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            onClick={() => navigate("/pre-interview")}
                            style={{
                                padding: "9px 20px", borderRadius: "8px",
                                background: C.green, border: "none",
                                color: "#0f1117", fontWeight: 700, fontSize: "13px",
                                cursor: "pointer", fontFamily: font,
                                boxShadow: `0 0 16px ${C.greenGlow}`,
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = "#16a34a"}
                            onMouseOut={(e)  => e.currentTarget.style.background = C.green}
                        >🔁 New Session</button>
                        <button
                            onClick={() => navigate("/dashboard")}
                            style={{
                                padding: "9px 20px", borderRadius: "8px",
                                background: "transparent",
                                border: `1px solid ${C.borderHi}`,
                                color: C.textMid, fontWeight: 600, fontSize: "13px",
                                cursor: "pointer", fontFamily: font,
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = C.surface2; e.currentTarget.style.color = C.text; }}
                            onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMid; }}
                        >← Dashboard</button>
                    </div>
                </div>

                {/* ── Empty State ── */}
                {total === 0 && (
                    <div style={{ ...glass, padding: "70px 40px", textAlign: "center" }}>
                        <div style={{ fontSize: "56px", marginBottom: "16px" }}>📈</div>
                        <h2 style={{ fontSize: "20px", fontWeight: 800, color: C.text, marginBottom: "10px" }}>No sessions yet</h2>
                        <p style={{ fontSize: "13px", color: C.textMid, marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px", lineHeight: 1.7 }}>
                            Complete your first mock interview to unlock score graphs, skill radar charts, and AI feedback comparisons.
                        </p>
                        <button
                            onClick={() => navigate("/pre-interview")}
                            style={{ padding: "11px 30px", borderRadius: "8px", background: C.green, border: "none", color: "#0f1117", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: font }}
                        >Start First Interview →</button>
                    </div>
                )}

                {total > 0 && (
                    <>
                        {/* ── Tabs ── */}
                        <div style={{
                            display: "flex", gap: "4px", marginBottom: "24px",
                            background: C.surface, border: `1px solid ${C.border}`,
                            borderRadius: "10px", padding: "4px", width: "fit-content",
                        }}>
                            {["overview", "history"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: "8px 22px", borderRadius: "7px", border: "none",
                                        cursor: "pointer", fontWeight: 600, fontSize: "13px", fontFamily: font,
                                        background: activeTab === tab ? C.surface2 : "transparent",
                                        color: activeTab === tab ? C.text : C.textDim,
                                        border: activeTab === tab ? `1px solid ${C.borderHi}` : "1px solid transparent",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {tab === "overview" ? "📊 Overview" : "📋 Session History"}
                                </button>
                            ))}
                        </div>

                        {/* ══════════ OVERVIEW TAB ══════════ */}
                        {activeTab === "overview" && (
                            <>
                                {/* Metric Cards */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "20px" }}>
                                    <MetricCard icon="🗂️" label="Sessions Done"  value={String(total)}                  unit=""     note="total completed"       accent={C.blue} />
                                    <MetricCard icon="🏆" label="Latest Score"   value={String(latest?.overallScore ?? 0)} unit="/100" note={overallPct !== null ? `${overallPct >= 0 ? "+" : ""}${overallPct}% vs last` : "First attempt"} noteColor={overallPct !== null ? (overallPct >= 0 ? C.green : C.red) : C.textDim} accent={C.green} />
                                    <MetricCard icon="📉" label="Session Avg"    value={String(avgScore)}                unit="/100" note="across all attempts"   accent={C.purple} />
                                    <MetricCard icon="🎯" label="Needs Work"     value={weakSkill}                       unit=""     note="focus here next time"  accent={C.amber} />
                                </div>

                                {/* Score Rings */}
                                {latest && (
                                    <div style={{ ...glass, padding: "24px 26px", marginBottom: "18px" }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px" }}>
                                            <SectionHeader
                                                title="Latest Session Snapshot"
                                                sub={`Attempt #${total} · ${formatDate(latest?.createdAt)}`}
                                            />
                                            {overallDelta !== null && (
                                                <div style={{ textAlign: "right" }}>
                                                    <div style={{ fontSize: "10px", color: C.textDim, marginBottom: "5px", fontWeight: 600, letterSpacing: "0.08em" }}>IMPROVEMENT FROM LAST</div>
                                                    <ImprovementPill value={overallPct} size="large" />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "24px" }}>
                                            {SKILL_CONFIG.map((sk) => (
                                                <div key={sk.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                                    <ScoreRing score={latest[sk.key] ?? 0} color={sk.color} size={92} label={sk.label} />
                                                    {previous && <ImprovementPill value={Math.round((latest[sk.key] ?? 0) - (previous[sk.key] ?? 0))} />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Charts Row */}
                                <div style={{ display: "grid", gridTemplateColumns: total >= 2 ? "1.6fr 1fr" : "1fr", gap: "16px", marginBottom: "18px" }}>

                                    {/* Line Chart */}
                                    <div style={{ ...glass, padding: "22px 20px" }}>
                                        <SectionHeader
                                            title="Score Trend — All Attempts"
                                            sub="How each skill evolved across your sessions"
                                            accent={C.blue}
                                        />
                                        <div style={{ display: "flex", gap: "14px", marginBottom: "14px", flexWrap: "wrap" }}>
                                            {SKILL_CONFIG.map((sk) => (
                                                <div key={sk.key} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                    <div style={{ width: "10px", height: "3px", borderRadius: "2px", background: sk.color }} />
                                                    <span style={{ fontSize: "11px", color: C.textDim }}>{sk.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {total >= 2 ? (
                                            <ResponsiveContainer width="100%" height={200}>
                                                <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.textDim }} />
                                                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: C.textDim }} />
                                                    <Tooltip content={<CustomLineTooltip />} />
                                                    {SKILL_CONFIG.map((sk) => (
                                                        <Line
                                                            key={sk.key} type="monotone"
                                                            dataKey={sk.radarKey || sk.label} name={sk.label}
                                                            stroke={sk.color} strokeWidth={2.5}
                                                            dot={{ r: 4, fill: sk.color, strokeWidth: 0 }}
                                                            activeDot={{ r: 6 }}
                                                        />
                                                    ))}
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px" }}>
                                                <span style={{ fontSize: "30px" }}>📈</span>
                                                <p style={{ fontSize: "12px", color: C.textDim, margin: 0 }}>Complete 2+ sessions to see the trend</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Radar Chart */}
                                    {latest && (
                                        <div style={{ ...glass, padding: "22px 20px" }}>
                                            <SectionHeader
                                                title="Skill Radar"
                                                sub={previous ? "Latest vs previous session" : "Latest session skills"}
                                                accent={C.purple}
                                            />
                                            <ResponsiveContainer width="100%" height={220}>
                                                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                                                    <PolarGrid stroke="rgba(255,255,255,0.07)" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: C.textMid, fontWeight: 500 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: C.textDim }} />
                                                    <Radar name="Latest" dataKey="score" stroke={C.green} fill={C.green} fillOpacity={0.18} strokeWidth={2} />
                                                    {previous && (
                                                        <Radar name="Previous" dataKey="prev" stroke={C.blue} fill={C.blue} fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 3" />
                                                    )}
                                                    {previous && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: C.textMid }} />}
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                {/* Bar Chart */}
                                {latest && (
                                    <div style={{ ...glass, padding: "22px 20px", marginBottom: "18px" }}>
                                        <SectionHeader
                                            title={`Skill Comparison — ${previous ? "Latest vs Previous" : "Latest Session"}`}
                                            sub="Bar shows your latest score · Grey marker shows previous"
                                            accent={C.amber}
                                        />
                                        <ResponsiveContainer width="100%" height={180}>
                                            <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={36}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="skill" tick={{ fontSize: 12, fill: C.textMid, fontWeight: 500 }} />
                                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: C.textDim }} />
                                                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                                                <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                                                    {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                                </Bar>
                                                {previous && <Bar dataKey="prev" radius={[5, 5, 0, 0]} fill="rgba(255,255,255,0.12)" name="Previous" />}
                                            </BarChart>
                                        </ResponsiveContainer>
                                        {previous && (
                                            <div style={{ display: "flex", gap: "16px", marginTop: "10px", justifyContent: "flex-end" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: C.green }} />
                                                    <span style={{ fontSize: "11px", color: C.textDim }}>Latest</span>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "rgba(255,255,255,0.15)", border: `1px solid ${C.borderHi}` }} />
                                                    <span style={{ fontSize: "11px", color: C.textDim }}>Previous</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* AI Feedback */}
                                {latest?.aiFeedback && (
                                    <div style={{ ...glass, padding: "24px 26px", marginBottom: "18px" }}>
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
                                            <SectionHeader
                                                title="🤖 AI Feedback — Latest Session"
                                                sub={`Attempt #${total} · ${formatDate(latest?.createdAt)}`}
                                                accent={C.green}
                                            />
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                            {[
                                                { label: "Content Quality",   icon: "🧠", color: C.green,  bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)",   text: latest.aiFeedback?.contentQuality },
                                                { label: "Vocal Delivery",    icon: "🎙️", color: C.blue,   bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.2)",  text: latest.aiFeedback?.vocalDelivery },
                                                { label: "Body Language",     icon: "🪞", color: C.purple, bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)", text: latest.aiFeedback?.bodyLanguage },
                                                { label: "Answer Structure",  icon: "📋", color: C.amber,  bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)",  text: latest.aiFeedback?.answerStructure },
                                            ].filter((f) => f.text).map((fb) => (
                                                <div key={fb.label} style={{ background: fb.bg, border: `1px solid ${fb.border}`, borderRadius: "10px", padding: "14px 16px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
                                                        <span style={{ fontSize: "15px" }}>{fb.icon}</span>
                                                        <span style={{ fontSize: "12px", fontWeight: 700, color: fb.color }}>{fb.label}</span>
                                                    </div>
                                                    <p style={{ fontSize: "12px", color: C.textMid, margin: 0, lineHeight: 1.75 }}>{fb.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {latest.aiFeedback?.summary && (
                                            <div style={{ marginTop: "12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px 16px" }}>
                                                <p style={{ fontSize: "12px", color: C.textMid, margin: 0, lineHeight: 1.8 }}>
                                                    <strong style={{ color: C.text }}>📝 Summary:</strong> {latest.aiFeedback.summary}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ══════════ HISTORY TAB ══════════ */}
                        {activeTab === "history" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {[...sessions].reverse().map((session, revIdx) => {
                                    const idx      = total - 1 - revIdx;
                                    const prev     = sessions[idx - 1] || null;
                                    const delta    = prev ? (session.overallScore ?? 0) - (prev.overallScore ?? 0) : null;
                                    const deltaPct = delta !== null && prev?.overallScore ? Math.round((delta / prev.overallScore) * 100) : null;
                                    const isOpen   = expanded === session._id;
                                    const isLatest = idx === total - 1;

                                    return (
                                        <div key={session._id} style={{
                                            ...glass,
                                            overflow: "hidden",
                                            border: isLatest ? `1px solid rgba(34,197,94,0.35)` : `1px solid ${C.border}`,
                                            transition: "border-color 0.2s",
                                        }}>
                                            {/* Row Header */}
                                            <div
                                                onClick={() => setExpanded(isOpen ? null : session._id)}
                                                style={{
                                                    padding: "16px 20px", display: "flex",
                                                    alignItems: "center", justifyContent: "space-between",
                                                    cursor: "pointer",
                                                    background: isLatest ? "rgba(34,197,94,0.05)" : "transparent",
                                                }}
                                            >
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                                    <AttemptBadge n={idx + 1} />
                                                    {isLatest && (
                                                        <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: C.green, color: C.bg }}>
                                                            LATEST
                                                        </span>
                                                    )}
                                                    <span style={{ fontSize: "13px", color: C.textDim }}>{formatDate(session.createdAt)}</span>
                                                    <span style={{ color: C.textDim }}>·</span>
                                                    <span style={{ fontSize: "13px", color: C.textMid }}>{session.role || "General Interview"}</span>
                                                </div>

                                                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                                    <div style={{ textAlign: "right" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <span style={{ fontSize: "24px", fontWeight: 800, color: C.text }}>{session.overallScore ?? 0}</span>
                                                            <span style={{ fontSize: "12px", color: C.textDim }}>/100</span>
                                                            {delta !== null
                                                                ? <ImprovementPill value={deltaPct} />
                                                                : <span style={{ fontSize: "11px", color: C.textDim, fontStyle: "italic" }}>Baseline</span>}
                                                        </div>
                                                        <div style={{ fontSize: "10px", color: C.textDim, textAlign: "right" }}>Overall Score</div>
                                                    </div>
                                                    <span style={{ fontSize: "18px", color: C.textDim, display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
                                                </div>
                                            </div>

                                            {/* Expanded Panel */}
                                            {isOpen && (
                                                <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
                                                    <div style={{ paddingTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

                                                        {/* Skill Bars */}
                                                        <div>
                                                            <p style={{ fontSize: "10px", fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Skill Scores vs Previous</p>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                                                            <p style={{ fontSize: "10px", fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>AI Feedback</p>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                                {[
                                                                    { label: "Content Quality",  icon: "🧠", color: C.green,  bg: "rgba(34,197,94,0.07)",   border: "rgba(34,197,94,0.18)",   text: session.aiFeedback?.contentQuality },
                                                                    { label: "Vocal Delivery",   icon: "🎙️", color: C.blue,   bg: "rgba(96,165,250,0.07)",  border: "rgba(96,165,250,0.18)",  text: session.aiFeedback?.vocalDelivery },
                                                                    { label: "Body Language",    icon: "🪞", color: C.purple, bg: "rgba(167,139,250,0.07)", border: "rgba(167,139,250,0.18)", text: session.aiFeedback?.bodyLanguage },
                                                                    { label: "Answer Structure", icon: "📋", color: C.amber,  bg: "rgba(251,191,36,0.07)",  border: "rgba(251,191,36,0.18)",  text: session.aiFeedback?.answerStructure },
                                                                ].filter((f) => f.text).map((fb) => (
                                                                    <div key={fb.label} style={{ background: fb.bg, border: `1px solid ${fb.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                                                                            <span style={{ fontSize: "14px" }}>{fb.icon}</span>
                                                                            <span style={{ fontSize: "12px", fontWeight: 700, color: fb.color }}>{fb.label}</span>
                                                                        </div>
                                                                        <p style={{ fontSize: "12px", color: C.textMid, margin: 0, lineHeight: 1.65 }}>{fb.text}</p>
                                                                    </div>
                                                                ))}
                                                                {!session.aiFeedback && (
                                                                    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px dashed ${C.border}`, borderRadius: "8px", padding: "20px", textAlign: "center" }}>
                                                                        <p style={{ fontSize: "12px", color: C.textDim, margin: 0 }}>No AI feedback for this session.</p>
                                                                    </div>
                                                                )}
                                                                {session.aiFeedback?.summary && (
                                                                    <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                                                                        <p style={{ fontSize: "12px", color: C.textMid, margin: 0, lineHeight: 1.7 }}>
                                                                            <strong style={{ color: C.text }}>📝 Summary:</strong> {session.aiFeedback.summary}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end" }}>
                                                        <button
                                                            onClick={() => navigate("/results")}
                                                            style={{ padding: "8px 18px", borderRadius: "7px", background: "transparent", border: `1px solid ${C.blue}44`, color: C.blue, fontWeight: 600, fontSize: "12px", cursor: "pointer", fontFamily: font }}
                                                            onMouseOver={(e) => { e.currentTarget.style.background = `${C.blue}18`; }}
                                                            onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; }}
                                                        >View Full Report →</button>
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

                {/* Version */}
                <div style={{ textAlign: "center", padding: "10px 0 24px", marginTop: "8px" }}>
                    <p style={{ fontSize: "11px", color: C.textDim, margin: 0 }}>
                        InterviewQ v1.0.0 · VIT Vellore · Built by Arrsh Tripathi
                    </p>
                </div>

            </main>
        </div>
    );
}