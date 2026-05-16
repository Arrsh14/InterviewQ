function scoreColor(s) {
  if (s >= 80) return { color: "#2f8d46", background: "#eaf7ee", border: "1px solid #b7e4c7" };
  if (s >= 70) return { color: "#4a90d9", background: "#eaf2fb", border: "1px solid #b3d4f5" };
  return       { color: "#f4a426", background: "#fff8ee", border: "1px solid #fde3b0" };
}

export default function AttemptRow({ attempt }) {
  const badge = scoreColor(attempt.score);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 16px",
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        fontFamily: "'Open Sans','Segoe UI',sans-serif",
      }}
      onMouseOver={(e) => (e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.1)")}
      onMouseOut={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)")}
    >
      {/* Score badge */}
      <div
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: 800,
          flexShrink: 0,
          ...badge,
        }}
      >
        {attempt.score}
      </div>

      {/* Role + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {attempt.role}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          <span style={{ fontSize: "11px", color: "#888" }}>{attempt.date}</span>
          <span style={{ color: "#ccc" }}>·</span>
          <span style={{ fontSize: "11px", color: "#888" }}>⏱ {attempt.duration}</span>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        {attempt.tags.map((t) => (
          <span
            key={t}
            style={{
              padding: "3px 10px",
              background: "#f5f5f5",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              fontSize: "11px",
              color: "#555",
              fontFamily: "monospace",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Explore button — matches GFG style exactly */}
      <button
        style={{
          padding: "7px 18px",
          borderRadius: "5px",
          background: "transparent",
          border: "1.5px solid #2f8d46",
          color: "#2f8d46",
          fontWeight: 700,
          fontSize: "13px",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.2s",
          fontFamily: "'Open Sans','Segoe UI',sans-serif",
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = "#2f8d46"; e.currentTarget.style.color = "#fff"; }}
        onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2f8d46"; }}
      >
        Explore
      </button>
    </div>
  );
}