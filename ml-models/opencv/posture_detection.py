import cv2
import mediapipe as mp
import numpy as np

BaseOptions       = mp.tasks.BaseOptions
PoseLandmarker    = mp.tasks.vision.PoseLandmarker
PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

def analyse_posture(landmarks, h, w):
    """
    Analyses posture using pose landmarks.
    Returns posture score and feedback.
    """
    # ── Key landmarks ─────────────────────────────────────────────────────────
    nose          = landmarks[0]
    left_shoulder = landmarks[11]
    right_shoulder= landmarks[12]
    left_ear      = landmarks[7]
    right_ear     = landmarks[8]

    # ── Shoulder alignment ────────────────────────────────────────────────────
    left_shoulder_y  = left_shoulder.y  * h
    right_shoulder_y = right_shoulder.y * h
    shoulder_diff    = abs(left_shoulder_y - right_shoulder_y)
    shoulder_width   = abs(left_shoulder.x - right_shoulder.x) * w
    shoulder_tilt    = shoulder_diff / shoulder_width if shoulder_width > 0 else 0
    shoulders_level  = shoulder_tilt < 0.08

    # ── Head tilt (ear to shoulder) ───────────────────────────────────────────
    left_ear_y   = left_ear.y  * h
    right_ear_y  = right_ear.y * h
    ear_diff     = abs(left_ear_y - right_ear_y)
    head_tilt    = ear_diff / shoulder_width if shoulder_width > 0 else 0
    head_straight = head_tilt < 0.1

    # ── Head drooping (nose vs shoulder height) ───────────────────────────────
    nose_y          = nose.y * h
    shoulder_avg_y  = (left_shoulder_y + right_shoulder_y) / 2
    nose_shoulder_ratio = (shoulder_avg_y - nose_y) / (shoulder_width if shoulder_width > 0 else 1)
    head_up         = nose_shoulder_ratio > 0.3

    # ── Forward lean (ear vs shoulder horizontal) ─────────────────────────────
    ear_avg_x       = ((left_ear.x + right_ear.x) / 2) * w
    shoulder_avg_x  = ((left_shoulder.x + right_shoulder.x) / 2) * w
    forward_lean    = abs(ear_avg_x - shoulder_avg_x) / shoulder_width if shoulder_width > 0 else 0
    not_leaning     = forward_lean < 0.15

    # ── Posture score (0-100) ──────────────────────────────────────────────────
    score = 100
    if not shoulders_level: score -= 25
    if not head_straight:   score -= 25
    if not head_up:         score -= 25
    if not not_leaning:     score -= 25

    # ── Feedback ──────────────────────────────────────────────────────────────
    issues = []
    if not shoulders_level: issues.append("Level your shoulders")
    if not head_straight:   issues.append("Straighten your head")
    if not head_up:         issues.append("Lift your head up")
    if not not_leaning:     issues.append("Sit back straight")

    feedback = issues[0] if issues else "Good posture!"

    return {
        "score":            score,
        "feedback":         feedback,
        "shoulders_level":  shoulders_level,
        "head_straight":    head_straight,
        "head_up":          head_up,
        "not_leaning":      not_leaning,
        "shoulder_tilt":    round(shoulder_tilt, 3),
        "head_tilt":        round(head_tilt, 3),
        "forward_lean":     round(forward_lean, 3),
    }


def draw_posture_overlay(frame, data, landmarks, h, w):
    """Draws posture feedback on frame."""

    # ── Score color ───────────────────────────────────────────────────────────
    score = data["score"]
    if score >= 75:
        score_color = (0, 200, 0)
    elif score >= 50:
        score_color = (0, 180, 255)
    else:
        score_color = (0, 0, 220)

    # ── Background panel ──────────────────────────────────────────────────────
    cv2.rectangle(frame, (5, 5), (260, 175), (0, 0, 0), -1)

    # ── Score ─────────────────────────────────────────────────────────────────
    cv2.putText(frame, "Posture Score", (10, 22),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    cv2.putText(frame, f"{score}/100", (10, 52),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, score_color, 2)

    # ── Score bar ─────────────────────────────────────────────────────────────
    cv2.rectangle(frame, (10, 60), (240, 74), (50, 50, 50), -1)
    cv2.rectangle(frame, (10, 60), (10 + int(score * 2.3), 74), score_color, -1)

    # ── Checklist ─────────────────────────────────────────────────────────────
    checks = [
        ("Shoulders level", data["shoulders_level"]),
        ("Head straight",   data["head_straight"]),
        ("Head up",         data["head_up"]),
        ("Sitting straight",data["not_leaning"]),
    ]
    for i, (label, ok) in enumerate(checks):
        color  = (0, 200, 0) if ok else (0, 0, 200)
        symbol = "+" if ok else "!"
        cv2.putText(frame, f"[{symbol}] {label}", (10, 95 + i * 18),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.42, color, 1)

    # ── Feedback ──────────────────────────────────────────────────────────────
    fb_color = (0, 200, 0) if score == 100 else (0, 180, 255)
    cv2.putText(frame, data["feedback"], (10, 168),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, fb_color, 1)

    # ── Draw skeleton (shoulders + ears + nose) ───────────────────────────────
    key_indices = [0, 7, 8, 11, 12]
    pts = {}
    for idx in key_indices:
        lm = landmarks[idx]
        pts[idx] = (int(lm.x * w), int(lm.y * h))
        cv2.circle(frame, pts[idx], 5, score_color, -1)

    # Connect shoulders
    cv2.line(frame, pts[11], pts[12], score_color, 2)
    # Connect ears
    cv2.line(frame, pts[7],  pts[8],  score_color, 2)
    # Connect nose to shoulder midpoint
    shoulder_mid = (
        (pts[11][0] + pts[12][0]) // 2,
        (pts[11][1] + pts[12][1]) // 2,
    )
    cv2.line(frame, pts[0], shoulder_mid, score_color, 2)

    return frame


def detect_posture(frame, landmarker):
    # ── Flip mirror image ─────────────────────────────────────────────────────
    frame = cv2.flip(frame, 1)

    rgb      = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result   = landmarker.detect(mp_image)

    if not result.pose_landmarks:
        cv2.putText(frame, "No pose detected - move back", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        return frame, {}

    landmarks = result.pose_landmarks[0]
    h, w, _   = frame.shape
    data      = analyse_posture(landmarks, h, w)

    frame = draw_posture_overlay(frame, data, landmarks, h, w)
    return frame, data


if __name__ == "__main__":
    import os
    import urllib.request

    model_path = "models/pose_landmarker_lite.task"
    if not os.path.exists(model_path):
        print("Downloading pose model...")
        urllib.request.urlretrieve(
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            model_path
        )
        print("Model downloaded")

    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=model_path),
        running_mode=VisionRunningMode.IMAGE,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    print("Posture detection running - press Q to quit")
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  1920)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
    cap.set(cv2.CAP_PROP_FPS, 30)

    with PoseLandmarker.create_from_options(options) as landmarker:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            annotated, data = detect_posture(frame, landmarker)
            cv2.imshow("Posture Detection - InterviewQ", annotated)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()