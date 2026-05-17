# InterviewQ — Multimodal AI Framework for Real-Time Interview Performance Evaluation

> A full-stack AI-powered mock interview platform that evaluates speech, facial engagement, eye contact, posture, and communication quality in real time.

---

## 📌 Project Overview

InterviewQ is a research-grade web application built as part of a Computer Science project at **VIT Vellore**. It uses a multimodal AI pipeline to evaluate interview performance across five dimensions:

- 👁️ **Eye Contact** — real-time gaze tracking via face-api.js + MediaPipe Face Mesh
- 🧍 **Posture Detection** — body language analysis via MediaPipe Pose landmarks
- 😐 **Emotion Detection** — facial expression classification using FER2013-trained CNN
- 🗣️ **Communication** — NLP-based transcript analysis
- 📊 **Technical Depth** — AI-scored response evaluation via Gemini

---

## 🗂️ Project Structure

```
interviewiq/
├── frontend/                        # React + Tailwind CSS client
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx                 # Entry point + GoogleOAuthProvider
│       ├── App.jsx                  # React Router route definitions
│       ├── index.css                # Tailwind base + global styles
│       ├── pages/
│       │   ├── LandingPage.jsx      # Hero, features, stats, CTA
│       │   ├── HomePage.jsx         # Home screen
│       │   ├── AuthPage.jsx         # Sign in / Register + Google OAuth + OTP reset
│       │   ├── Dashboard.jsx        # Performance overview + session history
│       │   ├── InterviewPage.jsx    # Live interview: webcam, questions, transcript, timer
│       │   ├── ResultsPage.jsx      # Post-interview scores + AI feedback
│       │   ├── ResumePage.jsx       # Resume upload → AI question generation
│       │   ├── Features.jsx         # Feature showcase page
│       │   ├── Research.jsx         # Research/methodology page
│       │   └── Docs.jsx             # Documentation page
│       ├── components/
│       │   ├── Navbar.jsx           # Top navigation (Landing)
│       │   ├── Sidebar.jsx          # Left sidebar (Dashboard/Interview)
│       │   ├── VideoRecorder.jsx    # Webcam feed + face detection overlay
│       │   ├── EyeContactWarning.jsx # Floating gaze alert popup
│       │   ├── InterviewTimer.jsx   # Countdown timer per question
│       │   ├── TimerDisplay.jsx     # Timer UI component
│       │   ├── QuestionBox.jsx      # Question card with type badge + tip
│       │   ├── Scorecard.jsx        # Metric summary card (Dashboard)
│       │   ├── Resultscorecard.jsx  # Score card (Results page)
│       │   ├── FeedbackCard.jsx     # AI feedback remark card
│       │   ├── PlaceholderChart.jsx # Chart placeholder component
│       │   ├── FeatureCard.jsx      # Feature grid card (Landing)
│       │   ├── Attemptrow.jsx       # Previous interview list row
│       │   └── index.jsx            # Component barrel exports
│       ├── hooks/
│       │   ├── useTimer.js          # Custom countdown timer hook
│       │   └── useWebcam.js         # Custom webcam stream hook
│       ├── data/
│       │   └── dummyData.js         # Placeholder data for UI development
│       └── utils/
│           └── helpers.js           # Utility functions
│
├── backend/                         # Node.js + Express API server
│   ├── server.js                    # App entry point + middleware + routes
│   ├── .env                         # Environment variables (never commit)
│   ├── config/
│   │   ├── db.js                    # MongoDB Atlas connection
│   │   └── gemini.js                # Google Gemini AI client
│   ├── routes/
│   │   ├── AuthRoutes.js            # /api/auth/*
│   │   ├── interviewRoutes.js       # /api/interviews/*
│   │   ├── assa.js                  # /api/ai/*
│   │   ├── transciptRoutes.js       # /api/transcripts/*
│   │   ├── abcd.js                  # /api/analytics/*
│   │   └── resumeRoute.js           # /api/resume/*
│   ├── controllers/
│   │   ├── authController.js        # Register, login, Google OAuth, OTP
│   │   ├── interviewController.js   # Create/fetch interview sessions
│   │   ├── aiController.js          # AI scoring + feedback generation
│   │   ├── analyticsController.js   # Performance trend analytics
│   │   ├── transcriptController.js  # Transcript save/fetch
│   │   └── resumeController.js      # PDF parse + Gemini question generation
│   ├── models/
│   │   ├── User.js                  # User schema (email, password, googleId)
│   │   ├── Interview.js             # Interview session schema
│   │   ├── Result.js                # Score + feedback schema
│   │   └── Transcript.js            # Speech transcript schema
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT token verification
│   ├── services/
│   │   ├── geminiService.js         # Gemini API wrapper
│   │   ├── nlpService.js            # NLP text analysis
│   │   └── scoringService.js        # Score calculation logic
│   └── utils/
│       └── sendEmail.js             # Nodemailer OTP email sender
│
└── ml-models/                       # Python CV + ML microservice
    ├── app.py                       # Flask server entry point (port 5001)
    ├── emotion_model.h5             # Trained CNN emotion detection model
    ├── fer2013.zip                  # FER2013 training dataset (not committed)
    ├── models/
    │   ├── face_landmarker.task         # MediaPipe face landmark model
    │   └── pose_landmarker_lite.task    # MediaPipe pose landmark model
    ├── opencv/
    │   ├── eye_contact.py           # Gaze tracking via MediaPipe Face Mesh
    │   ├── posture_detection.py     # Body posture analysis via MediaPipe Pose
    │   ├── emotion_detection.py     # FER2013 CNN emotion classifier
    │   └── face_detection.py        # Face detection preprocessing
    └── training/
        └── train_emotion.py         # CNN training script on FER2013 dataset
```

---

## ⚙️ Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| `react` | 18.2.0 | UI framework |
| `react-dom` | 18.2.0 | DOM rendering |
| `react-router-dom` | 6.22.0 | Client-side routing |
| `@react-oauth/google` | 0.13.5 | Google OAuth 2.0 |
| `@vladmandic/face-api` | 1.7.15 | Face detection + eye contact tracking |
| `lucide-react` | 1.14.0 | Icon library |
| `tailwindcss` | 3.4.1 | Utility CSS framework |
| `vite` | 8.0.12 | Dev server + bundler |

### Backend
| Package | Version | Purpose |
|---|---|---|
| `express` | 5.2.1 | HTTP server framework |
| `mongoose` | 9.6.2 | MongoDB ODM |
| `jsonwebtoken` | 9.0.3 | JWT authentication |
| `bcryptjs` | 3.0.3 | Password hashing |
| `@google/generative-ai` | 0.24.1 | Gemini AI API |
| `nodemailer` | 8.0.7 | OTP email delivery |
| `multer` | 2.1.1 | PDF file upload handling |
| `pdfreader` | 3.0.8 | PDF text extraction |
| `cors` | 2.8.6 | Cross-origin requests |
| `dotenv` | 17.4.2 | Environment variables |
| `morgan` | 1.10.1 | HTTP request logging |
| `nodemon` | 3.1.14 | Dev auto-restart |

### ML / Computer Vision
| Library | Purpose |
|---|---|
| `flask` + `flask-cors` | Python microserver + CORS for React |
| `opencv-python` | Frame decoding and image processing |
| `mediapipe` | Face mesh + pose landmark models |
| `tensorflow` / `keras` | CNN emotion model training + inference |
| `numpy` | Array operations on frame data |

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js v18+
- Python 3.11+
- MongoDB Atlas account
- Google Cloud project (for OAuth)
- Gmail account with App Password (for OTP emails)
- Gemini API key from [aistudio.google.com](https://aistudio.google.com)

---

### 1. Clone the repository
```bash
git clone https://github.com/Arrsh14/InterviewQ.git
cd InterviewQ
```

---

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/interviewq?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_long_random_secret_here_min_32_chars
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Email (for OTP)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16char_app_password
```

Start the backend:
```bash
npm run dev
```

You should see:
```
✅ MongoDB Atlas connected: cluster0.xxxxx.mongodb.net
🚀 Server running on http://localhost:5000
```

---

### 3. Frontend setup

```bash
cd frontend
npm install --legacy-peer-deps
```

Create a `.env` file in the `frontend/` folder:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Start the frontend:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

### 4. ML Server setup

```bash
cd ml-models
python3 -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

pip install flask flask-cors opencv-python mediapipe numpy
```

Start the ML server:
```bash
python app.py
```

You should see:
```
Loading models...
✅ Models loaded
🚀 Starting InterviewQ ML server on http://localhost:5001
```

---

## 🤖 ML Server — How It Works

The frontend captures webcam frames during the interview, encodes them as base64, and sends them to the Flask server. The server runs MediaPipe models on each frame and returns structured JSON scores back to the frontend.

```
Frontend (React)
     │
     │  POST /analyse  { frame: "data:image/jpeg;base64,..." }
     ▼
Flask Server (localhost:5001)
     │
     ├── eye_contact.py       → MediaPipe Face Mesh → gaze score
     └── posture_detection.py → MediaPipe Pose     → posture score
     │
     │  { eye_contact: {...}, posture: {...}, overall_score: 85 }
     ▼
Frontend displays live feedback
```

### ML API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/analyse` | Analyse webcam frame → eye contact + posture scores |
| GET | `/health` | ML server health check |

**POST /analyse — Request:**
```json
{ "frame": "data:image/jpeg;base64,/9j/4AAQ..." }
```

**POST /analyse — Response:**
```json
{
  "success": true,
  "eye_contact": { "making_contact": true, "confidence": 82 },
  "posture": { "score": 76, "feedback": "Slight forward lean detected" },
  "overall_score": 79
}
```

**Score formula:** `overall = (eye_contact_confidence × 0.5) + (posture_score × 0.5)`

### CV Modules

**👁️ Eye Contact** (`opencv/eye_contact.py`) — MediaPipe FaceLandmarker with 478 landmarks. Computes gaze direction from iris position relative to eye corners. Returns `making_contact` (bool) + `confidence` (0–100).

**🧍 Posture Detection** (`opencv/posture_detection.py`) — MediaPipe PoseLandmarker tracking shoulder alignment, head tilt, and spine angle. Confidence thresholds: detection `0.5`, presence `0.5`, tracking `0.5`. Returns `score` (0–100) + `feedback` string.

**😐 Emotion Detection** (`opencv/emotion_detection.py`) — CNN trained on FER2013 (35,887 labeled grayscale images), classifies 7 emotions: Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral. Weights saved in `emotion_model.h5`.

**🔍 Face Detection** (`opencv/face_detection.py`) — Preprocessing step for emotion and eye contact modules. Fast bounding box detection before passing ROI to downstream models.

---

## 🧭 Routes

### Frontend Routes
| Path | Page | Description |
|---|---|---|
| `/` | LandingPage | Hero section, features, CTA |
| `/auth` | AuthPage | Sign in / Register / Google OAuth / OTP reset |
| `/dashboard` | Dashboard | Performance overview, session history |
| `/interview` | InterviewPage | Live interview with webcam + AI tracking |
| `/results` | ResultsPage | Post-session scores + AI feedback |
| `/resume` | ResumePage | Upload resume → generate custom questions |
| `/features` | Features | Feature showcase |
| `/research` | Research | Methodology and research details |
| `/docs` | Docs | Documentation |

### Backend API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/google` | Google OAuth login/register |
| POST | `/api/auth/forgot-password` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP + reset password |
| GET | `/api/interviews` | Get all interview sessions |
| POST | `/api/interviews` | Create new interview session |
| POST | `/api/ai/score` | AI score generation |
| POST | `/api/transcripts` | Save transcript |
| GET | `/api/analytics` | Get performance analytics |
| POST | `/api/resume/upload` | Upload PDF + generate questions |
| GET | `/api/health` | Server health check |

---

## 🎨 Design System

| Element | Value |
|---|---|
| Base background | `#060810` |
| Card background | `slate-900/80` |
| Primary accent | `cyan-400` (`#22d3ee`) |
| Secondary accent | `indigo-400` |
| Font (display) | DM Sans / Open Sans |
| Font (mono/data) | DM Mono |
| Border color | `slate-800` |
| Success color | `emerald-400` |
| Warning color | `orange-400` |
| Error color | `red-400` |

---

## 🔐 Authentication Flow

```
Email/Password → bcrypt hash → JWT token → localStorage
Google OAuth   → Google userinfo API → backend /api/auth/google → JWT token
Forgot Password → OTP email (30s expiry) → verify → bcrypt new password
```

---

## 👁️ Eye Contact Detection (Frontend)

Uses `@vladmandic/face-api` with TinyFaceDetector model:

1. Loads `tinyFaceDetector` + `faceLandmark68Net` models from `/public/models/`
2. Runs detection every 1200ms on webcam video element
3. Computes yaw ratio from nose tip vs eye midpoint (threshold: `0.18`)
4. Computes pitch ratio from nose tip vs eye vertical (threshold: `0.25–0.55`)
5. After 3 consecutive away-frames → triggers `EyeContactWarning` popup

---

## 🗄️ Database — MongoDB Atlas

**Cluster:** `cluster0.s3pkl3e.mongodb.net`
**Database:** `interviewq`

### Collections

**Users**
```js
{ name, email, password, googleId, picture, createdAt }
```

**Interviews**
```js
{ userId, title, questions, status, startedAt, completedAt }
```

**Results**
```js
{ userId, interviewId, overallScore, confidence, communication, attention, technicalDepth, feedback, createdAt }
```

**Transcripts**
```js
{ userId, interviewId, questionIndex, text, wordCount, createdAt }
```

---

## 📧 OTP Email Flow

1. User clicks **Forgot password?**
2. Enters email → POST `/api/auth/forgot-password`
3. Backend generates 6-digit OTP, stores with 30-second expiry
4. Nodemailer sends OTP via Gmail App Password
5. User enters OTP + new password → POST `/api/auth/verify-otp`
6. Backend verifies OTP not expired → bcrypt hashes new password → updates User

---

## 🤖 Gemini AI Integration

- **Model:** `gemini-2.0-flash-lite`
- **Resume analysis:** Extracts text via `pdfreader` → sends to Gemini → returns 3 custom interview questions (Technical, Behavioral, Situational)
- **Answer scoring:** Transcript sent to Gemini → returns structured JSON scores + feedback remarks

---

## 🛠️ Development Notes

- Frontend uses `--legacy-peer-deps` due to `vite@8` + `@vitejs/plugin-react@4` peer conflict
- Face detection models must be placed in `frontend/public/models/` folder
- MongoDB Atlas Network Access must include `0.0.0.0/0` for local development
- Gemini free tier has per-minute and daily request limits — use `gemini-2.0-flash-lite` for best quota
- OTP expiry is stored in-memory (`Map`) — use Redis for production
- ML server runs on **port 5001**, separate from Node.js backend on port 5000
- `ml_venv/` and `venv/` folders must be in `.gitignore` — never commit them
- `emotion_model.h5` and `fer2013.zip` are large files — consider Git LFS or hosting separately
- MediaPipe model files in `ml-models/models/` must be present before starting the ML server

---

## 👨‍💻 Author

**Arrsh Tripathi**
B.Tech Computer Science — VIT Vellore
Registration No: 23BCI0191
