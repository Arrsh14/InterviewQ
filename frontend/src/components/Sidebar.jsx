import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Each item knows its own route
const navItems = [
  { icon: "⊞",  label: "Dashboard",     route: "/dashboard"  },
  { icon: "🎙",  label: "Interviews",    route: "/pre-interview"  },
  { icon: "📊",  label: "Analytics",     route: "/dashboard"  },
  { icon: "📋",  label: "Results",       route: "/results"    },
  { icon: "🎯",  label: "Question Bank", route: "/dashboard"  },
  { icon: "⚙️",  label: "Settings",      route: "/settings"   },  // ← only this changed
];

// activePage: "Dashboard" | "Interviews" | "Results"  (defaults to "Dashboard")
export default function Sidebar({ activePage = "Dashboard" }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const stored = localStorage.getItem("iq_user_name");
    if (stored) setUserName(stored);
  }, []);

  const avatar = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("iq_user_name");
    localStorage.removeItem("iq_user_email");
    navigate("/");
  };

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100%",
        width: "240px",
        background: "#fff",
        borderRight: "1px solid #e8e8e8",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        fontFamily: "'Open Sans','Segoe UI',sans-serif",
        boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* ── Logo ── */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f0f0f0" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <span style={{ fontSize: "20px", fontWeight: 800, color: "#1a1a1a" }}>
            Interview<span style={{ color: "#2f8d46" }}>Q</span>
          </span>
        </button>
        <p style={{ fontSize: "11px", color: "#aaa", marginTop: "3px", margin: "3px 0 0" }}>
          AI Evaluation Framework
        </p>
      </div>

      {/* ── Nav items ── */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems.map((item) => {
          const isActive = item.label === activePage;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: isActive ? 700 : 500,
                background: isActive ? "#eaf7ee" : "transparent",
                color: isActive ? "#2f8d46" : "#555",
                textAlign: "left",
                width: "100%",
                transition: "background 0.15s, color 0.15s",
                fontFamily: "'Open Sans','Segoe UI',sans-serif",
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#f5f5f5";
                  e.currentTarget.style.color = "#1a1a1a";
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#555";
                }
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ── User footer ── */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "linear-gradient(135deg,#2f8d46,#4a90d9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: 800, color: "#fff", flexShrink: 0,
            }}
          >
            {avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>{userName}</p>
            <p style={{ fontSize: "11px", color: "#aaa", margin: 0 }}>Free Plan</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "16px", color: "#bbb", padding: 0, transition: "color 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#555")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#bbb")}
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}