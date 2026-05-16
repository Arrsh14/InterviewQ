import { useState, useEffect, useRef } from "react";

export default function InterviewTimer({ isRunning }) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 18px",
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        fontFamily: "'Open Sans','Segoe UI',sans-serif",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: isRunning ? "#e53935" : "#ccc",
          animation: isRunning ? "pulse 1.2s infinite" : "none",
          flexShrink: 0,
        }}
      />
      <span style={{ fontFamily: "monospace", fontSize: "22px", fontWeight: 800, color: "#1a1a1a", letterSpacing: "0.05em" }}>
        {mm}:{ss}
      </span>
      <span style={{ fontSize: "11px", color: "#aaa", fontWeight: 600 }}>
        {isRunning ? "RECORDING" : "PAUSED"}
      </span>
    </div>
  );
}