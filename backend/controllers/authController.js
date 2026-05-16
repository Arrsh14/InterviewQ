const jwt    = require("jsonwebtoken");
const User   = require("../models/User");
const bcrypt = require("bcryptjs");

// ── Helper: sign JWT ──────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── Helper: send token response ───────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:            user._id,
      name:          user.name,
      email:         user.email,
      plan:          user.plan,
      totalSessions: user.totalSessions,
      averageScore:  user.averageScore,
    },
  });
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ── Key fix: check if account was created via Google (no password set) ──
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "This account uses Google Sign-In. Please use the Google button.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/google ─────────────────────────────────────────────────────
// Called after Google OAuth succeeds on the frontend
// Body: { name, email, googleId, picture }
const googleAuth = async (req, res) => {
  try {
    const { name, email, googleId, picture } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Existing user — just log them in (even if they originally used email/password)
      sendTokenResponse(user, 200, res);
    } else {
      // New user — create account without a password (Google users don't need one)
      user = await User.create({
        name:     name  || email.split("@")[0],
        email,
        // No password field — Google users authenticate via Google only
        // We set a random unusable password so the required validator passes
        password: Math.random().toString(36) + Math.random().toString(36),
      });
      sendTokenResponse(user, 201, res);
    }
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
// Generates a 6-digit OTP, stores it in memory, emails it to user
// Body: { email }
// NOTE: In-memory OTP store — works for development, use Redis in production
const otpStore = {};  // { email: { otp, expiresAt } }

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res.json({ success: true, message: "If that email exists, an OTP has been sent." });
    }

    // Generate 6-digit OTP
    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 30 * 1000;  // 30 seconds from now

    // Store OTP in memory
    otpStore[email] = { otp, expiresAt };

    // ── TODO: Send OTP via email (nodemailer) ─────────────────────────────
    // For now, log it to terminal so you can test without email setup
    console.log(`\n🔑 OTP for ${email}: ${otp}  (expires in 30 seconds)\n`);

    res.json({
      success: true,
      message: "OTP sent to your email",
      // REMOVE this line in production — only for development testing
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
// Verifies OTP and resets password
// Body: { email, otp, newPassword }
const verifyOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    // Check OTP exists
    const stored = otpStore[email];
    if (!stored) {
      return res.status(400).json({ success: false, message: "No OTP found. Please request a new one." });
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // Check OTP matches
    if (stored.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }

    // OTP valid — update password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = newPassword;  // pre-save hook will hash it
    await user.save();

    // Clear OTP from store
    delete otpStore[email];

    res.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/auth/me (protected) ──────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id:            user._id,
        name:          user.name,
        email:         user.email,
        plan:          user.plan,
        totalSessions: user.totalSessions,
        averageScore:  user.averageScore,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, googleAuth, forgotPassword, verifyOtp, getMe };