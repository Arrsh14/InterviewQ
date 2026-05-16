import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import InterviewTimer from "../components/InterviewTimer.jsx";
import EyeContactWarning from "../components/EyeContactWarning.jsx";

// ── Default questions ─────────────────────────────────────────────────────────
const DEFAULT_QUESTIONS = [
  {
    text: "Tell me about yourself and your professional background.",
    type: "Behavioral",
    tip: "Keep it to 2 minutes. Cover your background, current role, and why you're here.",
  },
  {
    text: "What are your greatest professional strengths?",
    type: "Behavioral",
    tip: "Pick 2–3 strengths and back each one with a specific example.",
  },
  {
    text: "Describe a challenging situation you faced and how you handled it.",
    type: "Situational",
    tip: "Use the STAR method — Situation, Task, Action, Result.",
  },
  {
    text: "Why are you interested in this role and our company?",
    type: "Motivational",
    tip: "Research the company beforehand. Show genuine alignment with their mission.",
  },
  {
    text: "Where do you see yourself professionally in five years?",
    type: "Career",
    tip: "Be honest but ambitious. Align your goals with the role's growth path.",
  },
];

// ── Merge resume questions from localStorage ──────────────────────────────────
const savedResumeQ    = localStorage.getItem("iq_resume_questions");
const resumeQuestions = savedResumeQ ? JSON.parse(savedResumeQ) : [];
const ALL_QUESTIONS   = [...DEFAULT_QUESTIONS, ...resumeQuestions];

const card = {
  background: "#fff",
  border: "1px solid #e8e8e8",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  fontFamily: "'Open Sans','Segoe UI',sans-serif",
};

const typeMeta = {
  Behavioral:   { bg: "#eaf7ee", border: "#b7e4c7", color: "#2f8d46" },
  Situational:  { bg: "#eaf2fb", border: "#b3d4f5", color: "#4a90d9" },
  Motivational: { bg: "#fff8ee", border: "#fde3b0", color: "#f4a426" },
  Career:       { bg: "#f3eeff", border: "#d8c5f7", color: "#7b5ea7" },
  Technical:    { bg: "#fff0f0", border: "#ffb3b3", color: "#e53935" },
};

export default function InterviewPage() {
  const navigate = useNavigate();
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  const [currentQ,    setCurrentQ]    = useState(0);
  const [isRunning,   setIsRunning]   = useState(false);
  const [cameraOn,    setCameraOn]    = useState(false);
  const [permDenied,  setPermDenied]  = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [transcript,  setTranscript]  = useState("");
  const [answered,    setAnswered]    = useState([]);
  const [completed,   setCompleted]   = useState(false);

  // ── Backend state ──────────────────────────────────────────────────────────
  const [interviewId, setInterviewId] = useState(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const token = localStorage.getItem("iq_token");

  // ── Current question from merged list ─────────────────────────────────────
  const q       = ALL_QUESTIONS[currentQ];
  const meta    = typeMeta[q?.type] || typeMeta.Behavioral;
  const progress = Math.round((answered.length / ALL_QUESTIONS.length) * 100);

  // ─── Eye Contact Detection ─────────────────────────────────────────────────
  useEffect(() => {
    if (!cameraOn) return;

    let intervalId;
    let modelsLoaded = false;

    const loadModels = async () => {
      const faceapi = await import('@vladmandic/face-api');
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      console.log("✅ Models loaded successfully");
      modelsLoaded = true;
      return faceapi;
    };

    const detectEyeContact = async (faceapi) => {
      if (!videoRef.current || !modelsLoaded) return;
      if (videoRef.current.readyState < 2) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      let lookingAway = false;

      if (!detection) {
        lookingAway = true;
      } else {
        const landmarks = detection.landmarks;
        const nose      = landmarks.getNose()[3];
        const leftEye   = landmarks.getLeftEye();
        const rightEye  = landmarks.getRightEye();
        const eyeMidX = (
          leftEye.reduce((s, p) => s + p.x, 0) / leftEye.length +
          rightEye.reduce((s, p) => s + p.x, 0) / rightEye.length
        ) / 2;
        const faceWidth = detection.detection.box.width;
        const yawOffset = Math.abs(nose.x - eyeMidX);
        const yawRatio  = yawOffset / faceWidth;
        lookingAway = yawRatio > 0.12;
      }

      if (lookingAway) {
        setShowWarning(true);
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = setTimeout(() => setShowWarning(false), 3000);
      } else {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
        setShowWarning(false);
      }
    };

    loadModels().then((faceapi) => {
      intervalId = setInterval(() => detectEyeContact(faceapi), 1500);
    });

    return () => {
      clearInterval(intervalId);
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    };
  }, [cameraOn]);

  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setCameraOn(true);
      setIsRunning(true);
      setPermDenied(false);
    } catch {
      setPermDenied(true);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setIsRunning(false);
  };

  // ─── Handle Next Question ──────────────────────────────────────────────────
  const handleNext = async () => {
    setIsLoading(true);
    try {
      let currentInterviewId = interviewId;
      if (!interviewId) {
        const startRes = await fetch("http://localhost:5000/api/interviews/start", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ role: "General Interview" }),
        });
        const startData = await startRes.json();
        currentInterviewId = startData.interview.id;
        setInterviewId(currentInterviewId);
        console.log("✅ Interview started:", currentInterviewId);
      }

      await fetch(`http://localhost:5000/api/interviews/${currentInterviewId}/answer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          questionIndex: currentQ,
          questionText:  q.text,
          questionType:  q.type,
          transcript,
          wordCount: transcript.split(/\s+/).filter(Boolean).length,
        }),
      });
      console.log(`✅ Answer saved for Q${currentQ + 1}`);

    } catch (error) {
      console.log("Error saving answer:", error);
    } finally {
      setIsLoading(false);
    }

    if (!answered.includes(currentQ)) setAnswered((a) => [...a, currentQ]);

    if (currentQ < ALL_QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
      setTranscript("");
    } else {
      stopCamera();
      setCompleted(true);
    }
  };

  // ─── Handle Finish ─────────────────────────────────────────────────────────
  const handleFinish = async () => {
    setIsLoading(true);
    try {
      if (interviewId) {
        await fetch(`http://localhost:5000/api/interviews/${interviewId}/complete`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ durationSeconds: 0, eyeContactWarnings: 0 }),
        });
        console.log("✅ Interview completed");

        await fetch(`http://localhost:5000/api/ai/evaluate/${interviewId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ eyeContactScore: 0, facialEngagementScore: 0 }),
        });
        console.log("✅ AI evaluation complete");
      }
    } catch (error) {
      console.log("Error finishing interview:", error);
    } finally {
      setIsLoading(false);
    }

    // Clear resume questions after interview is done
    localStorage.removeItem("iq_resume_questions");
    stopCamera();
    navigate("/results");
  };

  const jumpTo = (i) => {
    if (!answered.includes(currentQ) && transcript.trim()) setAnswered((a) => [...a, currentQ]);
    setCurrentQ(i);
    setTranscript("");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "linear-gradient(135deg,#dce8f5 0%,#eaf1fb 50%,#dce8f5 100%)", fontFamily: "'Open Sans','Segoe UI',sans-serif", color: "#2d2d2d" }}>
      <Sidebar activePage="Interviews" />
      <EyeContactWarning visible={showWarning} onDismiss={() => setShowWarning(false)} />

      <main style={{ marginLeft: "240px", padding: "32px 36px", flex: 1, overflowY: "auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <p style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "5px", fontWeight: 600 }}>Live Session</p>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
              Interview <span style={{ color: "#2f8d46" }}>Session</span>
            </h1>
            {resumeQuestions.length > 0 && (
              <p style={{ fontSize: "11px", color: "#2f8d46", margin: "4px 0 0", fontWeight: 600 }}>
                ✅ {resumeQuestions.length} personalised resume questions added
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <InterviewTimer isRunning={isRunning} />
            <button
              onClick={handleFinish}
              disabled={isLoading}
              style={{ padding: "9px 20px", borderRadius: "6px", background: "transparent", border: "2px solid #e53935", color: "#e53935", fontWeight: 700, fontSize: "13px", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1, transition: "all 0.2s", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
              onMouseOver={(e) => { if (!isLoading) { e.currentTarget.style.background = "#e53935"; e.currentTarget.style.color = "#fff"; }}}
              onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e53935"; }}
            >
              {isLoading ? "Saving..." : "End Interview"}
            </button>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#888", marginBottom: "6px" }}>
            <span>Question {currentQ + 1} of {ALL_QUESTIONS.length}</span>
            <span>{progress}% answered</span>
          </div>
          <div style={{ height: "5px", background: "#e8e8e8", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#2f8d46,#52c278)", borderRadius: "3px", transition: "width 0.5s ease" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

          {/* ── Webcam ── */}
          <div style={{ ...card, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "13px 18px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>📹 Webcam Preview</h3>
              <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "999px", fontWeight: 700, background: cameraOn ? "#eaf7ee" : "#f5f5f5", color: cameraOn ? "#2f8d46" : "#aaa", border: `1px solid ${cameraOn ? "#b7e4c7" : "#e0e0e0"}` }}>
                {cameraOn ? "● LIVE" : "○ OFFLINE"}
              </span>
            </div>
            <div style={{ flex: 1, minHeight: "230px", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: cameraOn ? "block" : "none" }} />
              {!cameraOn && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <div style={{ fontSize: "36px", marginBottom: "10px" }}>📷</div>
                  {permDenied ? (
                    <p style={{ fontWeight: 700, color: "#444", fontSize: "13px", margin: 0 }}>Camera access denied — allow in browser settings and refresh.</p>
                  ) : (
                    <>
                      <p style={{ fontWeight: 700, color: "#444", fontSize: "13px", margin: "0 0 12px" }}>Camera not active</p>
                      <button onClick={startCamera} style={{ padding: "9px 22px", borderRadius: "6px", background: "#2f8d46", color: "#fff", fontWeight: 700, fontSize: "13px", border: "none", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "#257a3c")}
                        onMouseOut={(e)  => (e.currentTarget.style.background = "#2f8d46")}
                      >▶ Start Camera</button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", padding: "12px 14px", borderTop: "1px solid #f0f0f0" }}>
              {[["👁️ Eye Contact","—","#2f8d46"],["😐 Facial Tone","—","#4a90d9"],["🧭 Engagement","—","#f4a426"]].map(([label,val,color]) => (
                <div key={label} style={{ textAlign: "center", padding: "6px", background: "#fafafa", borderRadius: "6px", border: "1px solid #f0f0f0" }}>
                  <p style={{ fontSize: "10px", color: "#aaa", margin: "0 0 2px" }}>{label}</p>
                  <p style={{ fontSize: "14px", fontWeight: 800, color, margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Question Card ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ ...card, padding: "20px", borderLeft: `4px solid ${meta.color}`, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
                <span style={{ padding: "3px 10px", background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: "4px", fontSize: "11px", color: meta.color, fontWeight: 700 }}>Q{currentQ + 1}</span>
                <span style={{ padding: "3px 10px", background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: "4px", fontSize: "11px", color: meta.color, fontWeight: 600 }}>{q?.type}</span>
                {currentQ >= DEFAULT_QUESTIONS.length && (
                  <span style={{ padding: "3px 10px", background: "#eaf7ee", border: "1px solid #b7e4c7", borderRadius: "4px", fontSize: "11px", color: "#2f8d46", fontWeight: 600 }}>📄 From Your Resume</span>
                )}
              </div>
              <p style={{ fontSize: "17px", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.55, margin: "0 0 18px" }}>{q?.text}</p>
              <div style={{ padding: "10px 12px", background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: "6px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ fontSize: "12px" }}>💡</span>
                <p style={{ fontSize: "12px", color: "#666", margin: 0, lineHeight: 1.5 }}><strong style={{ color: "#444" }}>Tip:</strong> {q?.tip}</p>
              </div>
            </div>

            {completed ? (
              <button onClick={handleFinish} disabled={isLoading}
                style={{ padding: "12px", borderRadius: "6px", background: isLoading ? "#aaa" : "#2f8d46", color: "#fff", fontWeight: 700, fontSize: "14px", border: "none", cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
                onMouseOver={(e) => { if (!isLoading) e.currentTarget.style.background = "#257a3c"; }}
                onMouseOut={(e)  => { if (!isLoading) e.currentTarget.style.background = "#2f8d46"; }}
              >
                {isLoading ? "⏳ Evaluating with AI..." : "🏁 View Results →"}
              </button>
            ) : (
              <button onClick={handleNext} disabled={isLoading}
                style={{ padding: "12px", borderRadius: "6px", background: "transparent", border: "2px solid #2f8d46", color: "#2f8d46", fontWeight: 700, fontSize: "14px", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1, fontFamily: "'Open Sans','Segoe UI',sans-serif", transition: "all 0.2s" }}
                onMouseOver={(e) => { if (!isLoading) { e.currentTarget.style.background = "#2f8d46"; e.currentTarget.style.color = "#fff"; }}}
                onMouseOut={(e)  => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2f8d46"; }}
              >
                {isLoading ? "⏳ Saving..." : currentQ === ALL_QUESTIONS.length - 1 ? "Finish & View Results →" : "Next Question →"}
              </button>
            )}

            <button onClick={() => setShowWarning(true)}
              style={{ padding: "9px", borderRadius: "6px", background: "transparent", border: "1px solid #f4a426", color: "#f4a426", fontWeight: 600, fontSize: "12px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#fff8ee")}
              onMouseOut={(e)  => (e.currentTarget.style.background = "transparent")}
            >👁️ Test Eye-Contact Warning</button>
          </div>
        </div>

        {/* ── Live Transcript ── */}
        <div style={{ ...card, padding: "20px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "4px", height: "16px", borderRadius: "2px", background: "#4a90d9", display: "inline-block" }} />
              Live Transcript
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "11px", color: isRunning ? "#e53935" : "#aaa" }}>{isRunning ? "🔴 Transcribing..." : "Paused — start camera to begin"}</span>
              <button onClick={() => setTranscript("")} style={{ background: "none", border: "none", fontSize: "11px", color: "#aaa", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#e53935")}
                onMouseOut={(e)  => (e.currentTarget.style.color = "#aaa")}
              >Clear</button>
            </div>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your speech will be transcribed here in real time once the backend is connected. You can also type your answer manually for testing…"
            style={{ width: "100%", minHeight: "110px", border: "1px solid #e8e8e8", borderRadius: "6px", padding: "12px 14px", fontSize: "13px", color: "#444", background: "#fafafa", resize: "vertical", outline: "none", fontFamily: "'Open Sans','Segoe UI',sans-serif", lineHeight: 1.6, boxSizing: "border-box" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#2f8d46"; e.currentTarget.style.background = "#fff"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.background = "#fafafa"; }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            <span style={{ fontSize: "11px", color: "#aaa" }}>{transcript.split(/\s+/).filter(Boolean).length} words</span>
            <span style={{ fontSize: "11px", color: "#aaa" }}>Placeholder — connect STT backend for live transcription</span>
          </div>
        </div>

        {/* ── Question Navigator ── */}
        <div style={{ ...card, padding: "18px 20px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 12px" }}>Question Navigator</h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {ALL_QUESTIONS.map((qItem, i) => {
              const isCurrent  = i === currentQ;
              const isAnswered = answered.includes(i);
              const isResume   = i >= DEFAULT_QUESTIONS.length;
              return (
                <button key={i} onClick={() => jumpTo(i)} title={qItem.text}
                  style={{
                    width: "36px", height: "36px", borderRadius: "6px",
                    border: `2px solid ${isCurrent ? "#2f8d46" : isAnswered ? "#b7e4c7" : isResume ? "#fde3b0" : "#e8e8e8"}`,
                    background: isCurrent ? "#eaf7ee" : isAnswered ? "#f5fdf8" : isResume ? "#fff8ee" : "#fff",
                    color: isCurrent ? "#2f8d46" : isAnswered ? "#52c278" : isResume ? "#f4a426" : "#aaa",
                    fontWeight: 700, fontSize: "13px", cursor: "pointer", transition: "all 0.15s", fontFamily: "'Open Sans','Segoe UI',sans-serif",
                  }}
                  onMouseOver={(e) => { if (!isCurrent) e.currentTarget.style.borderColor = "#2f8d46"; }}
                  onMouseOut={(e)  => { if (!isCurrent) e.currentTarget.style.borderColor = isAnswered ? "#b7e4c7" : isResume ? "#fde3b0" : "#e8e8e8"; }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: "11px", color: "#aaa", margin: "10px 0 0" }}>
            <span style={{ color: "#2f8d46", fontWeight: 700 }}>Green</span> = current &nbsp;·&nbsp;
            <span style={{ color: "#52c278", fontWeight: 700 }}>Light green</span> = answered &nbsp;·&nbsp;
            <span style={{ color: "#f4a426", fontWeight: 700 }}>Yellow</span> = resume question &nbsp;·&nbsp;
            <span style={{ color: "#aaa" }}>Grey</span> = not visited
          </p>
        </div>

      </main>
    </div>
  );
}