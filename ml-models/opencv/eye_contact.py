import cv2
import mediapipe as mp
import numpy as np

BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

def check_eye_contact(frame, landmarker):
    """
    Returns:
    - annotated frame
    - True if making eye contact, False if looking away
    - confidence score (0-100)
    """
    rgb      = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result   = landmarker.detect(mp_image)

    if not result.face_landmarks:
        # No face detected
        cv2.putText(frame, "No face detected", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        return frame, False, 0

    landmarks = result.face_landmarks[0]
    h, w, _   = frame.shape

    # Key landmark indices
    # Nose tip = 4, Left eye center = 468, Right eye center = 473
    nose      = landmarks[4]
    left_eye  = landmarks[468] if len(landmarks) > 468 else landmarks[33]
    right_eye = landmarks[473] if len(landmarks) > 473 else landmarks[263]

    nose_x      = nose.x * w
    left_eye_x  = left_eye.x  * w
    right_eye_x = right_eye.x * w
    eye_mid_x   = (left_eye_x + right_eye_x) / 2

    # Calculate yaw (left-right head turn)
    face_width  = abs(right_eye_x - left_eye_x)
    yaw_offset  = abs(nose_x - eye_mid_x)
    yaw_ratio   = yaw_offset / face_width if face_width > 0 else 1

    # Calculate pitch (up-down head tilt)
    nose_y     = nose.y * h
    left_eye_y = left_eye.y  * h
    eye_mid_y  = (left_eye_y + (landmarks[473].y * h if len(landmarks) > 473 else left_eye_y)) / 2
    pitch_offset = abs(nose_y - eye_mid_y)
    pitch_ratio  = pitch_offset / (face_width if face_width > 0 else 1)

    # Eye contact thresholds
    yaw_threshold   = 0.15
    pitch_threshold = 0.6 #the value is changes from 0.3 to 0.6
    making_contact  = yaw_ratio < yaw_threshold and pitch_ratio < pitch_threshold
    confidence      = max(0, int((1 - yaw_ratio) * 100))

    # ── Draw landmarks ──
    nose_pt      = (int(nose_x), int(nose.y * h))
    left_eye_pt  = (int(left_eye_x),  int(left_eye.y  * h))
    right_eye_pt = (int(right_eye_x), int(right_eye.y * h))
    eye_mid_pt   = (int(eye_mid_x),   int(eye_mid_y))

    cv2.circle(frame, nose_pt,      5, (255, 0, 0),   -1)
    cv2.circle(frame, left_eye_pt,  5, (0, 255, 255), -1)
    cv2.circle(frame, right_eye_pt, 5, (0, 255, 255), -1)
    cv2.line(frame, nose_pt, eye_mid_pt, (200, 200, 200), 1)

    # ── Status overlay ──
    color  = (0, 255, 0) if making_contact else (0, 0, 255)
    status = "✓ Eye Contact" if making_contact else "✗ Look at camera"
    cv2.putText(frame, status,              (10, 30),  cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
    cv2.putText(frame, f"Confidence: {confidence}%", (10, 60),  cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 1)
    cv2.putText(frame, f"Yaw: {yaw_ratio:.2f}",      (10, 85),  cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180,180,180), 1)
    cv2.putText(frame, f"Pitch: {pitch_ratio:.2f}",  (10, 105), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180,180,180), 1)

    return frame, making_contact, confidence


# ── Test via webcam ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    options = FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path="models/face_landmarker.task"),
        running_mode=VisionRunningMode.IMAGE,
        num_faces=1,
    )

    # Download model if not present
    import os
    if not os.path.exists("models/face_landmarker.task"):
        print("Downloading face landmarker model...")
        import urllib.request
        urllib.request.urlretrieve(
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            "models/face_landmarker.task"
        )
        print("✅ Model downloaded")

    print("✅ Eye contact detection running — press Q to quit")
    cap = cv2.VideoCapture(0)

    with FaceLandmarker.create_from_options(options) as landmarker:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            annotated, eye_contact, confidence = check_eye_contact(frame, landmarker)
            cv2.imshow("Eye Contact Detection — InterviewQ", annotated)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()