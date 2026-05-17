import numpy as np
import librosa
import time
import re

# ── Weak/uncertain words that signal low confidence ───────────────────────────
WEAK_WORDS = [
    "maybe", "possibly", "perhaps", "i guess", "i think", "i believe",
    "not sure", "kind of", "sort of", "i mean", "hopefully", "probably",
    "i suppose", "i feel like", "i'm not certain", "i don't know"
]

# ── Session tracker ───────────────────────────────────────────────────────────
class ConfidenceTracker:
    def __init__(self):
        self.weak_word_count    = 0
        self.total_words        = 0
        self.total_pauses       = 0
        self.long_pauses        = 0
        self.speaking_rates     = []
        self.volume_drops       = 0
        self.start_time         = time.time()
        self.chunk_scores       = []

    def elapsed_minutes(self):
        return max((time.time() - self.start_time) / 60, 0.01)

    # ── Text analysis ─────────────────────────────────────────────────────────
    def analyze_text(self, text):
        """Analyze transcript chunk for confidence signals"""
        if not text.strip():
            return {}

        text_lower  = text.lower()
        words       = text_lower.split()
        word_count  = len(words)
        self.total_words += word_count

        # Count weak words
        weak_found = []
        for phrase in WEAK_WORDS:
            count = text_lower.count(phrase)
            if count > 0:
                self.weak_word_count += count
                weak_found.append((phrase, count))

        # Check for very short answers (low confidence signal)
        is_short_answer = word_count < 10

        # Check for repetition (nervousness signal)
        repeated = []
        for i in range(len(words) - 1):
            if words[i] == words[i+1] and len(words[i]) > 2:
                repeated.append(words[i])

        return {
            "word_count":     word_count,
            "weak_found":     weak_found,
            "is_short":       is_short_answer,
            "repeated_words": repeated,
        }

    # ── Audio analysis ────────────────────────────────────────────────────────
    def analyze_audio(self, audio_data, sample_rate=16000):
        """Analyze raw audio chunk for confidence signals"""
        if audio_data is None or len(audio_data) == 0:
            return {}

        # Convert to float
        audio_float = audio_data.astype(np.float32) / 32768.0
        audio_float = audio_float.flatten()

        # ── Speaking rate (words per minute estimate) ─────────────────────────
        # Count syllables roughly using zero crossing rate
        zcr          = librosa.feature.zero_crossing_rate(audio_float)[0]
        avg_zcr      = np.mean(zcr)
        speaking_rate = avg_zcr * 200  # rough WPM estimate
        self.speaking_rates.append(speaking_rate)

        # ── Pause detection ───────────────────────────────────────────────────
        # Find silent regions (pauses)
        rms          = librosa.feature.rms(y=audio_float)[0]
        silence_mask = rms < 0.01  # below this = silence
        pause_count  = 0
        long_pause   = 0
        in_pause     = False
        pause_length = 0

        for is_silent in silence_mask:
            if is_silent:
                if not in_pause:
                    in_pause     = True
                    pause_length = 0
                pause_length += 1
            else:
                if in_pause:
                    pause_count += 1
                    if pause_length > 10:  # long pause threshold
                        long_pause += 1
                in_pause     = False
                pause_length = 0

        self.total_pauses += pause_count
        self.long_pauses  += long_pause

        # ── Volume consistency (trailing off) ─────────────────────────────────
        if len(rms) > 10:
            first_half_vol  = np.mean(rms[:len(rms)//2])
            second_half_vol = np.mean(rms[len(rms)//2:])
            if first_half_vol > 0 and second_half_vol < first_half_vol * 0.5:
                self.volume_drops += 1

        return {
            "speaking_rate": round(speaking_rate, 1),
            "pauses":        pause_count,
            "long_pauses":   long_pause,
        }

    # ── Combined confidence score ─────────────────────────────────────────────
    def confidence_score(self):
        score = 10  # start at 10 and deduct

        # Deduct for weak words
        weak_rate = self.weak_word_count / max(self.total_words, 1) * 100
        if weak_rate > 10:   score -= 3
        elif weak_rate > 5:  score -= 2
        elif weak_rate > 2:  score -= 1

        # Deduct for long pauses
        if self.long_pauses > 10:  score -= 3
        elif self.long_pauses > 5: score -= 2
        elif self.long_pauses > 2: score -= 1

        # Deduct for volume drops
        if self.volume_drops > 5:  score -= 2
        elif self.volume_drops > 2: score -= 1

        # Deduct for speaking rate issues
        if self.speaking_rates:
            avg_rate = np.mean(self.speaking_rates)
            if avg_rate < 20 or avg_rate > 180:  score -= 1

        return max(score, 1)  # minimum score is 1

    def speaking_pace(self):
        if not self.speaking_rates:
            return "Unknown"
        avg = np.mean(self.speaking_rates)
        if avg < 30:   return "Too Slow"
        elif avg > 150: return "Too Fast"
        else:           return "Good Pace"

    def get_live_feedback(self):
        score = self.confidence_score()
        if score >= 8:   return "Highly Confident", (0, 200, 0)
        elif score >= 6: return "Fairly Confident", (0, 180, 100)
        elif score >= 4: return "Somewhat Nervous", (0, 140, 255)
        else:            return "Very Nervous",     (0, 0, 220)

    def session_summary(self):
        label, _ = self.get_live_feedback()
        print("\n" + "="*50)
        print("     CONFIDENCE ANALYSIS SESSION SUMMARY")
        print("="*50)
        print(f"Confidence score    : {self.confidence_score()}/10")
        print(f"Overall assessment  : {label}")
        print(f"Speaking pace       : {self.speaking_pace()}")
        print(f"Weak words used     : {self.weak_word_count}")
        print(f"Long pauses         : {self.long_pauses}")
        print(f"Volume drops        : {self.volume_drops}")
        print(f"Session duration    : {round(self.elapsed_minutes(), 1)} mins")
        print("="*50)


def get_live_stats(tracker):
    """Call this from other files to get current confidence stats"""
    label, color = tracker.get_live_feedback()
    return {
        "confidence_score": tracker.confidence_score(),
        "confidence_label": label,
        "speaking_pace":    tracker.speaking_pace(),
        "weak_words":       tracker.weak_word_count,
        "long_pauses":      tracker.long_pauses,
    }


# ── Run standalone for testing ────────────────────────────────────────────────
if __name__ == "__main__":
    import sounddevice as sd
    import whisper
    from scipy.io.wavfile import write
    import tempfile, os

    SAMPLE_RATE    = 16000
    CHUNK_DURATION = 10

    print("Loading Whisper model...")
    model   = whisper.load_model("base")
    tracker = ConfidenceTracker()
    print("Ready! Speak into your mic. Press Ctrl+C to stop.\n")

    try:
        while True:
            print("🎤 Recording 10 seconds — speak naturally...")
            audio = sd.rec(
                int(CHUNK_DURATION * SAMPLE_RATE),
                samplerate=SAMPLE_RATE,
                channels=1,
                dtype='int16',
                device=0
            )
            sd.wait()

            # Analyze audio
            audio_stats = tracker.analyze_audio(audio, SAMPLE_RATE)

            # Transcribe
            audio_float      = audio.astype(np.float32) / 32768.0
            audio_normalized = audio_float / (np.max(np.abs(audio_float)) + 1e-9) * 0.9
            audio_int        = (audio_normalized * 32768).astype(np.int16)

            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp_path = tmp.name
                write(tmp_path, SAMPLE_RATE, audio_int)

            result = model.transcribe(tmp_path, language="en", fp16=False,
                                      condition_on_previous_text=False)
            text   = result["text"].strip()
            os.remove(tmp_path)

            # Analyze text
            text_stats = tracker.analyze_text(text)

            # Print live feedback
            label, _ = tracker.get_live_feedback()
            print(f"\n📝 Heard       : {text}")
            print(f"🎯 Confidence  : {tracker.confidence_score()}/10 — {label}")
            print(f"🗣️  Pace        : {tracker.speaking_pace()}")
            print(f"⏸️  Long pauses : {tracker.long_pauses}")
            if text_stats.get("weak_found"):
                print(f"⚠️  Weak words  : {text_stats['weak_found']}")
            print()

    except KeyboardInterrupt:
        pass
    finally:
        tracker.session_summary()