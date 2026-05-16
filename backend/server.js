const express   = require("express");
const cors      = require("cors");
const dotenv    = require("dotenv");
const morgan    = require("morgan");

// ── Load env FIRST ────────────────────────────────────────────────────────────
dotenv.config();
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION:", err);
});

// ── DB connection ─────────────────────────────────────────────────────────────
const connectDB = require("./config/db");

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes       = require("./routes/AuthRoutes");
const interviewRoutes  = require("./routes/interviewRoutes");
const aiRoutes         = require("./routes/assa");
const transcriptRoutes = require("./routes/transciptRoutes");
const analyticsRoutes  = require("./routes/abcd");

// ── App init ──────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status:  "ok",
    message: "InterviewQ backend is running 🚀",
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/interviews",  interviewRoutes);
app.use("/api/ai",          aiRoutes);
app.use("/api/transcripts", transcriptRoutes);
app.use("/api/analytics",   analyticsRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ── Connect DB → then start server ───────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
});