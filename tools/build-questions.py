#!/usr/bin/env python3
"""
Build face-off questions-core2.js from the Core-2-quizzes question bank.

Source: https://rafikiscyent888.github.io/Core-2-quizzes/  (index.html,
        <script id="question-data" type="application/json">)

Each quiz sub-objective becomes a Face-Off category; the correct multiple
choice option becomes the answer key. Clues inside a category are ordered
easiest -> hardest (short question + short answer first), which is what the
board expects: row 1 is the cheapest clue, the last row the dearest.
"""
import json
import re
import unicodedata

SRC = "/home/user/Core-2-quizzes/index.html"
OUT = "/workspace/rafikiscyent888/face-off-a-core-2/questions-core2.js"

SUB_OBJECTIVES = {
    "Operating Systems": [
        ("1.1", "OS Types & Purposes"),
        ("1.2", "Windows Installation & Upgrades"),
        ("1.3", "Windows Editions & Features"),
        ("1.4", "Windows System Tools & Utilities"),
        ("1.5", "Windows Networking & Settings"),
        ("1.6", "macOS & Linux Tools"),
    ],
    "Security": [
        ("2.1", "Physical Security & Concepts"),
        ("2.2", "Wireless & Network Security"),
        ("2.3", "Malware Types & Removal"),
        ("2.4", "Social Engineering & Threats"),
        ("2.5", "Windows Security Settings"),
        ("2.6", "Mobile & Embedded Device Security"),
        ("2.7", "Data Destruction & Disposal"),
        ("2.8", "SOHO Security Configuration"),
    ],
    "Software Troubleshooting": [
        ("3.1", "Windows OS Troubleshooting"),
        ("3.2", "PC Security & Malware Removal"),
        ("3.3", "Mobile OS & App Troubleshooting"),
        ("3.4", "Mobile Security Troubleshooting"),
    ],
    "Operational Procedures": [
        ("4.1", "Documentation & Ticketing"),
        ("4.2", "Change Management"),
        ("4.3", "Backup & Recovery Methods"),
        ("4.4", "Safety & Environmental Controls"),
        ("4.5", "Privacy, Licensing & Policy"),
        ("4.6", "Communication & Professionalism"),
        ("4.7", "Scripting Basics"),
        ("4.8", "Remote Access Technologies"),
    ],
}

# Board order: alternate the four domains so a drawn board mixes topics
# instead of serving five Security categories in a row.
DOMAIN_ORDER = ["Operating Systems", "Security",
                "Software Troubleshooting", "Operational Procedures"]


def load_bank():
    html = open(SRC, encoding="utf-8").read()
    m = re.search(r'<script[^>]*id="question-data"[^>]*>(.*?)</script>', html, re.S)
    if not m:
        raise SystemExit("question-data block not found in " + SRC)
    return json.loads(m.group(1))


def tidy(s):
    """Normalise curly punctuation the quiz uses and trim stray whitespace."""
    s = unicodedata.normalize("NFC", s or "")
    s = (s.replace("‘", "'").replace("’", "'")
          .replace("“", '"').replace("”", '"')
          .replace("—", " — ").replace(" ", " "))
    return re.sub(r"\s+", " ", s).strip()


def answer_text(choice):
    """The option text is the answer key. Drop the trailing full stop the
    quiz puts on every choice — an answer key reads better without it."""
    a = tidy(choice)
    if a.endswith(".") and not a.endswith(".."):
        a = a[:-1]
    return a


def js_str(s):
    return json.dumps(s, ensure_ascii=False)


def build():
    bank = load_bank()
    interleaved = []
    per_domain = {d: [s for s in SUB_OBJECTIVES[d]] for d in DOMAIN_ORDER}
    while any(per_domain.values()):
        for d in DOMAIN_ORDER:
            if per_domain[d]:
                interleaved.append((d, *per_domain[d].pop(0)))

    cats, lightning = [], []
    for domain, sub, label in interleaved:
        rows = [q for q in bank if q.get("sub") == sub]
        clues = []
        for q in rows:
            text = tidy(q["q"])
            ans = answer_text(q["choices"][q["correct"]])
            if not text or not ans:
                continue
            clues.append({"q": text, "a": ans, "obj": sub,
                          "w": len(text) + 2 * len(ans)})
        if not clues:
            continue
        clues.sort(key=lambda c: (c["w"], c["q"]))
        for c in clues:
            del c["w"]
        cats.append({"name": label.upper(), "obj": sub,
                     "domain": domain, "clues": clues})

    # Lightning final: ten seconds a question, so what matters is a SHORT
    # question the host can read fast — a long answer key is fine, the host is
    # judging it, not reading it out. Two per sub-objective so the head-to-head
    # spans the whole exam, falling back to a category's shortest if none clear
    # the bar. The pool has to outlast a 15-question final plus sudden death.
    for cat in cats:
        ranked = sorted(cat["clues"], key=lambda c: (len(c["q"]), len(c["a"])))
        lightning.extend([c for c in ranked if len(c["q"]) <= 175][:2] or ranked[:1])
    lightning.sort(key=lambda c: len(c["q"]))

    return cats, lightning


HEADER = '''/* =====================================================================
   FACE-OFF: A+ CORE 2  —  QUESTION POOL
   Exam: CompTIA A+ 220-1202 (Core 2)
   ---------------------------------------------------------------------
   GENERATED FILE — do not hand-edit unless you mean to.

   Every clue below is pulled straight from the Core 2 practice bank at
   https://rafikiscyent888.github.io/Core-2-quizzes/ — the same questions
   students drill on their own. Each quiz sub-objective becomes one
   category, and the correct multiple-choice option becomes the answer key
   the host sees.

     • %d categories drawn from %d objectives x roughly 20 clues each
     • Each category's clues run EASIEST (first) to HARDEST (last)
     • The game draws unused clues each round, so no repeats in a game
     • `lightning` = short, fast questions for the final two teams

   Clue shape
     q   = the question students see
     a   = the answer (host screen only, hidden until the host reveals it)
     alt = other phrasings you'd accept (host hint, optional)
     obj = CompTIA 220-1202 objective number

   Regenerate with tools/build-questions.py after the quiz bank changes.
   ===================================================================== */

window.FACEOFF_QUESTIONS = {
  exam: "CompTIA A+ 220-1202 (Core 2)",

  categories: [
'''


def render(cats, lightning):
    out = [HEADER % (len(cats), len(cats))]
    for n, cat in enumerate(cats, 1):
        out.append("\n  /* ============ %d · %s ============ */\n" % (n, cat["domain"]))
        out.append('  { name: %s, obj: %s, clues: [\n'
                   % (js_str(cat["name"]), js_str(cat["obj"])))
        body = []
        for c in cat["clues"]:
            body.append('    { q: %s,\n      a: %s, obj: %s }'
                        % (js_str(c["q"]), js_str(c["a"]), js_str(c["obj"])))
        out.append(",\n".join(body))
        out.append("\n  ]}%s\n" % ("," if n < len(cats) else ""))

    out.append("""
  ], 

  /* =====================================================================
     LIGHTNING FINAL — head-to-head between the last two teams.
     The shortest question/answer pairs in the bank, one per objective.
     ===================================================================== */
  lightning: [
""")
    body = []
    for c in lightning:
        body.append('    { q: %s,\n      a: %s, obj: %s }'
                    % (js_str(c["q"]), js_str(c["a"]), js_str(c["obj"])))
    out.append(",\n".join(body))
    out.append("\n  ]\n};\n")
    return "".join(out)


if __name__ == "__main__":
    cats, lightning = build()
    open(OUT, "w", encoding="utf-8").write(render(cats, lightning))
    total = sum(len(c["clues"]) for c in cats)
    print("categories: %d   clues: %d   lightning: %d"
          % (len(cats), total, len(lightning)))
    for c in cats:
        print("  %-38s %s  %d clues" % (c["name"], c["obj"], len(c["clues"])))
