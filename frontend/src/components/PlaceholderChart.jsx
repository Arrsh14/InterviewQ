// PlaceholderChart.jsx
// Props: title, type ("bar"|"line"|"donut"), height, color, note

const palette = {
    green:  "#2f8d46",
    blue:   "#4a90d9",
    purple: "#7b5ea7",
    orange: "#f4a426",
  };
  
  // ── Bar chart ghost ───────────────────────────────────────────────────────────
  function BarGhost({ color, height = 180 }) {
    const bars = [45, 62, 38, 71, 55, 80, 48, 65, 42, 70];
    const c    = palette[color] || palette.green;
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: `${height}px`, padding: "0 4px" }}>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              borderRadius: "4px 4px 0 0",
              background: `${c}22`,
              border: `1px solid ${c}44`,
              height: `${h}%`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* shimmer stripe */}
            <div style={{
              position: "absolute", inset: 0,
              background: `repeating-linear-gradient(90deg, transparent 0, transparent 8px, ${c}11 8px, ${c}11 9px)`,
            }} />
          </div>
        ))}
      </div>
    );
  }
  
  // ── Line chart ghost ──────────────────────────────────────────────────────────
  function LineGhost({ color, height = 180 }) {
    const pts = [55, 45, 62, 50, 75, 60, 80, 65, 72, 85];
    const c   = palette[color] || palette.blue;
    const w   = 400; const h = height;
  
    const coords = pts.map((p, i) => ({
      x: (i / (pts.length - 1)) * w,
      y: h - (p / 100) * h,
    }));
  
    const polyline  = coords.map((c) => `${c.x},${c.y}`).join(" ");
    const areaClose = `${coords[coords.length - 1].x},${h} ${coords[0].x},${h}`;
  
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: `${height}px` }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`lg-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity="0.18" />
            <stop offset="100%" stopColor={c} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={`${polyline} ${areaClose}`} fill={`url(#lg-${color})`} />
        <polyline points={polyline} fill="none" stroke={`${c}66`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 3" />
        {coords.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#fff" stroke={`${c}99`} strokeWidth="2" />
        ))}
      </svg>
    );
  }
  
  // ── Donut ghost ───────────────────────────────────────────────────────────────
  function DonutGhost({ color, height = 180 }) {
    const segments = [
      { pct: 35, color: palette.green },
      { pct: 25, color: palette.blue },
      { pct: 20, color: palette.purple },
      { pct: 20, color: palette.orange },
    ];
    const cx = 90; const cy = 90; const r = 70; const stroke = 22;
    const circ = 2 * Math.PI * r;
    let offset = 0;
  
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "20px", height: `${height}px`, padding: "10px 0" }}>
        <svg viewBox="0 0 180 180" style={{ width: `${height - 20}px`, height: `${height - 20}px`, flexShrink: 0 }}>
          {segments.map((seg, i) => {
            const dashLen = (seg.pct / 100) * circ;
            const el = (
              <circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={`${seg.color}55`}
                strokeWidth={stroke}
                strokeDasharray={`${dashLen} ${circ - dashLen}`}
                strokeDashoffset={-offset}
                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            );
            offset += dashLen;
            return el;
          })}
          <text x={cx} y={cy - 6}  textAnchor="middle" fontSize="20" fontWeight="800" fill="#ccc">0</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#aaa">/100</text>
        </svg>
  
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[["Content",    palette.green],
            ["Delivery",   palette.blue],
            ["Attention",  palette.purple],
            ["Composure",  palette.orange]].map(([label, c]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: `${c}55`, border: `1px solid ${c}99`, flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "#aaa" }}>{label}</span>
              <span style={{ fontSize: "11px", color: "#ccc", marginLeft: "auto", fontWeight: 700 }}>—</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // ── Main export ───────────────────────────────────────────────────────────────
  export default function PlaceholderChart({ title, type = "bar", height = 180, color = "green", note }) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e8e8",
          borderRadius: "8px",
          padding: "18px 20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          fontFamily: "'Open Sans','Segoe UI',sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "4px", height: "16px", borderRadius: "2px", background: palette[color] || "#2f8d46", display: "inline-block" }} />
            {title}
          </h3>
          <span style={{
            fontSize: "10px", padding: "3px 8px", borderRadius: "4px",
            background: "#f5f5f5", border: "1px solid #e8e8e8", color: "#bbb",
            fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Placeholder
          </span>
        </div>
  
        {/* Ghost chart */}
        {type === "bar"   && <BarGhost   color={color} height={height} />}
        {type === "line"  && <LineGhost  color={color} height={height} />}
        {type === "donut" && <DonutGhost color={color} height={height} />}
  
        {/* X-axis labels for bar/line */}
        {(type === "bar" || type === "line") && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", padding: "0 4px" }}>
            {["Q1","Q2","Q3","Q4","Q5"].map((l) => (
              <span key={l} style={{ fontSize: "10px", color: "#ccc", fontFamily: "monospace" }}>{l}</span>
            ))}
          </div>
        )}
  
        {/* Note */}
        {note && (
          <p style={{ fontSize: "11px", color: "#aaa", margin: "10px 0 0", textAlign: "center" }}>{note}</p>
        )}
      </div>
    );
  }