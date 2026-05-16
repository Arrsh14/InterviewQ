const express = require("express");
const router  = express.Router();
const User    = require("../models/User");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const otpStore = new Map();

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already in use." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: "If that email exists, an OTP has been sent." });
    }

    const otp     = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 30 * 1000;

    otpStore.set(email, { otp, expires });

    await sendEmail({
      to:      email,
      subject: "InterviewQ — Your OTP Code",
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px">
          <h2 style="color:#1a1a1a;margin-bottom:8px">Your OTP Code</h2>
          <p style="color:#666;margin-bottom:24px">Use this code to reset your InterviewQ password. It expires in <strong>30 seconds</strong>.</p>
          <div style="background:#fff;border:2px solid #e8e8e8;border-radius:8px;padding:24px;text-align:center">
            <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#2f8d46">${otp}</span>
          </div>
          <p style="color:#aaa;font-size:12px;margin-top:20px;text-align:center">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "OTP sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({ success: false, message: "No OTP requested for this email." });
    }

    if (Date.now() > record.expires) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });

    otpStore.delete(email);

    res.json({ success: true, message: "Password reset successful." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;