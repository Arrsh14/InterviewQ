import cv2
import mediapipe as mp

# ── MediaPipe new API setup ────────────────────────────────────────────────────
BaseOptions = mp.tasks.BaseOptions
FaceDetector = mp.tasks.vision.FaceDetector
FaceDetectorOptions = mp.tasks.vision.FaceDetectorOptions
VisionRunningMode = mp.tasks.vision.RunningMode

def detect_faces_frame(frame, detector):
    """
    Takes a video frame and detector, returns:
    - annotated frame with boxes drawn
    - list of detected face bounding boxes
    - face count
    """
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = detector.detect(mp_image)

    faces = []
    for detection in result.detections:
        box = detection.bounding_box
        x, y = box.origin_x, box.origin_y
        w, h = box.width, box.height
        faces.append({ "x": x, "y": y, "width": w, "height": h })
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        score = detection.categories[0].score if detection.categories else 0
        cv2.putText(frame, f"{int(score * 100)}%", (x, y - 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

    return frame, faces, len(faces)


# ── Test via webcam ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    options = FaceDetectorOptions(
        base_options=BaseOptions(model_asset_path="models/blaze_face_short_range.tflite"),
        running_mode=VisionRunningMode.IMAGE,
    )

    print("✅ Face detection running — press Q to quit")
    cap = cv2.VideoCapture(0)

    with FaceDetector.create_from_options(options) as detector:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            annotated, faces, count = detect_faces_frame(frame, detector)
            cv2.putText(annotated, f"Faces: {count}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.imshow("Face Detection — InterviewQ", annotated)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()