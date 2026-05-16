from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import mediapipe as mp
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "opencv"))

from eye_contact       import check_eye_contact
from posture_detection import detect_posture

BaseOptions           = mp.tasks.BaseOptions
FaceLandmarker        = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
PoseLandmarker        = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode     = mp.tasks.vision.RunningMode

app = Flask(__name__)
CORS(app)

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


@app.route("/health", methods=["GET"])
def health():
    return jsonify({ "status": "ok", "message": "InterviewQ ML server running" })


if __name__ == "__main__":
    print("🚀 Starting InterviewQ ML server on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)