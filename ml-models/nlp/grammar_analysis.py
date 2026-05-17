import language_tool_python
import time

# ── Grammar checker setup ─────────────────────────────────────────────────────
# Loads once and reuses — don't create this inside a loop
tool = language_tool_python.LanguageTool('en-US')

# ── Error categories we care about for interviews ─────────────────────────────
IMPORTANT_CATEGORIES = [
    "GRAMMAR",
    "TYPOS",
    "CONFUSED_WORDS",
    "REDUNDANCY",
    "STYLE",
]

# ── Session tracker ───────────────────────────────────────────────────────────
class GrammarTracker:
    def __init__(self):
        self.total_errors      = 0
        self.error_log         = []
        self.full_transcript   = ""
        self.start_time        = time.time()

    def elapsed_minutes(self):
        return max((time.time() - self.start_time) / 60, 0.01)

    def grammar_score(self):
    # Score out of 10 based on total errors in whole session
    # 0 errors = 10, 1-2 = 8, 3-4 = 6, 5-7 = 4, 8+ = 2
        if self.total_errors == 0:   return 10
        elif self.total_errors <= 2: return 8
        elif self.total_errors <= 4: return 6
        elif self.total_errors <= 7: return 4
        else:                        return 2

    def analyze_text(self, text):
        """Analyze a chunk of transcript for grammar errors"""
        if not text.strip():
            return []

        self.full_transcript += " " + text
        matches = tool.check(text)

        # Filter only important categories
        errors = []
        for match in matches:
            if any(cat in match.rule_id for cat in IMPORTANT_CATEGORIES) or \
               match.category in IMPORTANT_CATEGORIES:
                error = {
                    "mistake":     text[match.offset: match.offset + match.error_length],
                    "message":     match.message,
                    "suggestions": match.replacements[:3],
                    "category":    match.category,
                }
                errors.append(error)
                self.error_log.append(error)
                self.total_errors += 1

        return errors

    def session_summary(self):
        print("\n" + "="*50)
        print("       GRAMMAR ANALYSIS SESSION SUMMARY")
        print("="*50)
        print(f"Total grammar errors   : {self.total_errors}")
        print(f"Grammar score          : {self.grammar_score()}/10")
        print(f"Session duration       : {round(self.elapsed_minutes(), 1)} mins")

        if self.error_log:
            print("\nErrors found:")
            for i, error in enumerate(self.error_log[:10], 1):
                print(f"\n  {i}. Mistake   : '{error['mistake']}'")
                print(f"     Problem   : {error['message']}")
                if error['suggestions']:
                    print(f"     Suggestion: {', '.join(error['suggestions'])}")
        else:
            print("\n✅ No grammar errors detected — great job!")
        print("="*50)


def get_live_stats(tracker):
    """Call this from other files to get current grammar stats"""
    return {
        "total_errors":  tracker.total_errors,
        "grammar_score": tracker.grammar_score(),
        "recent_errors": tracker.error_log[-3:] if tracker.error_log else [],
    }


# ── Run standalone for testing ────────────────────────────────────────────────
if __name__ == "__main__":
    print("Loading grammar tool... (first time takes 30-60 seconds)")
    tracker = GrammarTracker()
    print("Grammar tool ready!")
    print("\nType or paste sentences to check grammar.")
    print("Type 'quit' to exit and see summary.\n")

    while True:
        text = input("Enter text: ")
        if text.lower() == "quit":
            break
        if not text.strip():
            continue

        errors = tracker.analyze_text(text)

        if errors:
            print(f"\n❌ Found {len(errors)} grammar issue(s):")
            for error in errors:
                print(f"   Mistake   : '{error['mistake']}'")
                print(f"   Problem   : {error['message']}")
                if error['suggestions']:
                    print(f"   Fix it    : {', '.join(error['suggestions'])}")
                print()
        else:
            print("✅ No grammar errors found!\n")

        print(f"📊 Grammar score so far: {tracker.grammar_score()}/10\n")

    tracker.session_summary()