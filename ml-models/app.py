from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import mediapipe as mp
import os
import sys

import time

# ── Rate limiter for Gemini calls ─────────────────────────────────────────────
_last_gemini_call = 0
_gemini_cooldown  = 30  # seconds between Gemini calls

# ── Import OpenCV scripts ─────────────────────────────────────────────────────
sys.path.append(os.path.join(os.path.dirname(__file__), "opencv"))
sys.path.append(os.path.join(os.path.dirname(__file__), "nlp"))

from eye_contact       import check_eye_contact
from posture_detection import detect_posture

# ── Import NLP scripts ────────────────────────────────────────────────────────
from filler_word_detection import FillerTracker
from grammar_analysis      import GrammarTracker
from star_method_analysis  import STARTracker
from confidence_analysis   import ConfidenceTracker

BaseOptions           = mp.tasks.BaseOptions
FaceLandmarker        = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
PoseLandmarker        = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode     = mp.tasks.vision.RunningMode

app = Flask(__name__)
CORS(app)

# ── Load vision models once at startup ───────────────────────────────────────
print("Loading models...")

face_landmarker = FaceLandmarker.create_from_options(
    FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path="models/face_landmarker.task"),
        running_mode=VisionRunningMode.IMAGE,
        num_faces=1,
    )
)

pose_landmarker = PoseLandmarker.create_from_options(
    PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path="models/pose_landmarker_lite.task"),
        running_mode=VisionRunningMode.IMAGE,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )
)

print("✅ Models loaded")


def decode_frame(base64_image):
    img_data = base64.b64decode(base64_image.split(",")[-1])
    np_arr   = np.frombuffer(img_data, np.uint8)
    frame    = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return frame


# ── POST /analyse ─────────────────────────────────────────────────────────────
@app.route("/analyse", methods=["POST"])
def analyse():
    try:
        data = request.get_json()
        if not data or "frame" not in data:
            return jsonify({ "success": False, "message": "No frame provided" }), 400

        frame = decode_frame(data["frame"])
        if frame is None:
            return jsonify({ "success": False, "message": "Invalid frame" }), 400

        results = {}

        # ── Eye contact ───────────────────────────────────────────────────────
        try:
            _, eye_contact, confidence = check_eye_contact(frame.copy(), face_landmarker)
            results["eye_contact"] = {
                "making_contact": bool(eye_contact),
                "confidence":     int(confidence) if confidence else 0,
            }
        except Exception as e:
            print(f"Eye contact error: {e}")
            results["eye_contact"] = { "making_contact": False, "confidence": 0 }

        # ── Posture ───────────────────────────────────────────────────────────
        try:
            _, posture_data = detect_posture(frame.copy(), pose_landmarker)
            results["posture"] = posture_data
        except Exception as e:
            print(f"Posture error: {e}")
            results["posture"] = { "score": 0, "feedback": "Could not detect posture" }

        # ── Overall score ─────────────────────────────────────────────────────
        eye_score     = results["eye_contact"]["confidence"]
        posture_score = results["posture"].get("score", 0)
        overall       = int((eye_score * 0.5) + (posture_score * 0.5))

        results["overall_score"] = overall
        results["success"]       = True

        return jsonify(results)

    except Exception as e:
        print(f"Server error: {e}")
        return jsonify({ "success": False, "message": str(e) }), 500


# ── POST /analyse/nlp ─────────────────────────────────────────────────────────
# ── POST /analyse/nlp ─────────────────────────────────────────────────────────
@app.route("/analyse/nlp", methods=["POST"])
def analyse_nlp():
    try:
        data = request.get_json()
        if not data or "transcript" not in data:
            return jsonify({ "success": False, "message": "No transcript provided" }), 400

        transcript = data["transcript"].strip()
        if not transcript:
            return jsonify({ "success": False, "message": "Empty transcript" }), 400

        results = {}

        # ── Filler word detection ─────────────────────────────────────────────
        try:
            filler_tracker = FillerTracker()
            filler_tracker.process_transcript(transcript)
            results["filler_words"] = {
                "total_fillers":      filler_tracker.total_fillers,
                "fillers_per_minute": filler_tracker.fillers_per_minute(),
                "filler_score":       filler_tracker.filler_score(),
                "top_fillers":        filler_tracker.top_fillers(),
            }
        except Exception as e:
            print(f"Filler error: {e}")
            results["filler_words"] = { "filler_score": 5, "total_fillers": 0 }

        # ── Grammar analysis ──────────────────────────────────────────────────
        try:
            grammar_tracker = GrammarTracker()
            errors          = grammar_tracker.analyze_text(transcript)
            results["grammar"] = {
                "total_errors":  grammar_tracker.total_errors,
                "grammar_score": grammar_tracker.grammar_score(),
                "errors":        errors[:5],
            }
        except Exception as e:
            print(f"Grammar error: {e}")
            results["grammar"] = { "grammar_score": 5, "total_errors": 0 }

        # ── STAR method analysis ──────────────────────────────────────────────
        
        try:
            global _last_gemini_call
            now          = time.time()
            question     = data.get("question", "Tell me about yourself")
            star_tracker = STARTracker()

            if now - _last_gemini_call >= _gemini_cooldown:
                _last_gemini_call = now
                star_result = star_tracker.analyze(question, transcript)
            else:
                star_result = None
                print(f"Gemini rate limited — skipping ({int(_gemini_cooldown - (now - _last_gemini_call))}s remaining)")

            if star_result:
                results["star"] = {
                    "star_score":      star_result["star_score"],
                    "relevance_score": star_result["relevance_score"],
                    "overall_score":   star_result["overall_score"],
                    "feedback":        star_result["feedback"],
                    "improvement":     star_result["improvement"],
                    "situation":       star_result["situation"],
                    "task":            star_result["task"],
                    "action":          star_result["action"],
                    "result":          star_result["result"],
                    "relevance":       star_result["relevance"],
                }
            else:
                results["star"] = { "star_score": 5, "relevance_score": 5, "overall_score": 5 }
        except Exception as e:
            print(f"STAR error: {e}")
            results["star"] = { "star_score": 5, "relevance_score": 5, "overall_score": 5 }

        # ── Confidence analysis ───────────────────────────────────────────────
        try:
            conf_tracker = ConfidenceTracker()
            conf_tracker.analyze_text(transcript)
            label, _     = conf_tracker.get_live_feedback()
            results["confidence"] = {
                "confidence_score": conf_tracker.confidence_score(),
                "confidence_label": label,
                "weak_words":       conf_tracker.weak_word_count,
                "speaking_pace":    conf_tracker.speaking_pace(),
            }
        except Exception as e:
            print(f"Confidence error: {e}")
            results["confidence"] = { "confidence_score": 5, "confidence_label": "Unknown" }

        # ── Combined NLP score ────────────────────────────────────────────────
        filler_score  = results["filler_words"].get("filler_score",  5) * 10
        grammar_score = results["grammar"].get("grammar_score",       5) * 10
        conf_score    = results["confidence"].get("confidence_score", 5) * 10

        star_score_val = results["star"].get("overall_score", 5) * 10
        nlp_score = int(
            filler_score   * 0.25 +
            grammar_score  * 0.25 +
            conf_score     * 0.25 +
            star_score_val * 0.25
)

        results["nlp_score"] = nlp_score
        results["success"]   = True

        return jsonify(results)

    except Exception as e:
        print(f"NLP error: {e}")
        return jsonify({ "success": False, "message": str(e) }), 500


# ── GET /health ───────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({ "status": "ok", "message": "InterviewQ ML server running" })


if __name__ == "__main__":
    print("🚀 Starting InterviewQ ML server on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)