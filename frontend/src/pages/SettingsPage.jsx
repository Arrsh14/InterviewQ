import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

// ─── Design tokens (same as ProgressPage) ────────────────────────────────────
const C = {
  bg:       "#0f1117",
  surface:  "#161b27",
  surface2: "#1c2333",
  border:   "rgba(255,255,255,0.07)",
  borderHi: "rgba(255,255,255,0.13)",
  green:    "#22c55e",
  blue:     "#60a5fa",
  purple:   "#a78bfa",
  amber:    "#fbbf24",
  red:      "#f87171",
  text:     "#f1f5f9",
  textMid:  "#94a3b8",
  textDim:  "#475569",
};

const font = "'DM Sans', 'Segoe UI', system-ui, sans-serif";

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: "38px", height: "21px", borderRadius: "11px", cursor: "pointer",
        background: checked ? C.green : "rgba(255,255,255,0.1)",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
        boxShadow: checked ? `0 0 10px ${C.green}44` : "none",
      }}
    >
      <div style={{
        position: "absolute",
        top: "2.5px",
        left: checked ? "19px" : "3px",
        width: "16px", height: "16px", borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
      }} />
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, accent, children }) {
  const ac = accent || C.green;
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: "14px",
      padding: "20px 22px",
      marginBottom: "14px",
    }}>
      <h3 style={{
        fontSize: "13px", fontWeight: 600, color: C.text,
        marginBottom: "18px", display: "flex", alignItems: "center", gap: "9px",
      }}>
        <span style={{
          width: "3px", height: "16px", borderRadius: "2px",
          background: ac, display: "inline-block", flexShrink: 0,
          boxShadow: `0 0 6px ${ac}88`,
        }} />
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Settings row ─────────────────────────────────────────────────────────────
function Row({ label, sub, last, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: "16px",
      paddingBottom: last ? 0 : "14px",
      marginBottom: last ? 0 : "14px",
      borderBottom: last ? "none" : `1px solid ${C.border}`,
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "13px", fontWeight: 500, color: C.text, margin: "0 0 2px" }}>{label}</p>
        {sub && <p style={{ fontSize: "11px", color: C.textDim, margin: 0, lineHeight: 1.4 }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Shared input / select styles ────────────────────────────────────────────
const inputStyle = {
  width: "200px", padding: "7px 11px",
  borderRadius: "7px", border: `1px solid rgba(255,255,255,0.07)`,
  fontSize: "12px", color: "#f1f5f9",
  background: "#1c2333", fontFamily: font, outline: "none",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer", appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
  paddingRight: "26px",
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate  = useNavigate();
  const userName  = localStorage.getItem("iq_user_name")  || "User";
  const userEmail = localStorage.getItem("iq_user_email") || "user@example.com";

  const [name,  setName]  = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [role,  setRole]  = useState("CS Student");
  const [saved, setSaved] = useState(false);

  const [questionCount,  setQuestionCount]  = useState(localStorage.getItem("iq_question_count") || "5");
  const [timePerQ,       setTimePerQ]       = useState(localStorage.getItem("iq_time_per_q")     || "120");
  const [interviewTrack, setInterviewTrack] = useState(localStorage.getItem("iq_track")          || "technical");
  const [difficulty,     setDifficulty]     = useState(localStorage.getItem("iq_difficulty")     || "medium");

  const [eyeContact,     setEyeContact]     = useState(localStorage.getItem("iq_eye_contact")           !== "false");
  const [facialAnalysis, setFacialAnalysis] = useState(localStorage.getItem("iq_facial_analysis")       !== "false");
  const [speechTx,       setSpeechTx]       = useState(localStorage.getItem("iq_speech_transcription")  !== "false");
  const [nlpScoring,     setNlpScoring]     = useState(localStorage.getItem("iq_nlp_scoring")           !== "false");
  const [posture,        setPosture]        = useState(localStorage.getItem("iq_posture_detection")     === "true");
  const [autoNext,       setAutoNext]       = useState(localStorage.getItem("iq_auto_next")             === "true");

  const [eyeAlerts,    setEyeAlerts]    = useState(true);
  const [timerWarn,    setTimerWarn]    = useState(true);
  const [sessionPop,   setSessionPop]   = useState(true);
  const [emailReports, setEmailReports] = useState(false);

  const [saveTranscripts, setSaveTranscripts] = useState(true);
  const [saveFrames,      setSaveFrames]      = useState(false);
  const [analytics,       setAnalytics]       = useState(true);

  const handleSave = () => {
    localStorage.setItem("iq_user_name",      name);
    localStorage.setItem("iq_user_email",     email);
    localStorage.setItem("iq_user_role",      role);
    localStorage.setItem("iq_question_count", questionCount);
    localStorage.setItem("iq_time_per_q",     timePerQ);
    localStorage.setItem("iq_track",          interviewTrack);
    localStorage.setItem("iq_difficulty",     difficulty);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => { localStorage.clear(); navigate("/auth"); };

  const handleDelete = () => {
    if (window.confirm("This will permanently delete your account and all session data. Continue?")) {
      localStorage.clear();
      navigate("/auth");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: C.bg, fontFamily: font, color: C.text }}>
      <Sidebar activePage="Settings" />

      <main style={{ marginLeft: "220px", padding: "28px 32px", flex: 1, overflowY: "auto" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: "24px" }}>
          <p style={{ fontSize: "10px", color: C.textDim, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 600, marginBottom: "5px" }}>
            Preferences
          </p>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: C.text, margin: "0 0 5px" }}>
            Account <span style={{ color: C.green }}>Settings</span>
          </h1>
          <p style={{ fontSize: "13px", color: C.textMid, margin: 0 }}>
            Manage your profile, interview preferences, and AI detection settings.
          </p>
        </div>

        {/* ── 1. Profile ── */}
        <Section title="Profile information" accent={C.green}>
          <div style={{
            display: "flex", alignItems: "center", gap: "16px",
            marginBottom: "18px", paddingBottom: "18px",
            borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: "rgba(34,197,94,0.1)", border: "1.5px solid rgba(34,197,94,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", fontWeight: 700, color: C.green, flexShrink: 0,
              boxShadow: "0 0 16px rgba(34,197,94,0.15)",
            }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: C.text, margin: "0 0 2px" }}>{name}</p>
              <p style={{ fontSize: "12px", color: C.textMid, margin: "0 0 7px" }}>{email}</p>
              <span style={{
                fontSize: "10px", padding: "2px 9px",
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: "4px", color: C.green, fontWeight: 600,
              }}>Free Plan</span>
            </div>
          </div>

          <Row label="Full name" sub="Appears on your dashboard and reports">
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(34,197,94,0.5)")}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
            />
          </Row>
          <Row label="Email address" sub="Used for login and report delivery">
            <input
              value={email} onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(34,197,94,0.5)")}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
            />
          </Row>
          <Row label="Role / title" sub="Helps personalise interview questions" last>
            <input
              value={role} onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. CS Student, Developer"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(34,197,94,0.5)")}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
            />
          </Row>

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", marginTop: "14px" }}>
            {saved && <span style={{ fontSize: "12px", color: C.green, fontWeight: 600 }}>✓ Saved!</span>}
            <button
              onClick={handleSave}
              style={{
                padding: "8px 20px", borderRadius: "8px",
                background: C.green, color: "#0f1117",
                fontWeight: 700, fontSize: "12px",
                border: "none", cursor: "pointer", fontFamily: font,
                boxShadow: "0 0 14px rgba(34,197,94,0.3)",
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#16a34a"}
              onMouseOut={(e)  => e.currentTarget.style.background = C.green}
            >Save changes</button>
          </div>
        </Section>

        {/* ── 2. Interview Preferences ── */}
        <Section title="Interview preferences" accent={C.blue}>
          <Row label="Number of questions" sub="Questions per interview session">
            <select value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} style={selectStyle}>
              {["3","5","7","10"].map((n) => <option key={n} value={n}>{n} Questions</option>)}
            </select>
          </Row>
          <Row label="Time per question" sub="Countdown timer duration">
            <select value={timePerQ} onChange={(e) => setTimePerQ(e.target.value)} style={selectStyle}>
              <option value="60">1 minute</option>
              <option value="90">1.5 minutes</option>
              <option value="120">2 minutes</option>
              <option value="180">3 minutes</option>
              <option value="300">5 minutes</option>
            </select>
          </Row>
          <Row label="Interview track" sub="Domain focus for question selection">
            <select value={interviewTrack} onChange={(e) => setInterviewTrack(e.target.value)} style={selectStyle}>
              <option value="general">General / Mixed</option>
              <option value="technical">Technical / CS</option>
              <option value="behavioral">Behavioral (STAR)</option>
              <option value="ml">Machine Learning</option>
              <option value="product">Product Management</option>
              <option value="data">Data Science</option>
            </select>
          </Row>
          <Row label="Difficulty level" sub="Controls question complexity and scoring strictness" last>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={selectStyle}>
              <option value="easy">Easy — Beginner</option>
              <option value="medium">Medium — Intermediate</option>
              <option value="hard">Hard — Advanced</option>
            </select>
          </Row>
        </Section>

        {/* ── 3. AI & Detection ── */}
        <Section title="AI & detection" accent={C.purple}>
          <Row label="Eye contact detection" sub="Real-time gaze tracking via face-api.js">
            <Toggle checked={eyeContact} onChange={(v) => { setEyeContact(v); localStorage.setItem("iq_eye_contact", v); }} />
          </Row>
          <Row label="Facial expression analysis" sub="Detects engagement and composure via webcam">
            <Toggle checked={facialAnalysis} onChange={(v) => { setFacialAnalysis(v); localStorage.setItem("iq_facial_analysis", v); }} />
          </Row>
          <Row label="Speech transcription" sub="Live speech-to-text using Web Speech API">
            <Toggle checked={speechTx} onChange={(v) => { setSpeechTx(v); localStorage.setItem("iq_speech_transcription", v); }} />
          </Row>
          <Row label="NLP scoring" sub="Gemini AI evaluates answer quality and structure">
            <Toggle checked={nlpScoring} onChange={(v) => { setNlpScoring(v); localStorage.setItem("iq_nlp_scoring", v); }} />
          </Row>
          <Row label="Posture detection" sub="ML model assesses body posture (requires Python server)">
            <Toggle checked={posture} onChange={(v) => { setPosture(v); localStorage.setItem("iq_posture_detection", v); }} />
          </Row>
          <Row label="Auto-advance questions" sub="Move to next question when timer expires" last>
            <Toggle checked={autoNext} onChange={(v) => { setAutoNext(v); localStorage.setItem("iq_auto_next", v); }} />
          </Row>
        </Section>

        {/* ── 4. Notifications ── */}
        <Section title="Notifications" accent={C.amber}>
          <Row label="Eye contact alerts" sub="Floating popup on gaze deviation">
            <Toggle checked={eyeAlerts} onChange={setEyeAlerts} />
          </Row>
          <Row label="Timer warnings" sub="Visual and audio cue at 20 seconds remaining">
            <Toggle checked={timerWarn} onChange={setTimerWarn} />
          </Row>
          <Row label="Session summary popup" sub="Show completion summary when interview ends">
            <Toggle checked={sessionPop} onChange={setSessionPop} />
          </Row>
          <Row label="Email reports" sub="Receive PDF report via email after each session" last>
            <Toggle checked={emailReports} onChange={setEmailReports} />
          </Row>
        </Section>

        {/* ── 5. Privacy & Data ── */}
        <Section title="Privacy & data" accent={C.blue}>
          <Row label="Save transcripts" sub="Store spoken answers in MongoDB for review">
            <Toggle checked={saveTranscripts} onChange={setSaveTranscripts} />
          </Row>
          <Row label="Save video frames" sub="Store sampled webcam frames for facial analysis replay">
            <Toggle checked={saveFrames} onChange={setSaveFrames} />
          </Row>
          <Row label="Usage analytics" sub="Share anonymised usage data to improve InterviewQ" last>
            <Toggle checked={analytics} onChange={setAnalytics} />
          </Row>

          <div style={{
            marginTop: "14px", padding: "14px",
            background: C.surface2, border: `1px solid ${C.border}`,
            borderRadius: "10px", display: "flex",
            alignItems: "center", justifyContent: "space-between", gap: "12px",
          }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, color: C.text, margin: "0 0 2px" }}>Download my data</p>
              <p style={{ fontSize: "11px", color: C.textDim, margin: 0 }}>Export sessions, scores, and transcripts as JSON.</p>
            </div>
            <button
              style={{
                padding: "7px 14px", borderRadius: "7px",
                background: "transparent", border: "1px solid rgba(96,165,250,0.35)",
                color: C.blue, fontWeight: 600, fontSize: "12px",
                cursor: "pointer", fontFamily: font, whiteSpace: "nowrap",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "rgba(96,165,250,0.1)"; }}
              onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; }}
            >📥 Export data</button>
          </div>
        </Section>

        {/* ── 6. Account ── */}
        <Section title="Account" accent={C.red}>
          <Row label="Change password" sub="Update your password via OTP verification">
            <button
              onClick={() => navigate("/auth")}
              style={{
                padding: "7px 14px", borderRadius: "7px",
                background: "transparent", border: `1px solid ${C.borderHi}`,
                color: C.textMid, fontWeight: 500, fontSize: "12px",
                cursor: "pointer", fontFamily: font,
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = C.surface2; e.currentTarget.style.color = C.text; }}
              onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMid; }}
            >Change password</button>
          </Row>
          <Row label="Sign out" sub="Log out from this device">
            <button
              onClick={handleLogout}
              style={{
                padding: "7px 14px", borderRadius: "7px",
                background: "transparent", border: `1px solid ${C.borderHi}`,
                color: C.textMid, fontWeight: 500, fontSize: "12px",
                cursor: "pointer", fontFamily: font,
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)"; e.currentTarget.style.color = C.red; }}
              onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.borderHi; e.currentTarget.style.color = C.textMid; }}
            >Sign out</button>
          </Row>
          <Row label="Delete account" sub="Permanently delete your account and all data. Cannot be undone." last>
            <button
              onClick={handleDelete}
              style={{
                padding: "7px 14px", borderRadius: "7px",
                background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
                color: C.red, fontWeight: 600, fontSize: "12px",
                cursor: "pointer", fontFamily: font,
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = "#0f1117"; }}
              onMouseOut={(e)  => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; e.currentTarget.style.color = C.red; }}
            >Delete account</button>
          </Row>
        </Section>

        {/* ── Version ── */}
        <div style={{ textAlign: "center", padding: "10px 0 28px" }}>
          <p style={{ fontSize: "11px", color: C.textDim, margin: 0 }}>
            InterviewQ v1.0.0 · VIT Vellore · Built by Arrsh Tripathi
          </p>
        </div>

      </main>
    </div>
  );
}