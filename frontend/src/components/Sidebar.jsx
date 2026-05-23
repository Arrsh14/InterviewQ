import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { icon: "⊞",  label: "Dashboard",        route: "/dashboard"     },
  { icon: "🎙",  label: "Interviews",       route: "/pre-interview" },
  { icon: "📊",  label: "Analytics",        route: "/dashboard"     },
  { icon: "📋",  label: "Results",          route: "/results"       },
  { icon: "🔬",  label: "Project Analysis", route: "/progress"      },
  { icon: "🎯",  label: "Question Bank",    route: "/dashboard"     },
  { icon: "⚙️",  label: "Settings",         route: "/settings"      },
];

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
    <>
      <style>{`
        .sq-nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          text-align: left;
          width: 100%;
          transition: background 0.15s, color 0.15s;
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.01em;
          color: rgba(255,255,255,0.4);
          background: transparent;
        }
        .sq-nav-btn:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
        }
        .sq-nav-btn.active {
          background: rgba(120,60,255,0.18);
          color: #fff;
          font-weight: 600;
        }
        .sq-nav-btn.active .sq-icon {
          filter: none;
        }
        .sq-logout:hover { color: rgba(255,255,255,0.7) !important; }
      `}</style>

      <aside style={{
        position: "fixed",
        top: 0, left: 0,
        height: "100%",
        width: "220px",
        background: "#0e0b1f",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        fontFamily: "'Inter', sans-serif",
      }}>

        {/* Subtle top glow */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 160,
          background: "radial-gradient(ellipse at 50% 0%, rgba(120,60,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 9 }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "linear-gradient(135deg, #7b3fff, #4a1fcc)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, flexShrink: 0,
            }}>🧠</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
              InterviewQ
            </span>
          </button>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 5, marginBottom: 0, paddingLeft: 37 }}>
            AI Evaluation Framework
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, position: "relative" }}>
          {navItems.map((item) => {
            const isActive = item.label === activePage;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                className={`sq-nav-btn${isActive ? " active" : ""}`}
              >
                <span className="sq-icon" style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <div style={{
                    marginLeft: "auto",
                    width: 4, height: 4, borderRadius: "50%",
                    background: "#9b77ff",
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 16px" }} />

        {/* User footer */}
        <div style={{ padding: "14px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "linear-gradient(135deg, #7b3fff, #4a1fcc)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0,
            }}>
              {avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>{userName}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0 }}>Free Plan</p>
            </div>
            <button
              onClick={handleLogout}
              className="sq-logout"
              title="Logout"
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "rgba(255,255,255,0.2)", padding: 0, transition: "color 0.15s" }}
            >
              ⏻
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}