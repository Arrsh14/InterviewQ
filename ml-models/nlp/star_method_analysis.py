from google import genai
from dotenv import load_dotenv
import os
import time
import re

# ── Load API key ──────────────────────────────────────────────────────────────
load_dotenv(dotenv_path="/Users/arrshtripathi/Desktop/interviewiq/backend/.env")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.0-flash-lite"

# ── Session tracker ───────────────────────────────────────────────────────────
class STARTracker:
    def __init__(self):
        self.analyses       = []
        self.total_score    = 0
        self.analysis_count = 0
        self.start_time     = time.time()

    def elapsed_minutes(self):
        return max((time.time() - self.start_time) / 60, 0.01)

    def average_score(self):
        if self.analysis_count == 0:
            return 0
        return round(self.total_score / self.analysis_count, 1)

    def analyze(self, question, answer):
        """Send question + answer to Gemini for STAR + relevance analysis"""
        if not answer.strip() or len(answer.split()) < 10:
            return None

        prompt = f"""You are an expert interview coach. Analyze the candidate's answer below.

QUESTION: {question}

CANDIDATE'S ANSWER: {answer}

Evaluate on two things:

1. STAR METHOD — Does the answer follow Situation, Task, Action, Result structure?
2. RELEVANCE — Is the answer actually relevant to the question asked?

Respond in this EXACT format with no extra text:
SITUATION: yes/no/partial
TASK: yes/no/partial
ACTION: yes/no/partial
RESULT: yes/no/partial
RELEVANCE: yes/no/partial
STAR_SCORE: X
RELEVANCE_SCORE: X
OVERALL_SCORE: X
FEEDBACK: write one sentence of specific feedback here
IMPROVEMENT: write one specific thing they should improve here

All scores are out of 10. Be strict but fair."""

        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt
            )
            raw = response.text.strip()
            return self._parse(raw, question, answer)
        except Exception as e:
            print(f"Gemini error: {e}")
            return None

    def _parse(self, raw, question, answer):
        """Parse Gemini response into structured dict"""
        result = {
            "question":        question,
            "answer":          answer,
            "situation":       "unknown",
            "task":            "unknown",
            "action":          "unknown",
            "result":          "unknown",
            "relevance":       "unknown",
            "star_score":      5,
            "relevance_score": 5,
            "overall_score":   5,
            "feedback":        "",
            "improvement":     "",
        }

        for line in raw.split("\n"):
            line = line.strip()
            if not line or ":" not in line:
                continue
            key, _, value = line.partition(":")
            key   = key.strip().upper()
            value = value.strip()

            if key == "SITUATION":         result["situation"]       = value.lower()
            elif key == "TASK":            result["task"]            = value.lower()
            elif key == "ACTION":          result["action"]          = value.lower()
            elif key == "RESULT":          result["result"]          = value.lower()
            elif key == "RELEVANCE":       result["relevance"]       = value.lower()
            elif key == "STAR_SCORE":
                try: result["star_score"]      = int(re.search(r'\d+', value).group())
                except: pass
            elif key == "RELEVANCE_SCORE":
                try: result["relevance_score"] = int(re.search(r'\d+', value).group())
                except: pass
            elif key == "OVERALL_SCORE":
                try: result["overall_score"]   = int(re.search(r'\d+', value).group())
                except: pass
            elif key == "FEEDBACK":        result["feedback"]        = value
            elif key == "IMPROVEMENT":     result["improvement"]     = value

        self.analyses.append(result)
        self.total_score    += result["overall_score"]
        self.analysis_count += 1

        return result

    def print_result(self, result):
        if not result:
            print("Answer too short to analyze.")
            return

        print("\n" + "-"*55)
        print("STAR + RELEVANCE ANALYSIS")
        print("-"*55)

        icons = {"yes": "YES", "partial": "PARTIAL", "no": "NO", "unknown": "?"}
        print(f"  Situation  : {icons.get(result['situation'],  '?')} ")
        print(f"  Task       : {icons.get(result['task'],       '?')} ")
        print(f"  Action     : {icons.get(result['action'],     '?')} ")
        print(f"  Result     : {icons.get(result['result'],     '?')} ")
        print(f"  Relevance  : {icons.get(result['relevance'],  '?')} ")

        print(f"\n  STAR Score      : {result['star_score']}/10")
        print(f"  Relevance Score : {result['relevance_score']}/10")
        print(f"  Overall Score   : {result['overall_score']}/10")
        print(f"\n  Feedback    : {result['feedback']}")
        print(f"  Improve     : {result['improvement']}")
        print("-"*55)

    def session_summary(self):
        print("\n" + "="*55)
        print("        STAR METHOD SESSION SUMMARY")
        print("="*55)
        print(f"  Answers analyzed  : {self.analysis_count}")
        print(f"  Average score     : {self.average_score()}/10")
        print(f"  Session duration  : {round(self.elapsed_minutes(), 1)} mins")

        if self.analyses:
            print("\n  Per answer breakdown:")
            for i, a in enumerate(self.analyses, 1):
                print(f"\n  Answer {i}:")
                print(f"    Overall  : {a['overall_score']}/10")
                print(f"    Relevance: {a['relevance_score']}/10")
                print(f"    Feedback : {a['feedback']}")
        print("="*55)


def get_live_stats(tracker):
    """Call this from Flask app to get current STAR stats"""
    return {
        "average_score":   tracker.average_score(),
        "analysis_count":  tracker.analysis_count,
        "latest_analysis": tracker.analyses[-1] if tracker.analyses else None,
    }


# ── Standalone test ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("STAR + Relevance Analyzer ready!")
    print("Type 'quit' to exit and see summary.\n")

    tracker = STARTracker()

    while True:
        print("-"*55)
        question = input("Question : ").strip()
        if question.lower() == "quit":
            break
        if not question:
            continue

        answer = input("Answer   : ").strip()
        if answer.lower() == "quit":
            break
        if not answer:
            continue

        print("\nAnalyzing with Gemini...")
        result = tracker.analyze(question, answer)
        tracker.print_result(result)

    tracker.session_summary()