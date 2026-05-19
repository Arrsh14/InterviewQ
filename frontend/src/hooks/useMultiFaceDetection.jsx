// ── useMultiFaceDetection.js ──────────────────────────────────────────────────
// Drop this file in: frontend/src/hooks/useMultiFaceDetection.js
//
// Usage in InterviewPage.jsx:
//   import useMultiFaceDetection from "../hooks/useMultiFaceDetection";
//   const { multiFaceWarning, multiFaceCount } = useMultiFaceDetection(videoRef, cameraOn);
//   Then render: <MultiFaceWarning visible={multiFaceWarning} count={multiFaceCount} />

import { useState, useEffect, useRef } from "react";

export default function useMultiFaceDetection(videoRef, cameraOn) {
  const [multiFaceWarning, setMultiFaceWarning] = useState(false);
  const [multiFaceCount,   setMultiFaceCount]   = useState(0);
  const intervalRef = useRef(null);
  const warningRef  = useRef(null);

  useEffect(() => {
    if (!cameraOn) return;

    let faceapi = null;

    const load = async () => {
      faceapi       = await import("@vladmandic/face-api");
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      ]);

      // Check every 2 seconds
      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const detections = await faceapi.detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          );

          const count = detections.length;

          if (count > 1) {
            setMultiFaceCount(count);
            setMultiFaceWarning(true);

            // Log warning to localStorage
            const prev = parseInt(localStorage.getItem("iq_multi_face_warnings") || "0");
            localStorage.setItem("iq_multi_face_warnings", String(prev + 1));

            // Auto-hide after 5 seconds
            clearTimeout(warningRef.current);
            warningRef.current = setTimeout(() => setMultiFaceWarning(false), 5000);
          } else {
            setMultiFaceCount(count);
          }
        } catch (_) {}
      }, 2000);
    };

    load().catch(() => {});

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(warningRef.current);
    };
  }, [cameraOn]);

  return { multiFaceWarning, multiFaceCount };
}


// ── MultiFaceWarning component ────────────────────────────────────────────────
// Add this to your InterviewPage.jsx render output (alongside EyeContactWarning)

export function MultiFaceWarning({ visible, count }) {
  if (!visible) return null;

  return (
    <div style={{
      position:     "fixed",
      top:          "80px",
      left:         "50%",
      transform:    "translateX(-50%)",
      zIndex:       9999,
      background:   "#fff0f0",
      border:       "2px solid #e53935",
      borderRadius: "12px",
      padding:      "16px 28px",
      boxShadow:    "0 8px 32px rgba(229,57,53,0.25)",
      display:      "flex",
      alignItems:   "center",
      gap:          "14px",
      fontFamily:   "'Open Sans','Segoe UI',sans-serif",
      animation:    "slideDown 0.3s ease",
      minWidth:     "360px",
    }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <span style={{ fontSize: "28px" }}>🚨</span>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 800, color: "#e53935", margin: "0 0 2px" }}>
          MULTIPLE FACES DETECTED
        </p>
        <p style={{ fontSize: "12px", color: "#c62828", margin: 0 }}>
          {count} faces in frame — only the candidate should be visible. This has been logged.
        </p>
      </div>
    </div>
  );
}