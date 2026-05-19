import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ── Design tokens (matches your existing InterviewPage style) ─────────────────
const C = {
  bg:          "linear-gradient(135deg,#dce8f5 0%,#eaf1fb 50%,#dce8f5 100%)",
  card:        "#fff",
  border:      "#e8e8e8",
  green:       "#2f8d46",
  greenLight:  "#eaf7ee",
  greenBorder: "#b7e4c7",
  red:         "#e53935",
  redLight:    "#fff0f0",
  redBorder:   "#ffb3b3",
  amber:       "#f4a426",
  amberLight:  "#fff8ee",
  amberBorder: "#fde3b0",
  blue:        "#4a90d9",
  text:        "#1a1a1a",
  textSub:     "#666",
  textMuted:   "#aaa",
};

const card = {
  background:   C.card,
  border:       `1px solid ${C.border}`,
  borderRadius: "12px",
  boxShadow:    "0 4px 20px rgba(0,0,0,0.08)",
  fontFamily:   "'Open Sans','Segoe UI',sans-serif",
};

// ── Status steps ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: "camera",    label: "Camera access",        icon: "📷" },
  { id: "faceapi",   label: "Loading face detector", icon: "🧠" },
  { id: "detect",    label: "Detecting your face",   icon: "👤" },
  { id: "register",  label: "Registering face",      icon: "✅" },
];

export default function PreInterviewSetup() {
  const navigate   = useNavigate();
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const faceapiRef = useRef(null);
  const intervalRef = useRef(null);

  const [stepStatus,    setStepStatus]    = useState({ camera: "pending", faceapi: "pending", detect: "pending", register: "pending" });
  const [error,         setError]         = useState("");
  const [countdown,     setCountdown]     = useState(null);
  const [faceDetected,  setFaceDetected]  = useState(false);
  const [faceCount,     setFaceCount]     = useState(0);
  const [registered,    setRegistered]    = useState(false);
  const [readyToStart,  setReadyToStart]  = useState(false);

  const setStep = (id, status) =>
    setStepStatus((prev) => ({ ...prev, [id]: status }));

  // ── 1. Start camera ───────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      setStep("camera", "loading");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStep("camera", "done");
      loadFaceAPI();
    } catch (err) {
      setStep("camera", "error");
      setError("Camera access denied. Please allow camera access and refresh.");
    }
  }, []);

  // ── 2. Load face-api models ───────────────────────────────────────────────
  const loadFaceAPI = async () => {
    try {
      setStep("faceapi", "loading");
      const faceapi   = await import("@vladmandic/face-api");
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      faceapiRef.current = faceapi;
      setStep("faceapi", "done");
      startDetecting(faceapi);
    } catch (err) {
      setStep("faceapi", "error");
      setError("Failed to load face detection models. Please refresh.");
    }
  };

  // ── 3. Detect faces continuously ─────────────────────────────────────────
  const startDetecting = (faceapi) => {
    setStep("detect", "loading");
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        const count = detections.length;
        setFaceCount(count);

        if (count === 1) {
          setFaceDetected(true);
          setStep("detect", "done");
        } else if (count === 0) {
          setFaceDetected(false);
          setStep("detect", "loading");
        } else {
          setFaceDetected(false);
          setStep("detect", "error");
        }
      } catch (_) {}
    }, 800);
  };

  // ── 4. Register face ──────────────────────────────────────────────────────
  const registerFace = () => {
    if (!faceDetected || faceCount !== 1) return;

    setStep("register", "loading");

    // Take a snapshot and store as reference in localStorage
    const canvas  = document.createElement("canvas");
    canvas.width  = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const snapshot = canvas.toDataURL("image/jpeg", 0.8);
    localStorage.setItem("iq_reference_face", snapshot);
    localStorage.setItem("iq_multi_face_warnings", "0");

    setStep("register", "done");
    setRegistered(true);

    // Stop detection interval
    clearInterval(intervalRef.current);

    // Start countdown
    let count = 3;
    setCountdown(count);
    const timer = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(timer);
        setCountdown(null);
        setReadyToStart(true);
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    startCamera();
    return () => {
      clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Auto-navigate when ready ──────────────────────────────────────────────
  useEffect(() => {
    if (readyToStart) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      navigate("/interview");
    }
  }, [readyToStart]);

  // ── Step status icon ──────────────────────────────────────────────────────
  const StatusIcon = ({ status }) => {
    if (status === "done")    return <span style={{ color: C.green,   fontSize: "16px" }}>✓</span>;
    if (status === "error")   return <span style={{ color: C.red,     fontSize: "16px" }}>✗</span>;
    if (status === "loading") return <span style={{ color: C.blue,    fontSize: "16px", animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>;
    return                           <span style={{ color: C.textMuted, fontSize: "16px" }}>○</span>;
  };

  // ── Face status message ───────────────────────────────────────────────────
  const faceMessage = () => {
    if (registered)      return { text: "✅ Face registered successfully!",       bg: C.greenLight,  border: C.greenBorder,  color: C.green };
    if (faceCount > 1)   return { text: "⚠️ Multiple faces detected — only you should be in frame", bg: C.amberLight, border: C.amberBorder, color: C.amber };
    if (faceCount === 1) return { text: "✅ Face detected — click Register to continue",            bg: C.greenLight,  border: C.greenBorder,  color: C.green };
    return                      { text: "👤 Position your face in the camera",                      bg: C.redLight,    border: C.redBorder,    color: C.red };
  };

  const msg = faceMessage();

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: "'Open Sans','Segoe UI',sans-serif", padding: "32px" }}>

      {/* Spin animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>

      <div style={{ width: "100%", maxWidth: "860px" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <p style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px", fontWeight: 600 }}>
            Pre-Interview Setup
          </p>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: C.text, margin: "0 0 8px" }}>
            Let's verify your <span style={{ color: C.green }}>identity</span>
          </h1>
          <p style={{ fontSize: "14px", color: C.textSub, margin: 0 }}>
            We'll register your face to ensure interview integrity. This takes less than 30 seconds.
          </p>
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>

          {/* LEFT — Camera preview ── */}
          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: C.text, margin: 0 }}>📷 Camera Preview</h3>
              <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "999px", fontWeight: 700, background: faceCount === 1 ? C.greenLight : C.redLight, color: faceCount === 1 ? C.green : C.red, border: `1px solid ${faceCount === 1 ? C.greenBorder : C.redBorder}` }}>
                {faceCount === 0 ? "○ No face" : faceCount === 1 ? "● Face detected" : `⚠️ ${faceCount} faces`}
              </span>
            </div>

            {/* Video */}
            <div style={{ position: "relative", background: "#111", minHeight: "280px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", maxHeight: "320px", objectFit: "cover", display: "block" }} />

              {/* Face outline overlay */}
              {!registered && (
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "160px", height: "200px", border: `3px solid ${faceCount === 1 ? C.green : "rgba(255,255,255,0.3)"}`, borderRadius: "50%", pointerEvents: "none", transition: "border-color 0.3s" }} />
              )}

              {/* Countdown overlay */}
              {countdown !== null && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "72px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{countdown}</div>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", margin: "8px 0 0" }}>Starting interview...</p>
                  </div>
                </div>
              )}

              {/* Registered overlay */}
              {registered && countdown === null && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(47,141,70,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "48px" }}>✅</div>
                    <p style={{ color: C.green, fontWeight: 700, fontSize: "14px", margin: "8px 0 0" }}>Face Registered!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Face status bar */}
            <div style={{ padding: "12px 14px", background: msg.bg, borderTop: `1px solid ${msg.border}` }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: msg.color, margin: 0 }}>{msg.text}</p>
            </div>
          </div>

          {/* RIGHT — Steps + actions ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Setup steps */}
            <div style={{ ...card, padding: "20px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: C.text, margin: "0 0 16px" }}>Setup Progress</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {STEPS.map((step) => {
                  const status = stepStatus[step.id];
                  return (
                    <div key={step.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", background: status === "done" ? C.greenLight : status === "error" ? C.redLight : status === "loading" ? "#f0f6ff" : "#fafafa", border: `1px solid ${status === "done" ? C.greenBorder : status === "error" ? C.redBorder : status === "loading" ? "#cce0ff" : C.border}`, transition: "all 0.3s" }}>
                      <span style={{ fontSize: "18px" }}>{step.icon}</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: status === "done" ? C.green : status === "error" ? C.red : status === "loading" ? C.blue : C.textMuted, flex: 1 }}>{step.label}</span>
                      <StatusIcon status={status} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What this does */}
            <div style={{ ...card, padding: "16px 18px" }}>
              <h3 style={{ fontSize: "12px", fontWeight: 700, color: C.text, margin: "0 0 10px" }}>🔒 Why we do this</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  ["👤", "Registers your face as the candidate"],
                  ["🚨", "Warns if another person enters the frame"],
                  ["📊", "Logs integrity incidents in your report"],
                  ["🔐", "Snapshot stored locally — never uploaded"],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px" }}>{icon}</span>
                    <span style={{ fontSize: "12px", color: C.textSub }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Register button */}
            <button
              onClick={registerFace}
              disabled={!faceDetected || faceCount !== 1 || registered}
              style={{
                padding: "14px",
                borderRadius: "8px",
                background: (!faceDetected || faceCount !== 1 || registered) ? "#e8e8e8" : C.green,
                color: (!faceDetected || faceCount !== 1 || registered) ? C.textMuted : "#fff",
                fontWeight: 700,
                fontSize: "15px",
                border: "none",
                cursor: (!faceDetected || faceCount !== 1 || registered) ? "not-allowed" : "pointer",
                fontFamily: "'Open Sans','Segoe UI',sans-serif",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => { if (faceDetected && faceCount === 1 && !registered) e.currentTarget.style.background = "#257a3c"; }}
              onMouseOut={(e)  => { if (faceDetected && faceCount === 1 && !registered) e.currentTarget.style.background = C.green; }}
            >
              {registered ? "✅ Registered — Starting..." : faceCount === 0 ? "👤 Waiting for face..." : faceCount > 1 ? "⚠️ Only one face allowed" : "📸 Register My Face"}
            </button>

            {/* Skip option */}
            {!registered && (
              <button
                onClick={() => navigate("/interview")}
                style={{ padding: "10px", borderRadius: "8px", background: "transparent", border: `1px solid ${C.border}`, color: C.textMuted, fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = C.textMuted; e.currentTarget.style.color = C.text; }}
                onMouseOut={(e)  => { e.currentTarget.style.borderColor = C.border;    e.currentTarget.style.color = C.textMuted; }}
              >
                Skip setup → Go to interview
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}