import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf

BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

# Load your trained model
MODEL_PATH = "../emotion_model.h5"
emotion_model = tf.keras.models.load_model(MODEL_PATH)

EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

INTERVIEW_LABELS = {
    'Angry':    ('Aggressive',        (0, 0, 200)),
    'Disgust':  ('Disengaged',        (0, 100, 200)),
    'Fear':     ('Nervous / Anxious', (50, 50, 220)),
    'Happy':    ('Confident & Positive', (0, 200, 0)),
    'Sad':      ('Low Energy',        (80, 80, 200)),
    'Surprise': ('Highly Engaged',    (0, 200, 200)),
    'Neutral':  ('Calm & Composed',   (0, 180, 255)),
}

def predict_emotion(face_roi):
    try:
        face = cv2.resize(face_roi, (48, 48))
        face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
        face = face.astype('float32') / 255.0
        face = np.reshape(face, (1, 48, 48, 1))
        prediction = emotion_model.predict(face, verbose=0)
        confidence = float(np.max(prediction))
        
        # Only show emotion if confidence is above 50%
        # Otherwise default to Neutral
        if confidence < 0.50:
            return "Neutral", confidence
            
        emotion = EMOTIONS[np.argmax(prediction)]
        return emotion, confidence
    except:
        return "Neutral", 0.0


def detect_emotion(frame, landmarker):
    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = landmarker.detect(mp_image)

    if not result.face_landmarks:
        cv2.putText(frame, "No face detected", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        return frame, None, None

    landmarks = result.face_landmarks[0]
    h, w, _ = frame.shape

    # Get face bounding box from landmarks
    x_coords = [int(lm.x * w) for lm in landmarks]
    y_coords = [int(lm.y * h) for lm in landmarks]
    x1, x2 = max(0, min(x_coords) - 20), min(w, max(x_coords) + 20)
    y1, y2 = max(0, min(y_coords) - 20), min(h, max(y_coords) + 20)

    # Crop face and predict emotion
    face_roi = frame[y1:y2, x1:x2]
    emotion, confidence = predict_emotion(face_roi)

    # Get interview label and color
    label, color = INTERVIEW_LABELS.get(emotion, ('Calm & Composed', (0, 180, 255)))

    # Draw results on frame
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
    cv2.rectangle(frame, (5, 5), (400, 80), (0, 0, 0), -1)
    cv2.putText(frame, f"Emotion  : {emotion} ({confidence*100:.0f}%)", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.75, color, 2)
    cv2.putText(frame, f"Interview: {label}", (10, 58),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 1)

    return frame, emotion, label


if __name__ == "__main__":
    import os
    if not os.path.exists("models/face_landmarker.task"):
        print("Downloading face landmarker model...")
        import urllib.request
        urllib.request.urlretrieve(
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            "models/face_landmarker.task"
        )
        print("Model downloaded")

    options = FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path="models/face_landmarker.task"),
        running_mode=VisionRunningMode.IMAGE,
        num_faces=1,
    )

    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
    cap.set(cv2.CAP_PROP_FPS, 30)

    print("Emotion detection running - press Q to quit")

    with FaceLandmarker.create_from_options(options) as landmarker:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            annotated, emotion, label = detect_emotion(frame, landmarker)
            cv2.imshow("Emotion Detection - InterviewQ", annotated)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()