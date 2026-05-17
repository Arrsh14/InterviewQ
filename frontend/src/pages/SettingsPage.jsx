import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

const card = {
  background: "#fff",
  border: "1px solid #e8e8e8",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  fontFamily: "'Open Sans','Segoe UI',sans-serif",
};

// ── Reusable toggle switch ────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: "40px", height: "22px", borderRadius: "11px", cursor: "pointer",
        background: checked ? "#2f8d46" : "#e0e0e0",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: "3px",
        left: checked ? "21px" : "3px",
        width: "16px", height: "16px", borderRadius: "50%",
        background: "#fff", transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  );
}

// ── Reusable section card ─────────────────────────────────────────────────────
function SettingsSection({ title, accent = "#2f8d46", children }) {
  return (
    <div style={{ ...card, padding: "22px 24px", marginBottom: "20px" }}>
      <h3 style={{
        fontSize: "15px", fontWeight: 700, color: "#1a1a1a",
        marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px",
      }}>
        <span style={{ width: "4px", height: "18px", borderRadius: "2px", background: accent, display: "inline-block" }} />
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Row with label + control ──────────────────────────────────────────────────
function SettingsRow({ label, sublabel, children, last = false }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      paddingBottom: last ? 0 : "16px", marginBottom: last ? 0 : "16px",
      borderBottom: last ? "none" : "1px solid #f0f0f0",
      gap: "16px",
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a", margin: "0 0 2px" }}>{label}</p>
        {sublabel && <p style={{ fontSize: "11px", color: "#aaa", margin: 0, lineHeight: 1.5 }}>{sublabel}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate  = useNavigate();
  const userName  = localStorage.getItem("iq_user_name")  || "User";
  const userEmail = localStorage.getItem("iq_user_email") || "user@example.com";

  // ── Profile state ──────────────────────────────────────────────────────────
  const [name,  setName]  = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [role,  setRole]  = useState("CS Student");
  const [saved, setSaved] = useState(false);

  // ── Interview preferences ──────────────────────────────────────────────────
  const [questionCount,  setQuestionCount]  = useState("5");
  const [timePerQ,       setTimePerQ]       = useState("120");
  const [interviewTrack, setInterviewTrack] = useState("general");
  const [difficulty,     setDifficulty]     = useState("medium");

  // ── AI & detection toggles ─────────────────────────────────────────────────
  const [eyeContactDetection, setEyeContactDetection] = useState(true);
  const [facialAnalysis,      setFacialAnalysis]      = useState(true);
  const [speechTranscription, setSpeechTranscription] = useState(true);
  const [nlpScoring,          setNlpScoring]          = useState(true);
  const [postureDetection,    setPostureDetection]    = useState(false);
  const [autoNextQuestion,    setAutoNextQuestion]    = useState(false);

  // ── Notification toggles ───────────────────────────────────────────────────
  const [eyeContactAlerts,  setEyeContactAlerts]  = useState(true);
  const [timerWarnings,     setTimerWarnings]     = useState(true);
  const [sessionSummary,    setSessionSummary]    = useState(true);
  const [emailReports,      setEmailReports]      = useState(false);

  // ── Privacy toggles ───────────────────────────────────────────────────────
  const [saveTranscripts,  setSaveTranscripts]  = useState(true);
  const [saveVideoFrames,  setSaveVideoFrames]  = useState(false);
  const [analytics,        setAnalytics]        = useState(true);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveProfile = () => {
    localStorage.setItem("iq_user_name",  name);
    localStorage.setItem("iq_user_email", email);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure? This will permanently delete your account and all session data.")) {
      localStorage.clear();
      navigate("/auth");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  const inputStyle = {
    width: "220px", padding: "8px 12px", borderRadius: "6px",
    border: "1px solid #e8e8e8", fontSize: "13px", color: "#1a1a1a",
    fontFamily: "'Open Sans','Segoe UI',sans-serif", outline: "none",
    background: "#fafafa", transition: "border-color 0.15s",
  };

  const selectStyle = {
    ...inputStyle, cursor: "pointer", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23aaa' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
    paddingRight: "28px",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg,#dce8f5 0%,#eaf1fb 50%,#dce8f5 100%)", fontFamily: "'Open Sans','Segoe UI',sans-serif", color: "#2d2d2d" }}>
      <Sidebar activePage="Settings" />

      <main style={{ marginLeft: "240px", padding: "32px 36px", flex: 1, overflowY: "auto" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "5px", fontWeight: 600 }}>
            Preferences
          </p>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
            Account <span style={{ color: "#2f8d46" }}>Settings</span>
          </h1>
          <p style={{ fontSize: "13px", color: "#666", marginTop: "6px" }}>
            Manage your profile, interview preferences, and AI detection settings.
          </p>
        </div>

        {/* ── 1. Profile ── */}
        <SettingsSection title="Profile Information" accent="#2f8d46">
          <div style={{ display: "flex", alignItems: "flex-start", gap: "24px", marginBottom: "20px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#eaf7ee", border: "2px solid #b7e4c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 800, color: "#2f8d46", flexShrink: 0 }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 2px" }}>{name}</p>
              <p style={{ fontSize: "12px", color: "#aaa", margin: "0 0 10px" }}>{email}</p>
              <span style={{ fontSize: "11px", padding: "3px 10px", background: "#eaf7ee", border: "1px solid #b7e4c7", borderRadius: "4px", color: "#2f8d46", fontWeight: 600 }}>Free Plan</span>
            </div>
          </div>

          <SettingsRow label="Full Name" sublabel="This appears on your dashboard and reports">
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#2f8d46")}
              onBlur={(e)  => (e.target.style.borderColor = "#e8e8e8")} />
          </SettingsRow>

          <SettingsRow label="Email Address" sublabel="Used for login and report delivery">
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#2f8d46")}
              onBlur={(e)  => (e.target.style.borderColor = "#e8e8e8")} />
          </SettingsRow>

          <SettingsRow label="Role / Title" sublabel="Helps personalise interview questions" last>
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. CS Student, Developer" style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#2f8d46")}
              onBlur={(e)  => (e.target.style.borderColor = "#e8e8e8")} />
          </SettingsRow>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px", gap: "10px" }}>
            {saved && <span style={{ fontSize: "12px", color: "#2f8d46", fontWeight: 600, alignSelf: "center" }}>✓ Saved!</span>}
            <button onClick={handleSaveProfile}
              style={{ padding: "9px 22px", borderRadius: "6px", background: "#2f8d46", color: "#fff", fontWeight: 700, fontSize: "13px", border: "none", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif", transition: "background 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#257a3c")}
              onMouseOut={(e)  => (e.currentTarget.style.background = "#2f8d46")}
            >Save Changes</button>
          </div>
        </SettingsSection>

        {/* ── 2. Interview Preferences ── */}
        <SettingsSection title="Interview Preferences" accent="#4a90d9">
          <SettingsRow label="Number of Questions" sublabel="How many questions per interview session">
            <select value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} style={selectStyle}>
              {["3", "5", "7", "10"].map((n) => <option key={n} value={n}>{n} Questions</option>)}
            </select>
          </SettingsRow>

          <SettingsRow label="Time per Question" sublabel="Countdown timer duration for each question">
            <select value={timePerQ} onChange={(e) => setTimePerQ(e.target.value)} style={selectStyle}>
              <option value="60">1 minute</option>
              <option value="90">1.5 minutes</option>
              <option value="120">2 minutes</option>
              <option value="180">3 minutes</option>
              <option value="300">5 minutes</option>
            </select>
          </SettingsRow>

          <SettingsRow label="Interview Track" sublabel="Domain focus for question selection">
            <select value={interviewTrack} onChange={(e) => setInterviewTrack(e.target.value)} style={selectStyle}>
              <option value="general">General / Mixed</option>
              <option value="technical">Technical / CS</option>
              <option value="behavioral">Behavioral (STAR)</option>
              <option value="ml">Machine Learning</option>
              <option value="product">Product Management</option>
              <option value="data">Data Science</option>
            </select>
          </SettingsRow>

          <SettingsRow label="Difficulty Level" sublabel="Controls question complexity and scoring strictness" last>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={selectStyle}>
              <option value="easy">Easy — Beginner</option>
              <option value="medium">Medium — Intermediate</option>
              <option value="hard">Hard — Advanced</option>
            </select>
          </SettingsRow>
        </SettingsSection>

        {/* ── 3. AI & Detection ── */}
        <SettingsSection title="AI & Detection" accent="#7b5ea7">
          <SettingsRow label="Eye Contact Detection" sublabel="Real-time gaze tracking using face-api.js — shows warning when you look away">
            <Toggle checked={eyeContactDetection} onChange={setEyeContactDetection} />
          </SettingsRow>

          <SettingsRow label="Facial Expression Analysis" sublabel="Detects engagement, emotion, and composure via webcam">
            <Toggle checked={facialAnalysis} onChange={setFacialAnalysis} />
          </SettingsRow>

          <SettingsRow label="Speech Transcription" sublabel="Live speech-to-text using Web Speech API">
            <Toggle checked={speechTranscription} onChange={setSpeechTranscription} />
          </SettingsRow>

          <SettingsRow label="NLP Scoring" sublabel="Gemini AI evaluates answer quality, structure, and vocabulary">
            <Toggle checked={nlpScoring} onChange={setNlpScoring} />
          </SettingsRow>

          <SettingsRow label="Posture Detection" sublabel="Uses ML model to assess body posture via webcam (requires Python server)">
            <Toggle checked={postureDetection} onChange={setPostureDetection} />
          </SettingsRow>

          <SettingsRow label="Auto-advance Questions" sublabel="Automatically move to next question when timer expires" last>
            <Toggle checked={autoNextQuestion} onChange={setAutoNextQuestion} />
          </SettingsRow>
        </SettingsSection>

        {/* ── 4. Notifications ── */}
        <SettingsSection title="Notifications" accent="#f4a426">
          <SettingsRow label="Eye Contact Alerts" sublabel="Show floating popup when gaze deviation is detected">
            <Toggle checked={eyeContactAlerts} onChange={setEyeContactAlerts} />
          </SettingsRow>

          <SettingsRow label="Timer Warnings" sublabel="Visual and audio cue when 20 seconds remain">
            <Toggle checked={timerWarnings} onChange={setTimerWarnings} />
          </SettingsRow>

          <SettingsRow label="Session Summary Popup" sublabel="Show completion summary when interview ends">
            <Toggle checked={sessionSummary} onChange={setSessionSummary} />
          </SettingsRow>

          <SettingsRow label="Email Reports" sublabel="Receive PDF report via email after each session" last>
            <Toggle checked={emailReports} onChange={setEmailReports} />
          </SettingsRow>
        </SettingsSection>

        {/* ── 5. Privacy & Data ── */}
        <SettingsSection title="Privacy & Data" accent="#4a90d9">
          <SettingsRow label="Save Transcripts" sublabel="Store your spoken answers in MongoDB for historical review">
            <Toggle checked={saveTranscripts} onChange={setSaveTranscripts} />
          </SettingsRow>

          <SettingsRow label="Save Video Frames" sublabel="Store sampled webcam frames for facial analysis replay">
            <Toggle checked={saveVideoFrames} onChange={setSaveVideoFrames} />
          </SettingsRow>

          <SettingsRow label="Usage Analytics" sublabel="Help improve InterviewQ by sharing anonymised usage data" last>
            <Toggle checked={analytics} onChange={setAnalytics} />
          </SettingsRow>

          <div style={{ marginTop: "16px", padding: "14px", background: "#f9f9f9", border: "1px solid #f0f0f0", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a1a1a", margin: "0 0 2px" }}>Download My Data</p>
              <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>Export all your interview sessions, scores, and transcripts as JSON.</p>
            </div>
            <button style={{ padding: "7px 16px", borderRadius: "6px", background: "transparent", border: "1px solid #4a90d9", color: "#4a90d9", fontWeight: 600, fontSize: "12px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif", whiteSpace: "nowrap" }}>
              📥 Export Data
            </button>
          </div>
        </SettingsSection>

        {/* ── 6. Account Actions ── */}
        <SettingsSection title="Account" accent="#e53935">
          <SettingsRow label="Change Password" sublabel="Update your password via OTP verification">
            <button
              onClick={() => navigate("/auth")}
              style={{ padding: "7px 16px", borderRadius: "6px", background: "transparent", border: "1px solid #e8e8e8", color: "#444", fontWeight: 600, fontSize: "12px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
            >
              Change Password
            </button>
          </SettingsRow>

          <SettingsRow label="Sign Out" sublabel="Log out from this device">
            <button
              onClick={handleLogout}
              style={{ padding: "7px 16px", borderRadius: "6px", background: "transparent", border: "1px solid #e8e8e8", color: "#444", fontWeight: 600, fontSize: "12px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif", transition: "all 0.2s" }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "#e53935"; e.currentTarget.style.color = "#e53935"; }}
              onMouseOut={(e)  => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.color = "#444"; }}
            >
              Sign Out
            </button>
          </SettingsRow>

          <SettingsRow label="Delete Account" sublabel="Permanently delete your account and all associated data. This cannot be undone." last>
            <button
              onClick={handleDeleteAccount}
              style={{ padding: "7px 16px", borderRadius: "6px", background: "#fff5f5", border: "1px solid #ffcccc", color: "#e53935", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif", transition: "all 0.2s" }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#e53935"; e.currentTarget.style.color = "#fff"; }}
              onMouseOut={(e)  => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.color = "#e53935"; }}
            >
              Delete Account
            </button>
          </SettingsRow>
        </SettingsSection>

        {/* ── Version info ── */}
        <div style={{ textAlign: "center", padding: "12px 0 32px" }}>
          <p style={{ fontSize: "11px", color: "#ccc", margin: 0 }}>
            InterviewQ v1.0.0 · VIT Vellore · Built by Arrsh Tripathi
          </p>
        </div>

      </main>
    </div>
  );
}