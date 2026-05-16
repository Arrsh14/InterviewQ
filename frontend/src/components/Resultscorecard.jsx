const palette = {
    green:  { accent: "#2f8d46", bg: "#eaf7ee", border: "#b7e4c7" },
    blue:   { accent: "#4a90d9", bg: "#eaf2fb", border: "#b3d4f5" },
    purple: { accent: "#7b5ea7", bg: "#f3eeff", border: "#d8c5f7" },
    orange: { accent: "#f4a426", bg: "#fff8ee", border: "#fde3b0" },
  };
  
  export default function ResultScoreCard({ label, value, unit, icon, color = "green", description }) {
    const p = palette[color] || palette.green;
    const pct = isNaN(Number(value)) ? 0 : Math.min(Number(value), 100);
  
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e8e8",
          borderTop: `3px solid ${p.accent}`,
          borderRadius: "8px",
          padding: "20px 18px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          fontFamily: "'Open Sans','Segoe UI',sans-serif",
          transition: "box-shadow 0.2s, transform 0.2s",
          cursor: "default",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <p style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, margin: 0 }}>
            {label}
          </p>
          <span style={{
            fontSize: "18px", width: "34px", height: "34px", borderRadius: "8px",
            background: p.bg, border: `1px solid ${p.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {icon}
          </span>
        </div>
  
        <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "10px" }}>
          <span style={{ fontSize: "40px", fontWeight: 900, color: p.accent, lineHeight: 1 }}>{value}</span>
          <span style={{ fontSize: "14px", color: "#aaa", marginBottom: "6px" }}>{unit}</span>
        </div>
  
        <div style={{ height: "5px", background: "#f0f0f0", borderRadius: "3px", overflow: "hidden", marginBottom: "10px" }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${p.accent}, ${p.accent}99)`,
            borderRadius: "3px",
            transition: "width 1s ease",
          }} />
        </div>
  
        <p style={{ fontSize: "11px", color: "#aaa", margin: 0, lineHeight: 1.5 }}>{description}</p>
      </div>
    );
  }