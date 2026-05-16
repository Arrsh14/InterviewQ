const accentColor = {
  green:  "#2f8d46",
  blue:   "#4a90d9",
  purple: "#7b5ea7",
  orange: "#f4a426",
};

export default function ScoreCard({ label, value, unit, delta, color }) {
  const accent = accentColor[color] || "#2f8d46";

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
        padding: "18px 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        cursor: "default",
        transition: "box-shadow 0.2s, border-color 0.2s",
        borderTop: `3px solid ${accent}`,
        fontFamily: "'Open Sans','Segoe UI',sans-serif",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
        e.currentTarget.style.borderColor = accent;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
        e.currentTarget.style.borderColor = "#e8e8e8";
        e.currentTarget.style.borderTopColor = accent;
      }}
    >
      <p style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", fontWeight: 600 }}>
        {label}
      </p>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", marginBottom: "8px" }}>
        <span style={{ fontSize: "36px", fontWeight: 800, color: accent, lineHeight: 1 }}>
          {value}
        </span>
        <span style={{ fontSize: "13px", color: "#aaa", marginBottom: "4px" }}>{unit}</span>
      </div>

      <p style={{ fontSize: "11px", color: "#888", display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{ color: accent }}>↗</span>
        {delta}
      </p>
    </div>
  );
}