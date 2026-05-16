// routes/resumeRoutes.js
// POST /api/resume/upload → upload PDF, extract text, generate questions

const express    = require("express");
const router     = express.Router();
const multer     = require("multer");

const { uploadResume } = require("../controllers/resumeController");
const { protect }      = require("../middleware/authMiddleware");

// ── Multer config — memory storage, PDF only, max 4MB ────────────────────────
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// ── POST /api/resume/upload ───────────────────────────────────────────────────
router.post("/upload", protect, upload.single("resume"), uploadResume);

module.exports = router;