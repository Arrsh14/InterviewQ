import whisper
import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write
import tempfile, os

SAMPLE_RATE = 16000

print("Loading model...")
model = whisper.load_model("base")
print("Model loaded! Recording 5 seconds — say something with umm and like...")

audio = sd.rec(int(5 * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype='int16', device=0)
sd.wait()
print("Recording done! Transcribing...")

# Normalize audio volume
audio_float = audio.astype(np.float32) / 32768.0
audio_float = audio_float.flatten()

# Boost volume if too quiet
max_val = np.max(np.abs(audio_float))
if max_val > 0:
    audio_float = audio_float / max_val * 0.9

# Convert back to int16
audio_normalized = (audio_float * 32768).astype(np.int16)

with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
    tmp_path = tmp.name
    write(tmp_path, SAMPLE_RATE, audio_normalized)

result = model.transcribe(
    tmp_path,
    language="en",
    fp16=False,
    condition_on_previous_text=False,
    verbose=True
)
print(f"Transcribed text: '{result['text']}'")
os.remove(tmp_path)