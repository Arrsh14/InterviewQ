import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write

SAMPLE_RATE = 16000

print("Recording 5 seconds — speak loudly into your mic...")
audio = sd.rec(int(5 * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype='int16', device=0)
sd.wait()

print(f"Max volume level: {np.max(np.abs(audio))}")
print(f"Average volume level: {np.mean(np.abs(audio))}")

if np.max(np.abs(audio)) < 100:
    print("❌ Mic is not capturing audio — volume too low!")
else:
    print("✅ Mic is capturing audio fine!")