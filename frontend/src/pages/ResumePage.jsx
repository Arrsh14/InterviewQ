import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function ResumePage() {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);
  const token     = localStorage.getItem("iq_token");
  const userName  = localStorage.getItem("iq_user_name") || "there";

  const [file,       setFile]       = useState(null);
  const [dragging,   setDragging]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  // ── Handle file selection ─────────────────────────────────────────────────
  const handleFile = (selected) => {
    setError(null);
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    if (selected.size > 4 * 1024 * 1024) {
      setError("File size must be under 4MB.");
      return;
    }
    setFile(selected);
  };

  const onFileChange  = (e) => handleFile(e.target.files[0]);
  const onDrop        = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };
  const onDragOver    = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave   = () => setDragging(false);

  // ── Upload and generate questions ─────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) { setError("Please select a PDF file first."); return; }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res  = await fetch("http://localhost:5000/api/resume/upload", {
        method:  "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body:    formData,
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Upload failed. Please try again.");
        return;
      }

      // Save resume questions to localStorage so InterviewPage can use them
      localStorage.setItem("iq_resume_questions", JSON.stringify(data.questions));

      // Navigate to interview
      navigate("/pre-interview");

    } catch (err) {
      setError("Could not connect to server. Make sure your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060810",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "'Open Sans','Segoe UI',sans-serif",
    }}>
      {/* Background glow */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "rgba(6,182,212,0.08)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "480px", position: "relative" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: "28px", fontWeight: 900, color: "#fff" }}>
              Interview<span style={{ color: "#06b6d4" }}>Q</span>
            </span>
          </button>
          <p style={{ color: "#64748b", fontSize: "12px", marginTop: "4px", fontFamily: "monospace" }}>
            Multimodal AI Evaluation Framework
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "#0d1117",
          border: "1px solid #21262d",
          borderRadius: "16px",
          padding: "32px",
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📄</div>
            <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>
              Upload Your Resume
            </h1>
            <p style={{ fontSize: "13px", color: "#8b949e", margin: 0, lineHeight: 1.6 }}>
              Hey <strong style={{ color: "#06b6d4" }}>{userName}</strong>! Upload your resume so our AI can generate personalized interview questions just for you.
            </p>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
            {[
              { num: "1", label: "Account Created", done: true },
              { num: "2", label: "Upload Resume",   done: false, active: true },
              { num: "3", label: "Start Interview", done: false },
            ].map((s) => (
              <div key={s.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1 }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: s.done ? "#0d4429" : s.active ? "rgba(6,182,212,0.15)" : "#161b22",
                  border: `2px solid ${s.done ? "#3fb950" : s.active ? "#06b6d4" : "#21262d"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 700,
                  color: s.done ? "#3fb950" : s.active ? "#06b6d4" : "#484f58",
                }}>
                  {s.done ? "✓" : s.num}
                </div>
                <span style={{ fontSize: "10px", color: s.done ? "#3fb950" : s.active ? "#06b6d4" : "#484f58", fontWeight: 600, textAlign: "center" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            style={{
              border: `2px dashed ${dragging ? "#06b6d4" : file ? "#3fb950" : "#21262d"}`,
              borderRadius: "12px",
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: dragging ? "rgba(6,182,212,0.05)" : file ? "rgba(63,185,80,0.05)" : "#161b22",
              transition: "all 0.2s",
              marginBottom: "16px",
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              onChange={onFileChange}
              style={{ display: "none" }}
            />

            {file ? (
              <>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#3fb950", margin: "0 0 4px" }}>
                  {file.name}
                </p>
                <p style={{ fontSize: "12px", color: "#8b949e", margin: 0 }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>📁</div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "#c9d1d9", margin: "0 0 4px" }}>
                  {dragging ? "Drop your PDF here!" : "Drag & drop your resume"}
                </p>
                <p style={{ fontSize: "12px", color: "#484f58", margin: "0 0 12px" }}>
                  or click to browse files
                </p>
                <span style={{
                  padding: "4px 12px",
                  background: "#21262d",
                  border: "1px solid #30363d",
                  borderRadius: "999px",
                  fontSize: "11px",
                  color: "#8b949e",
                }}>
                  PDF only · Max 4MB
                </span>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 14px",
              background: "#ff000015",
              border: "1px solid #f8514950",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "13px",
              color: "#f85149",
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            style={{
              width: "100%",
              padding: "14px",
              background: loading || !file
                ? "#21262d"
                : "linear-gradient(135deg, #06b6d4, #6366f1)",
              border: "none",
              borderRadius: "10px",
              color: loading || !file ? "#484f58" : "#fff",
              fontWeight: 800,
              fontSize: "15px",
              cursor: loading || !file ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              marginBottom: "12px",
            }}
          >
            {loading ? "⏳ Analysing Resume & Generating Questions..." : "🚀 Upload & Start Interview"}
          </button>

          {/* Info note */}
          <p style={{ fontSize: "11px", color: "#484f58", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
            🔒 Your resume is processed securely and never stored permanently.<br />
            AI will generate 3 personalised questions based on your experience.
          </p>
        </div>
      </div>
    </div>
  );
}