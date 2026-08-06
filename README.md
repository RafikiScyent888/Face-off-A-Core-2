# ⚔ FACE-OFF: A+ Core 2

A team review game for **CompTIA A+ Core 2 (220-1102)** — Family Feud buzzers,
Jeopardy point board, hidden Daily Doubles, and a Final Face-Off wager round.
Built for the Cyber Warrior Program.

Students join by scanning a QR code or clicking a link. They pick their own team
name and color, type their own names, buzz in from their phone or laptop, and
type their team's answer for you to judge.

Runs entirely in the browser. No install, no accounts for students, no app.

---

## Quick start

**Just want to see it?** Open `demo.html` — it shows the host screen and two
student devices side by side in one window.

**Running it in class:**

1. Open `index.html` on the projector → **Host a Game**.
2. Students scan the QR or go to the link and enter the 4-letter room code.
3. You tell each student which team they're on. They tap that team, type their
   name, and the first one in becomes captain (picks the team name and color).
4. Click **Start Game →**.

## How a round plays

| Step | What happens |
|---|---|
| You click a point value | The question goes up on the projector and on every student device |
| Any team hits **BUZZ** | First buzz wins. That team gets **15 seconds** |
| The team types an answer | *Anyone* on the team can type — they talk it out, one types |
| You click **✓ Correct** | They score, and they pick the next clue |
| You click **✕ Incorrect** (or the timer runs out) | That team is locked out and the board **reopens to every other team** — first to buzz gets the steal |
| All teams miss | You reveal the answer and move on |

Buzz order is shown on screen (#1, #2, #3…) so nobody argues about who was first.

### Daily Doubles

One is hidden randomly on the Round 1 board every game — **you never know where
it is either**. It only appears in the 300/400/500 rows.

Whichever team uncovers it wagers anywhere from 100 up to their own score (or
500 if they're below that), answers alone, and there is **no steal**. Round 2
hides two of them.

### Final Face-Off

Every team wagers 0 up to their current score before seeing the question, gets
60 seconds to write an answer, then you reveal and judge them one at a time.
Enough for a last-place team to win.

## Keyboard shortcuts (host screen)

| Key | Does |
|---|---|
| `1`–`7` | Buzz in for that team — **your fallback if the network dies** |
| `Y` | Correct |
| `N` | Incorrect |
| `Space` | Reveal the answer / back to the board |
| `Esc` | Close a clue |

## Settings (⚙ in the top bar)

Teams (2–8, default **7** — that's 33 students at ~5 each), seconds to answer,
Final Face-Off seconds, minimum Daily Double wager, sound on/off, and whether a
wrong answer **deducts** points (off by default — with 7 teams and open steals,
deducting punishes the teams who are brave enough to buzz).

You can also nudge any score by hovering a team card and clicking **+ / −**, and
click any team card to hand them board control.

---

## Local Mode vs Live Mode

| | Local Mode (default) | Live Mode |
|---|---|---|
| Setup | none | one free Firebase project, ~10 min |
| Students join from | another tab on the host computer only | any phone or laptop |
| Use it for | testing, single-screen play with keyboard buzzers | actual class |

**To go live, follow [`FIREBASE-SETUP.md`](FIREBASE-SETUP.md).** The home screen
tells you which mode you're in.

## Deploying to GitHub Pages

Push these files to the repo root, then **Settings → Pages → Source: Deploy from
a branch → `main` / `(root)`**. Give it a minute and it's live at
`https://rafikiscyent888.github.io/Face-off-A-Core-2/`.

### GitHub or GitLab?

**GitHub, and it isn't close for you.** Your other course material already lives
there, GitHub Pages is one dropdown to turn on, and you already know the
workflow from VS Code. GitLab Pages needs a `.gitlab-ci.yml` build file to do
the same job. There's no feature here you'd gain by switching.

---

## Editing the questions

Everything lives in **`questions-core2.js`** — plain text, no code knowledge
needed. Each clue is one line:

```js
{ q: "The question students see.",
  a: "The answer only you see",
  alt: ["another phrasing you'd accept"],   // optional
  obj: "1.2" }                              // CompTIA objective, shown on the host screen
```

Rules: exactly **6 categories**, exactly **5 clues each**, in order 100 → 500.
Round 2 doubles those automatically (200 → 1000).

### What's in there now

**Round 1 — 30 questions, all mapped to 220-1102 objectives:**

| Category | Objectives covered |
|---|---|
| Windows Editions | 1.1, 1.9 |
| Command Line | 1.2 |
| OS Tools & Settings | 1.3, 1.4, 1.8 |
| Security Concepts | 2.1, 2.2, 2.5 |
| Malware & Social Engineering | 2.3, 2.4, 3.3 |
| Safety & Procedures | 4.2, 4.3, 4.4, 4.5, 4.6 |

**Final Face-Off:** the six-step troubleshooting methodology.

**Round 2 is empty and waiting** — the engine is fully wired for it. Planned
coverage to finish objective sweep: Linux & macOS (1.10, 1.11), Mobile OS
Security (2.7, 2.8), Windows Networking Config (1.6), Software Troubleshooting
(3.1, 3.2, 3.4, 3.5), Scripting & Remote Access (4.8, 4.9), and Communication &
Professionalism (4.7).

---

## Files

| File | What it is |
|---|---|
| `index.html` | The game — all markup and styling |
| `app.js` | Game engine: host console, student device, networking |
| `questions-core2.js` | **The question bank — this is the file you'll edit** |
| `firebase-config.js` | Paste your Firebase keys here to go live |
| `qr.js` | Self-contained QR generator (no CDN, works offline) |
| `demo.html` | Host + 2 student devices side by side, for testing alone |
| `FIREBASE-SETUP.md` | Step-by-step guide to enabling phone join |
| `.nojekyll` | Empty file — tells GitHub Pages to skip Jekyll processing |
| `build_preview.py` | Optional: bundles everything into one portable HTML file |

There are **no external dependencies**. Nothing is fetched from a CDN, so it
works on a locked-down school network and even fully offline in Local Mode.

## Browser support

Any current Chrome, Edge, Firefox, or Safari, desktop or mobile. Sound uses the
Web Audio API — on some phones the first tap unlocks it, which the join button
handles.

## Troubleshooting

**Students stuck on "Looking for room…"** — you're in Local Mode. See
`FIREBASE-SETUP.md`. If you're already in Live Mode, the school network is
probably blocking `*.firebaseio.com`.

**A student refreshed and lost their spot** — they just rejoin with the same
name on the same team and reclaim their seat.

**Two students on one laptop** — add a seat number to the link:
`…#/play/ABCD/1` and `…#/play/ABCD/2` are two separate players.

**Everything died mid-game** — scores live on the host screen. Don't reload the
host tab; if you must, press `1`–`7` to keep buzzing manually and adjust scores
with the +/− buttons.

---

Color scheme inherited from
[Cyber Warrior Command Center 2.0](https://rafikiscyent888.github.io/Cyber-Warrior-Command-Center-2.0/).
