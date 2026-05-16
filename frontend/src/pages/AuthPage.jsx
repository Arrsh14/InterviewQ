import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

// ── Sub-screen: Forgot Password (email entry) ─────────────────────────────────
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
    <div className="space-y-5">
      <div className="text-center mb-2">
        <div className="text-3xl mb-2">🔑</div>
        <h2 className="text-white font-bold text-lg">Forgot Password</h2>
        <p className="text-slate-400 text-sm mt-1">Enter your email and we'll send a 30-second OTP.</p>
      </div>

      <div>
        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="alex@example.com"
          className="w-full bg-slate-800/60 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-colors duration-200 text-sm"
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
      </div>

      {error && <p className="text-red-400 text-xs text-center">{error}</p>}

      <button
        onClick={handleSend}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold rounded-xl transition-all duration-200 text-sm disabled:opacity-50"
      >
        {loading ? "Sending OTP…" : "Send OTP →"}
      </button>

      <button onClick={onBack} className="w-full text-slate-500 text-xs hover:text-slate-300 transition-colors">
        ← Back to Sign In
      </button>
    </div>
  );
}

// ── Sub-screen: OTP + New Password entry ──────────────────────────────────────
function OtpStep({ email, onBack, onSuccess }) {
  const [otp,         setOtp]         = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [timeLeft,    setTimeLeft]    = useState(30);
  const [expired,     setExpired]     = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) { setExpired(true); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpStr = otp.join("");
    if (otpStr.length < 6)   { setError("Enter all 6 digits."); return; }
    if (!newPassword)         { setError("Enter a new password."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (expired)              { setError("OTP has expired. Go back and request a new one."); return; }

    setLoading(true); setError("");
    try {
      const res  = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, otp: otpStr, newPassword }),
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
      <div className="text-center mb-2">
        <div className="text-3xl mb-2">📬</div>
        <h2 className="text-white font-bold text-lg">Check Your Email</h2>
        <p className="text-slate-400 text-sm mt-1">
          OTP sent to <span className="text-cyan-400">{email}</span>
        </p>
      </div>

      {/* Countdown */}
      <div className="flex justify-center">
        <div className={`px-4 py-2 rounded-full text-sm font-mono font-bold ${
          expired
            ? "bg-red-500/20 border border-red-500/40 text-red-400"
            : timeLeft <= 10
            ? "bg-orange-500/20 border border-orange-500/40 text-orange-400"
            : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
        }`}>
          {expired ? "⏱ OTP Expired" : `⏱ ${timeLeft}s remaining`}
        </div>
      </div>

      {/* 6-digit OTP boxes */}
      <div>
        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3 text-center">
          Enter OTP
        </label>
        <div className="flex gap-2 justify-center">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => inputRefs.current[idx] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(e.target.value, idx)}
              onKeyDown={e => handleOtpKeyDown(e, idx)}
              disabled={expired}
              className={`w-11 h-13 text-center text-xl font-bold rounded-xl border outline-none transition-all duration-200
                ${digit
                  ? "border-cyan-500 bg-cyan-500/10 text-white"
                  : "border-slate-700 bg-slate-800/60 text-white"
                }
                ${expired ? "opacity-40 cursor-not-allowed" : "focus:border-cyan-500"}
              `}
              style={{ height: "52px" }}
            />
          ))}
        </div>
      </div>

      {/* New password */}
      <div>
        <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="Min. 6 characters"
          disabled={expired}
          className="w-full bg-slate-800/60 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-colors duration-200 text-sm disabled:opacity-40"
        />
      </div>

      {error && <p className="text-red-400 text-xs text-center">{error}</p>}

      <button
        onClick={handleVerify}
        disabled={loading || expired}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold rounded-xl transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Verifying…" : "Reset Password →"}
      </button>

      <button onClick={onBack} className="w-full text-slate-500 text-xs hover:text-slate-300 transition-colors">
        ← Try different email
      </button>
    </div>
  );
}

// ── Sub-screen: Success ───────────────────────────────────────────────────────
function SuccessStep({ onDone }) {
  return (
    <div className="text-center space-y-5 py-4">
      <div className="text-5xl">✅</div>
      <h2 className="text-white font-bold text-lg">Password Reset!</h2>
      <p className="text-slate-400 text-sm">Your password has been updated successfully.</p>
      <button
        onClick={onDone}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold rounded-xl transition-all duration-200 text-sm"
      >
        Back to Sign In
      </button>
    </div>
  );
}

// ── Main AuthPage ─────────────────────────────────────────────────────────────
export default function AuthPage() {
  const [mode,    setMode]    = useState("login"); // "login" | "register"
  const [screen,  setScreen]  = useState("auth");  // "auth" | "forgot" | "otp" | "success"
  const [otpEmail, setOtpEmail] = useState("");
  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── Email/Password submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = mode === "register"
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";

      const body = mode === "register"
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const res  = await fetch(url, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) { alert(data.message || "Something went wrong"); return; }

      localStorage.setItem("iq_token",      data.token);
      localStorage.setItem("iq_user_name",  data.user?.name  || form.email);
      localStorage.setItem("iq_user_email", data.user?.email || form.email);
      navigate("/interview");
    } catch {
      alert("Server error — make sure backend is running!");
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ─────────────────────────────────────────────────────────
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
          body: JSON.stringify({
            name: googleUser.name, email: googleUser.email,
            googleId: googleUser.sub, picture: googleUser.picture,
          }),
        });
        const data = await res.json();
        if (!res.ok) { alert(data.message || "Google login failed"); return; }

        localStorage.setItem("iq_token",      data.token);
        localStorage.setItem("iq_user_name",  data.user?.name  || googleUser.name);
        localStorage.setItem("iq_user_email", data.user?.email || googleUser.email);
        navigate("/interview");
      } catch {
        alert("Google login failed — make sure backend is running!");
      } finally {
        setLoading(false);
      }
    },
    onError: () => alert("Google login failed. Please try again."),
  });

  return (
    <div className="min-h-screen bg-[#060810] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-80px] right-1/4 w-[400px] h-[300px] bg-cyan-500/8 rounded-full blur-[80px]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate("/")} className="inline-block">
            <span className="text-3xl font-black text-white">
              Interview<span className="text-cyan-400">Q</span>
            </span>
          </button>
          <p className="text-slate-500 text-sm mt-1 font-mono">Multimodal AI Evaluation Framework</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">

          {/* ── Forgot password screens ── */}
          {screen === "forgot" && (
            <ForgotStep
              onBack={() => setScreen("auth")}
              onOtpSent={(email) => { setOtpEmail(email); setScreen("otp"); }}
            />
          )}

          {screen === "otp" && (
            <OtpStep
              email={otpEmail}
              onBack={() => setScreen("forgot")}
              onSuccess={() => setScreen("success")}
            />
          )}

          {screen === "success" && (
            <SuccessStep onDone={() => { setScreen("auth"); setMode("login"); }} />
          )}

          {/* ── Main auth screen ── */}
          {screen === "auth" && (
            <>
              {/* Tab toggle */}
              <div className="flex bg-slate-800/60 rounded-xl p-1 mb-6">
                {["login", "register"].map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                      mode === m ? "bg-cyan-500 text-black shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {m === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {/* Google button */}
              <button
                onClick={() => handleGoogleLogin()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 mb-5 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl transition-all duration-200 hover:scale-[1.01] hover:shadow-lg disabled:opacity-50 text-sm"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
                </svg>
                {loading ? "Please wait…" : "Continue with Google"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-slate-600 text-xs">or use email</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Fields */}
              <div className="space-y-5">
                {mode === "register" && (
                  <div>
                    <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Full Name</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Alex Chen"
                      className="w-full bg-slate-800/60 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-colors duration-200 text-sm" />
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="alex@example.com"
                    className="w-full bg-slate-800/60 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-colors duration-200 text-sm" />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Password</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••"
                    className="w-full bg-slate-800/60 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-colors duration-200 text-sm" />
                </div>

                {mode === "login" && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setScreen("forgot")}
                      className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button onClick={handleSubmit} disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] text-sm tracking-wide disabled:opacity-50"
                >
                  {loading ? "Please wait…" : mode === "login" ? "Sign In →" : "Create Account →"}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          By continuing you agree to our{" "}
          <span className="text-slate-400 cursor-pointer hover:text-cyan-400 transition-colors">Terms</span> &{" "}
          <span className="text-slate-400 cursor-pointer hover:text-cyan-400 transition-colors">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}