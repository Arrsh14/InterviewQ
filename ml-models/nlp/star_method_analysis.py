from google import genai
from dotenv import load_dotenv
import os
import time

# ── Load API key from .env ────────────────────────────────────────────────────
load_dotenv(dotenv_path="/Users/arrshtripathi/Desktop/interviewiq/backend/.env")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# ── Model priority list — falls back automatically if quota hit ───────────────
MODELS = [
    "models/gemini-2.0-flash-lite",  # primary  — lightest, highest free quota
    "models/gemini-2.0-flash",       # fallback — standard
    "models/gemini-2.5-flash",       # last resort — most capable
]

# ── STAR method components ────────────────────────────────────────────────────
STAR_COMPONENTS = ["Situation", "Task", "Action", "Result"]

# ── Session tracker ───────────────────────────────────────────────────────────
class STARTracker:
    def __init__(self):
        self.analyses        = []
        self.total_score     = 0
        self.analysis_count  = 0
        self.start_time      = time.time()
        self.active_model    = MODELS[0]  # track which model is currently working

    def elapsed_minutes(self):
        return max((time.time() - self.start_time) / 60, 0.01)

    def _call_with_retry(self, prompt, max_retries=3):
        """
        Try each model in order.
        If rate-limited, wait and retry up to max_retries times.
        Returns (response_text, model_used) or (None, None) if all fail.
        """
        for model in MODELS:
            for attempt in range(max_retries):
                try:
                    response = client.models.generate_content(
                        model=model,
                        contents=prompt,
                    )
                    self.active_model = model  # remember what worked
                    return response.text.strip(), model

                except Exception as e:
                    error_str = str(e)

                    # Rate limit — wait then retry same model
                    if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                        # Extract suggested retry delay from error if present
                        wait_time = 30 * (attempt + 1)  # 30s, 60s, 90s
                        if "retryDelay" in error_str:
                            try:
                                import re
                                match = re.search(r"'retryDelay': '(\d+)s'", error_str)
                                if match:
                                    wait_time = int(match.group(1)) + 2
                            except:
                                pass

                        if attempt < max_retries - 1:
                            print(f"⏳ {model} rate limited. Waiting {wait_time}s before retry {attempt + 2}/{max_retries}...")
                            time.sleep(wait_time)
                        else:
                            print(f"❌ {model} quota exhausted — trying next model...")
                            break  # move to next model

                    # API key or auth error — no point retrying
                    elif "401" in error_str or "403" in error_str or "API_KEY" in error_str:
                        print(f"🔑 API key error: {e}")
                        return None, None

                    # Other error — log and try next model
                    else:
                        print(f"⚠️  {model} error: {e}")
                        break

        print("❌ All models exhausted. Try again later.")
        return None, None

    def analyze_text(self, text):
        """Send transcript to Gemini and check for STAR structure"""
        if not text.strip() or len(text.split()) < 15:
            print("⚠️  Answer too short — please give at least 15 words.")
            return None

        prompt = f"""
You are an interview coach analyzing a candidate's answer for STAR method structure.

STAR method means:
- Situation: Did they describe the background/context?
- Task: Did they explain what their responsibility was?
- Action: Did they describe the specific steps they took?
- Result: Did they mention the outcome or impact?

Candidate's answer:
\"\"\"{text}\"\"\"

Analyze this answer and respond in this EXACT format:
SITUATION: yes/no/partial
TASK: yes/no/partial
ACTION: yes/no/partial
RESULT: yes/no/partial
SCORE: X/10
FEEDBACK: one sentence of specific feedback
MISSING: what component is missing or weakest
"""
        raw, model_used = self._call_with_retry(prompt)

        if raw is None:
            return None

        if model_used != MODELS[0]:
            print(f"ℹ️  Used fallback model: {model_used}")

        return self.parse_response(raw, text)

    def parse_response(self, raw, original_text):
        """Parse Gemini's response into structured data"""
        result = {
            "text":      original_text,
            "situation": "unknown",
            "task":      "unknown",
            "action":    "unknown",
            "result":    "unknown",
            "score":     5,
            "feedback":  "",
            "missing":   "",
        }

        for line in raw.split("\n"):
            line = line.strip()
            if line.startswith("SITUATION:"):
                result["situation"] = line.split(":", 1)[1].strip().lower()
            elif line.startswith("TASK:"):
                result["task"]      = line.split(":", 1)[1].strip().lower()
            elif line.startswith("ACTION:"):
                result["action"]    = line.split(":", 1)[1].strip().lower()
            elif line.startswith("RESULT:"):
                result["result"]    = line.split(":", 1)[1].strip().lower()
            elif line.startswith("SCORE:"):
                try:
                    score_str       = line.split(":", 1)[1].strip()
                    result["score"] = int(score_str.split("/")[0])
                except:
                    result["score"] = 5
            elif line.startswith("FEEDBACK:"):
                result["feedback"]  = line.split(":", 1)[1].strip()
            elif line.startswith("MISSING:"):
                result["missing"]   = line.split(":", 1)[1].strip()

        self.analyses.append(result)
        self.total_score    += result["score"]
        self.analysis_count += 1

        return result

    def average_score(self):
        if self.analysis_count == 0:
            return 0
        return round(self.total_score / self.analysis_count, 1)

    def print_analysis(self, result):
        if not result:
            return
        print("\n" + "─" * 50)
        print("📊 STAR METHOD ANALYSIS")
        print("─" * 50)
        print(f"  Situation : {'✅' if result['situation'] == 'yes' else '⚠️ ' if result['situation'] == 'partial' else '❌'} {result['situation']}")
        print(f"  Task      : {'✅' if result['task']      == 'yes' else '⚠️ ' if result['task']      == 'partial' else '❌'} {result['task']}")
        print(f"  Action    : {'✅' if result['action']    == 'yes' else '⚠️ ' if result['action']    == 'partial' else '❌'} {result['action']}")
        print(f"  Result    : {'✅' if result['result']    == 'yes' else '⚠️ ' if result['result']    == 'partial' else '❌'} {result['result']}")
        print(f"\n  Score     : {result['score']}/10")
        print(f"  Feedback  : {result['feedback']}")
        if result["missing"]:
            print(f"  Missing   : {result['missing']}")
        print(f"  Model     : {self.active_model}")
        print("─" * 50)

    def session_summary(self):
        print("\n" + "=" * 50)
        print("      STAR METHOD SESSION SUMMARY")
        print("=" * 50)
        print(f"Answers analyzed    : {self.analysis_count}")
        print(f"Average STAR score  : {self.average_score()}/10")
        print(f"Session duration    : {round(self.elapsed_minutes(), 1)} mins")
        print(f"Model used          : {self.active_model}")

        if self.analyses:
            print("\nAll answers breakdown:")
            for i, a in enumerate(self.analyses, 1):
                print(f"\n  Answer {i} — Score: {a['score']}/10")
                print(f"  Feedback: {a['feedback']}")
        print("=" * 50)


def get_live_stats(tracker):
    """Call this from other files to get current STAR stats"""
    return {
        "average_score":   tracker.average_score(),
        "analysis_count":  tracker.analysis_count,
        "latest_analysis": tracker.analyses[-1] if tracker.analyses else None,
        "active_model":    tracker.active_model,
    }


# ── Run standalone for testing ────────────────────────────────────────────────
if __name__ == "__main__":
    print("STAR Method Analyzer ready!")
    print(f"Primary model : {MODELS[0]}")
    print(f"Fallback model: {MODELS[1]}")
    print("Paste your interview answer below.")
    print("Type 'quit' to exit.\n")

    tracker = STARTracker()

    while True:
        print("─" * 50)
        text = input("Your answer: ")
        if text.lower() == "quit":
            break
        if not text.strip():
            continue

        print("Analyzing with Gemini...")
        result = tracker.analyze_text(text)
        tracker.print_analysis(result)

    tracker.session_summary()