export default function EyeContactWarning({ visible, onDismiss }) {
    if (!visible) return null;
  
    return (
      <div
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          background: "#fff3cd",
          border: "2px solid #f4a426",
          borderRadius: "10px",
          padding: "16px 20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          maxWidth: "320px",
          fontFamily: "'Open Sans','Segoe UI',sans-serif",
          animation: "slideIn 0.3s ease",
        }}
      >
        <span style={{ fontSize: "28px", flexShrink: 0 }}>👁️</span>
  
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: "14px", color: "#b45309" }}>
            Maintain Eye Contact
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#92400e" }}>
            Please look at the camera during your interview.
          </p>
        </div>
  
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "#b45309",
            padding: "0 4px",
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
  
        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(40px); }
            to   { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    );
  }