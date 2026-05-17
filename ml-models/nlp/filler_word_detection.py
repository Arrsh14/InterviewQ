import whisper
import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write
import tempfile
import os
import time
import threading

# ── Configuration ─────────────────────────────────────────────────────────────
SAMPLE_RATE     = 16000   # Whisper works best at 16kHz
CHUNK_DURATION  = 10      # Record 10 Seconds at a time then transcribe
MODEL_SIZE      = "base"  # base = fast + accurate enough. Options: tiny, base, small, medium

# ── Filler words to detect ────────────────────────────────────────────────────
FILLER_WORDS = [
    "um", "umm", "uh", "uhh", "like", "you know", "basically",
    "literally", "actually", "so", "right", "okay", "hmm",
    "kind of", "sort of", "i mean", "you see", "well"
]

# ── Session tracker ───────────────────────────────────────────────────────────
class FillerTracker:
    def __init__(self):
        self.total_fillers     = 0
        self.filler_counts     = {word: 0 for word in FILLER_WORDS}
        self.full_transcript   = ""
        self.start_time        = time.time()
        self.is_running        = False

    def elapsed_minutes(self):
        return max((time.time() - self.start_time) / 60, 0.01)

    def fillers_per_minute(self):
        return round(self.total_fillers / self.elapsed_minutes(), 1)

    def filler_score(self):
        # Score out of 10 based on fillers per minute
        # 0-1 per min = 10/10, 1-2 = 8/10, 2-4 = 6/10, 4-6 = 4/10, 6+ = 2/10
        fpm = self.fillers_per_minute()
        if fpm <= 1:   return 10
        elif fpm <= 2: return 8
        elif fpm <= 4: return 6
        elif fpm <= 6: return 4
        else:          return 2

    def top_fillers(self, n=3):
        sorted_fillers = sorted(
            self.filler_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )
        return [(w, c) for w, c in sorted_fillers if c > 0][:n]

    def process_transcript(self, text):
        text_lower = text.lower()
        self.full_transcript += " " + text_lower

        for filler in FILLER_WORDS:
            count = text_lower.count(filler)
            if count > 0:
                self.filler_counts[filler] += count
                self.total_fillers         += count

        return text_lower

    def session_summary(self):
        print("\n" + "="*50)
        print("       FILLER WORD SESSION SUMMARY")
        print("="*50)
        print(f"Total fillers detected : {self.total_fillers}")
        print(f"Fillers per minute     : {self.fillers_per_minute()}")
        print(f"Filler score           : {self.filler_score()}/10")
        print(f"Session duration       : {round(self.elapsed_minutes(), 1)} mins")
        print("\nTop filler words used:")
        for word, count in self.top_fillers(5):
            print(f"  '{word}' → {count} times")
        print("="*50)


# ── Core functions ────────────────────────────────────────────────────────────
def record_chunk(duration=CHUNK_DURATION, sample_rate=SAMPLE_RATE):
    """Record a chunk of audio from microphone"""
    audio = sd.rec(
        int(duration * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype='int16'
    )
    sd.wait()
    return audio

def transcribe_chunk(audio, model, sample_rate=SAMPLE_RATE):
    """Save audio chunk to temp file and transcribe with Whisper"""

    # Normalize audio volume
    audio_float = audio.astype(np.float32) / 32768.0
    audio_float = audio_float.flatten()

    max_val = np.max(np.abs(audio_float))
    if max_val > 0:
        audio_float = audio_float / max_val * 0.9

    audio_normalized = (audio_float * 32768).astype(np.int16)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = tmp.name
        write(tmp_path, sample_rate, audio_normalized)

    try:
        result = model.transcribe(
            tmp_path,
            language="en",
            fp16=False,
            condition_on_previous_text=False
        )
        text = result["text"].strip()
    except Exception as e:
        print(f"Transcription error: {e}")
        text = ""
    finally:
        os.remove(tmp_path)

    return text



def start_filler_detection(tracker, model, stop_event):
    """Main loop — keeps recording and transcribing until stopped"""
    print("🎤 Listening for filler words... (press Ctrl+C or call stop to end)")

    while not stop_event.is_set():
        try:
            # Record chunk
            audio = record_chunk()

            # Transcribe
            text = transcribe_chunk(audio, model)

            if text:
                # Process and count fillers
                tracker.process_transcript(text)

                # Print live feedback
                print(f"\n📝 Heard: {text}")
                print(f"📊 Fillers so far: {tracker.total_fillers} "
                      f"| Per min: {tracker.fillers_per_minute()} "
                      f"| Score: {tracker.filler_score()}/10")

                # Warn if too many fillers
                if tracker.fillers_per_minute() > 4:
                    print("⚠️  Too many filler words — slow down and think before speaking!")

        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error: {e}")
            continue


def get_live_stats(tracker):
    """Call this from other files to get current filler stats"""
    return {
        "total_fillers":     tracker.total_fillers,
        "fillers_per_minute": tracker.fillers_per_minute(),
        "filler_score":      tracker.filler_score(),
        "top_fillers":       tracker.top_fillers(),
        "transcript":        tracker.full_transcript.strip(),
    }


# ── Run standalone ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Loading Whisper model... (first time takes 1-2 mins to download)")
    model = whisper.load_model(MODEL_SIZE)
    print(f"Whisper '{MODEL_SIZE}' model loaded!")

    tracker    = FillerTracker()
    stop_event = threading.Event()

    try:
        start_filler_detection(tracker, model, stop_event)
    except KeyboardInterrupt:
        pass
    finally:
        stop_event.set()
        tracker.session_summary()