import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

/* ─── Floating particle canvas for the left panel ─────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Floating nodes
    const nodes = Array.from({ length: 28 }, () => ({
      x:   Math.random() * canvas.width,
      y:   Math.random() * canvas.height,
      r:   Math.random() * 2 + 1,
      vx:  (Math.random() - 0.5) * 0.4,
      vy:  (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34,211,238,${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // draw nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${n.opacity})`;
        ctx.fill();

        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

/* ─── Animated interview-Q cards on the left panel ────────────────────────── */
const CARDS = [
  { icon: "⚡", label: "System Design",    color: "#22d3ee" },
  { icon: "🧠", label: "DSA & Algorithms", color: "#a78bfa" },
  { icon: "🎯", label: "Behavioural",      color: "#34d399" },
  { icon: "💡", label: "AI & ML Concepts", color: "#fbbf24" },
];

function FloatingCards() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {CARDS.map((c, i) => (
        <div
          key={c.label}
          style={{
            position:        "absolute",
            animationName:   "floatCard",
            animationDuration: `${4 + i * 0.7}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDirection: i % 2 === 0 ? "alternate" : "alternate-reverse",
            animationDelay:  `${i * 0.5}s`,
            top:  `${18 + i * 17}%`,
            left: i % 2 === 0 ? "8%" : "auto",
            right: i % 2 !== 0 ? "8%" : "auto",
          }}
        >
          <div
            style={{
              background:  "rgba(15,23,42,0.75)",
              border:      `1px solid ${c.color}40`,
              borderLeft:  `3px solid ${c.color}`,
              borderRadius: "12px",
              padding:      "10px 18px",
              display:      "flex",
              alignItems:   "center",
              gap:          "10px",
              backdropFilter: "blur(8px)",
              boxShadow:    `0 4px 24px ${c.color}18`,
              whiteSpace:   "nowrap",
            }}
          >
            <span style={{ fontSize: "16px" }}>{c.icon}</span>
            <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
              {c.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Sub-screen: Forgot Password ─────────────────────────────────────────── */
function ForgotStep({ onBack, onOtpSent }) {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSend = async () => {
    if (!email) { setError("Please enter your email."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      onOtpSent(email);
    } catch {
      setError("Server error — make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-3">🔑</div>
        <h2 className="text-gray-900 font-bold text-xl">Forgot Password</h2>
        <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send a 30-second OTP.</p>
      </div>

      <div>
        <label className="block text-gray-600 text-xs font-semibold uppercase tracking-widest mb-2">Email</label>
        <input
          type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="alex@example.com"
          className="w-full border border-gray-200 focus:border-gray-900 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 outline-none transition-colors duration-200 text-sm bg-white"
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
      </div>

      {error && <p className="text-red-500 text-xs text-center">{error}</p>}

      <button onClick={handleSend} disabled={loading}
        className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all duration-200 text-sm disabled:opacity-50"
      >
        {loading ? "Sending OTP…" : "Send OTP →"}
      </button>

      <button onClick={onBack} className="w-full text-gray-400 text-xs hover:text-gray-600 transition-colors">
        ← Back to Sign In
      </button>
    </div>
  );
}

/* ─── Sub-screen: OTP ──────────────────────────────────────────────────────── */
function OtpStep({ email, onBack, onSuccess }) {
  const [otp,         setOtp]         = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [timeLeft,    setTimeLeft]    = useState(30);
  const [expired,     setExpired]     = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft <= 0) { setExpired(true); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const otpStr = otp.join("");
    if (otpStr.length < 6)      { setError("Enter all 6 digits."); return; }
    if (!newPassword)            { setError("Enter a new password."); return; }
    if (newPassword.length < 6)  { setError("Password must be at least 6 characters."); return; }
    if (expired)                 { setError("OTP has expired. Go back and request a new one."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpStr, newPassword }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      onSuccess();
    } catch {
      setError("Server error — make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-4xl mb-3">📬</div>
        <h2 className="text-gray-900 font-bold text-xl">Check Your Email</h2>
        <p className="text-gray-500 text-sm mt-1">
          OTP sent to <span className="font-semibold text-gray-800">{email}</span>
        </p>
      </div>

      <div className="flex justify-center">
        <div className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold border ${
          expired ? "bg-red-50 border-red-200 text-red-500"
          : timeLeft <= 10 ? "bg-orange-50 border-orange-200 text-orange-500"
          : "bg-green-50 border-green-200 text-green-600"
        }`}>
          {expired ? "⏱ OTP Expired" : `⏱ ${timeLeft}s remaining`}
        </div>
      </div>

      <div>
        <label className="block text-gray-600 text-xs font-semibold uppercase tracking-widest mb-3 text-center">Enter OTP</label>
        <div className="flex gap-2 justify-center">
          {otp.map((digit, idx) => (
            <input key={idx} ref={el => inputRefs.current[idx] = el}
              type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={e => handleOtpChange(e.target.value, idx)}
              onKeyDown={e => handleOtpKeyDown(e, idx)} disabled={expired}
              className={`w-11 text-center text-xl font-bold rounded-xl border outline-none transition-all duration-200
                ${digit ? "border-gray-900 bg-gray-50 text-gray-900" : "border-gray-200 bg-white text-gray-900"}
                ${expired ? "opacity-40 cursor-not-allowed" : "focus:border-gray-900"}
              `}
              style={{ height: "52px" }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-gray-600 text-xs font-semibold uppercase tracking-widest mb-2">New Password</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
          placeholder="Min. 6 characters" disabled={expired}
          className="w-full border border-gray-200 focus:border-gray-900 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 outline-none transition-colors duration-200 text-sm bg-white disabled:opacity-40"
        />
      </div>

      {error && <p className="text-red-500 text-xs text-center">{error}</p>}

      <button onClick={handleVerify} disabled={loading || expired}
        className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Verifying…" : "Reset Password →"}
      </button>

      <button onClick={onBack} className="w-full text-gray-400 text-xs hover:text-gray-600 transition-colors">
        ← Try different email
      </button>
    </div>
  );
}

/* ─── Sub-screen: Success ──────────────────────────────────────────────────── */
function SuccessStep({ onDone }) {
  return (
    <div className="text-center space-y-5 py-4">
      <div className="text-5xl">✅</div>
      <h2 className="text-gray-900 font-bold text-xl">Password Reset!</h2>
      <p className="text-gray-500 text-sm">Your password has been updated successfully.</p>
      <button onClick={onDone}
        className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all duration-200 text-sm"
      >
        Back to Sign In
      </button>
    </div>
  );
}

/* ─── Main AuthPage ────────────────────────────────────────────────────────── */
export default function AuthPage() {
  const [mode,     setMode]     = useState("login");
  const [screen,   setScreen]   = useState("auth");
  const [otpEmail, setOtpEmail] = useState("");
  const [form,     setForm]     = useState({ name: "", email: "", password: "" });
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url  = mode === "register"
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";
      const body = mode === "register"
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const res  = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Something went wrong"); return; }

      localStorage.setItem("iq_token",      data.token);
      localStorage.setItem("iq_user_name",  data.user?.name  || form.email);
      localStorage.setItem("iq_user_email", data.user?.email || form.email);
      navigate("/dashboard");
    } catch {
      alert("Server error — make sure backend is running!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await userInfoRes.json();
        const res  = await fetch("http://localhost:5000/api/auth/google", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: googleUser.name, email: googleUser.email, googleId: googleUser.sub, picture: googleUser.picture }),
        });
        const data = await res.json();
        if (!res.ok) { alert(data.message || "Google login failed"); return; }
        localStorage.setItem("iq_token",      data.token);
        localStorage.setItem("iq_user_name",  data.user?.name  || googleUser.name);
        localStorage.setItem("iq_user_email", data.user?.email || googleUser.email);
        navigate("/dashboard");
      } catch {
        alert("Google login failed — make sure backend is running!");
      } finally {
        setLoading(false);
      }
    },
    onError: () => alert("Google login failed. Please try again."),
  });

  return (
    <>
      {/* keyframes injected once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        @keyframes floatCard {
          from { transform: translateY(0px) rotate(-1deg); }
          to   { transform: translateY(-14px) rotate(1deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-fade-up { animation: fadeUp 0.45s ease both; }
        .auth-fade-up-1 { animation: fadeUp 0.45s 0.05s ease both; }
        .auth-fade-up-2 { animation: fadeUp 0.45s 0.12s ease both; }
        .auth-fade-up-3 { animation: fadeUp 0.45s 0.20s ease both; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          flex: "0 0 58%",
          background: "#070b14",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px 48px",
        }}>
          {/* subtle radial glow */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 70% 60% at 40% 50%, rgba(34,211,238,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 50% 40% at 80% 80%, rgba(139,92,246,0.06) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          {/* particle network */}
          <ParticleCanvas />

          {/* Logo */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <span style={{ fontSize: "22px", fontWeight: 800, color: "#fff", fontFamily: "'Syne', sans-serif", letterSpacing: "-0.5px" }}>
                Interview<span style={{ color: "#22d3ee" }}>Q</span>
              </span>
            </button>
          </div>

          {/* Floating topic cards */}
          <div style={{ position: "relative", zIndex: 2, flex: 1 }}>
            <FloatingCards />
          </div>

          {/* Bottom tagline */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <p style={{ color: "#fff", fontSize: "26px", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1.25, maxWidth: 420 }}>
              The smartest way to ace your next tech interview.
            </p>
            <p style={{ color: "rgba(148,163,184,0.8)", fontSize: "14px", marginTop: "10px" }}>
              AI-powered mock interviews · instant feedback · real questions
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex: 1,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 40px",
          overflowY: "auto",
        }}>
          <div style={{ width: "100%", maxWidth: 380 }}>

            {/* ── Forgot / OTP / Success screens ── */}
            {screen === "forgot" && (
              <ForgotStep
                onBack={() => setScreen("auth")}
                onOtpSent={(email) => { setOtpEmail(email); setScreen("otp"); }}
              />
            )}
            {screen === "otp" && (
              <OtpStep email={otpEmail} onBack={() => setScreen("forgot")} onSuccess={() => setScreen("success")} />
            )}
            {screen === "success" && (
              <SuccessStep onDone={() => { setScreen("auth"); setMode("login"); }} />
            )}

            {/* ── Main auth screen ── */}
            {screen === "auth" && (
              <>
                <div className="auth-fade-up" style={{ marginBottom: "28px" }}>
                  <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", fontFamily: "'Syne', sans-serif", marginBottom: "4px" }}>
                    {mode === "login" ? "Log In" : "Create Account"}
                  </h1>
                  <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                    {mode === "login"
                      ? "Welcome back — let's get you ready."
                      : "Start your interview prep journey today."}
                  </p>
                </div>

                {/* Email field */}
                <div className="auth-fade-up-1" style={{ marginBottom: "14px" }}>
                  {mode === "register" && (
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Full Name
                      </label>
                      <input
                        type="text" name="name" value={form.name} onChange={handleChange}
                        placeholder="Alex Chen"
                        style={{
                          width: "100%", boxSizing: "border-box",
                          border: "1.5px solid #e2e8f0", borderRadius: "10px",
                          padding: "11px 14px", fontSize: "14px", color: "#0f172a",
                          outline: "none", transition: "border-color 0.18s",
                          fontFamily: "'DM Sans', sans-serif", background: "#fff",
                        }}
                        onFocus={e => e.target.style.borderColor = "#0f172a"}
                        onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
                      />
                    </div>
                  )}

                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Email
                  </label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="alex@example.com"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      border: "1.5px solid #e2e8f0", borderRadius: "10px",
                      padding: "11px 14px", fontSize: "14px", color: "#0f172a",
                      outline: "none", transition: "border-color 0.18s",
                      fontFamily: "'DM Sans', sans-serif", background: "#fff",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0f172a"}
                    onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>

                <div className="auth-fade-up-2" style={{ marginBottom: "6px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Password
                  </label>
                  <input
                    type="password" name="password" value={form.password} onChange={handleChange}
                    placeholder="••••••••••"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      border: "1.5px solid #e2e8f0", borderRadius: "10px",
                      padding: "11px 14px", fontSize: "14px", color: "#0f172a",
                      outline: "none", transition: "border-color 0.18s",
                      fontFamily: "'DM Sans', sans-serif", background: "#fff",
                    }}
                    onFocus={e => e.target.style.borderColor = "#0f172a"}
                    onBlur={e  => e.target.style.borderColor = "#e2e8f0"}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  />
                </div>

                {mode === "login" && (
                  <div style={{ textAlign: "right", marginBottom: "20px" }}>
                    <button
                      onClick={() => setScreen("forgot")}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: "13px", textDecoration: "underline", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Reset password
                    </button>
                  </div>
                )}

                {mode === "register" && <div style={{ marginBottom: "20px" }} />}

                {/* Primary CTA */}
                <div className="auth-fade-up-3">
                  <button
                    onClick={handleSubmit} disabled={loading}
                    style={{
                      width: "100%", padding: "13px", background: "#0f172a",
                      color: "#fff", border: "none", borderRadius: "10px",
                      fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1, transition: "background 0.18s",
                      fontFamily: "'DM Sans', sans-serif", marginBottom: "18px",
                    }}
                    onMouseEnter={e => { if (!loading) e.target.style.background = "#1e293b"; }}
                    onMouseLeave={e => { e.target.style.background = "#0f172a"; }}
                  >
                    {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create Account"}
                  </button>

                  {/* Divider */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                    <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                    <span style={{ color: "#94a3b8", fontSize: "12px" }}>or</span>
                    <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
                  </div>

                  {/* Google */}
                  <button
                    onClick={() => handleGoogleLogin()} disabled={loading}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "10px", padding: "12px", background: "#fff",
                      border: "1.5px solid #e2e8f0", borderRadius: "10px",
                      fontSize: "14px", fontWeight: 600, color: "#0f172a",
                      cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                      transition: "border-color 0.18s, box-shadow 0.18s",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                    </svg>
                    Continue with Google
                  </button>

                  {/* Toggle login/register */}
                  <p style={{ textAlign: "center", marginTop: "22px", fontSize: "13px", color: "#94a3b8" }}>
                    {mode === "login" ? "New user? " : "Already have an account? "}
                    <button
                      onClick={() => setMode(mode === "login" ? "register" : "login")}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#0f172a", fontWeight: 700, textDecoration: "underline", fontFamily: "'DM Sans', sans-serif", fontSize: "13px" }}
                    >
                      {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}