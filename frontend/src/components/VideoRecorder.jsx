import { useEffect, useRef, useState } from "react";

export default function VideoRecorder({ isRecording: initialRecording = false }) {
  const videoRef     = useRef(null);
  const streamRef    = useRef(null);
  const timerRef     = useRef(null);
  const [isRecording, setIsRecording]       = useState(initialRecording);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [elapsed, setElapsed]               = useState(0);

  const liveMetrics = [
    { label: "Eye Contact",  color: "#2f8d46"  },
    { label: "Facial Tone",  color: "#4a90d9"  },
    { label: "Head Pose",    color: "#7b5ea7"  },
    { label: "Engagement",   color: "#f4a426"  },
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setIsRecording(true);
      setPermissionDenied(false);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      setPermissionDenied(true);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    clearInterval(timerRef.current);
    setIsRecording(false);
    setElapsed(0);
  };

  useEffect(() => () => stopCamera(), []);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", gap: "16px", fontFamily: "'Open Sans','Segoe UI',sans-serif" }}>

      {/* Camera viewport */}
      <div
        style={{
          flex: 1,
          borderRadius: "8px",
          overflow: "hidden",
          background: "#f5f5f5",
          border: "1px solid #e0e0e0",
          minHeight: "220px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {isRecording ? (
          <>
            <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {/* REC indicator */}
            <div
              style={{
                position: "absolute", top: "10px", left: "10px",
                display: "flex", alignItems: "center", gap: "6px",
                padding: "4px 10px", borderRadius: "999px",
                background: "rgba(0,0,0,0.5)",
              }}
            >
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#e53935", animation: "pulse 1.2s infinite" }} />
              <span style={{ color: "#fff", fontSize: "11px", fontWeight: 700, fontFamily: "monospace" }}>{fmt(elapsed)}</span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "24px" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📹</div>
            {permissionDenied ? (
              <>
                <p style={{ fontWeight: 700, color: "#444", fontSize: "13px" }}>Camera access denied</p>
                <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>Allow camera access in browser settings and try again.</p>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 700, color: "#444", fontSize: "13px" }}>Camera not active</p>
                <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
                  Click <strong style={{ color: "#2f8d46" }}>Start Monitoring</strong> to enable live facial analysis.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Controls panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "200px" }}>

        {/* Start / Stop */}
        {isRecording ? (
          <button
            onClick={stopCamera}
            style={{
              padding: "9px 0", borderRadius: "6px",
              background: "transparent", border: "2px solid #e53935",
              color: "#e53935", fontWeight: 700, fontSize: "13px",
              cursor: "pointer", transition: "all 0.2s",
              fontFamily: "'Open Sans','Segoe UI',sans-serif",
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#e53935"; e.currentTarget.style.color = "#fff"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e53935"; }}
          >
            ■ Stop Monitoring
          </button>
        ) : (
          <button
            onClick={startCamera}
            style={{
              padding: "9px 0", borderRadius: "6px",
              background: "#2f8d46", border: "none",
              color: "#fff", fontWeight: 700, fontSize: "13px",
              cursor: "pointer", transition: "background 0.2s",
              fontFamily: "'Open Sans','Segoe UI',sans-serif",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#257a3c")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#2f8d46")}
          >
            ▶ Start Monitoring
          </button>
        )}

        {/* Live metric cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {liveMetrics.map((m) => (
            <div
              key={m.label}
              style={{
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: "6px",
                padding: "8px 10px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <p style={{ fontSize: "10px", color: "#aaa", margin: "0 0 3px" }}>{m.label}</p>
              <p style={{ fontSize: "16px", fontWeight: 800, color: m.color, margin: 0 }}>
                {isRecording ? "—" : "—"}
              </p>
            </div>
          ))}
        </div>

        {/* Status pill */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "7px 12px", borderRadius: "6px",
            border: `1px solid ${isRecording ? "#b7e4c7" : "#e8e8e8"}`,
            background: isRecording ? "#eaf7ee" : "#f9f9f9",
            fontSize: "11px", fontWeight: 700,
            color: isRecording ? "#2f8d46" : "#aaa",
          }}
        >
          <span
            style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: isRecording ? "#2f8d46" : "#ccc",
              flexShrink: 0,
            }}
          />
          {isRecording ? "AI Analysis Active" : "Monitoring Idle"}
        </div>
      </div>
    </div>
  );
}