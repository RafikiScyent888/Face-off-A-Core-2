# ⚔ FACE-OFF: A+ Core 2

An elimination **tournament** for **CompTIA A+ Core 2 (220-1102)** — Family Feud
buzzers, a Jeopardy point board, hidden Daily Doubles, teams knocked out each
round, and a head-to-head Lightning Final. Built for the Cyber Warrior Program.

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
4. Click **Start Game →**. The bracket builds itself from your team count.

## How the tournament works

It's a bracket. Teams get knocked out until two are left, and those two settle
it head to head.

```
   8 teams  →  Round 1  →  cut bottom 2  →  6 teams
                          Round 2  →  cut bottom 2  →  4 teams
                          Round 3  →  cut bottom 2  →  2 teams
                                   ⚡ LIGHTNING FINAL ⚡
```

Scores **carry over** the whole way, so a strong early round still counts in the
final. Point values **grow each round** — Round 1 tops out at 500, Round 2 at
1,000, Round 3 at 1,500 — so a team behind early can still climb back.

### Playing a board

| Step | What happens |
|---|---|
| You click a point value | The question goes up on the projector and on every student device |
| Any team hits **BUZZ** | First buzz wins. That team gets **15 seconds** |
| The team types an answer | *Anyone* on the team can type — they talk it out, one types |
| You click **✓ Correct** | They score, and they pick the next clue |
| You click **✕ Incorrect** (or time runs out) | That team is locked out and the board **reopens to every other team still in the bracket** |
| All teams miss | You reveal the answer and move on |

Buzz order is shown on screen (#1, #2, #3…) so nobody argues about who was first.

### Eliminations

When the board is cleared — or whenever you click **End this round early** — you
get a standings screen with the bottom two already marked for elimination.

- **Click any team to change who goes out.** You have the final say.
- If teams are **tied at the cut line**, the screen says so in yellow and waits
  for you to pick. It will not guess.
- It won't let you continue until exactly the right number are selected.

Eliminated teams keep their device. Questions and answers still appear on it so
they can keep reviewing and follow the standings — they just can't buzz.

### ⚡ The Lightning Final

The last two teams go head to head. No board — just rapid-fire questions worth
**500 each**, 10 seconds apiece, fastest buzz takes it. Miss, and the other team
gets the rest of the clock. If they're tied when the questions run out, it goes
to **sudden death**.

### Daily Doubles

Hidden randomly on every board — **you never know where they are either**. Never
in the cheapest rows. The team that uncovers one wagers up to their own score,
answers alone, and there's **no steal**. Bigger boards hide two.

## Class size and running time

Set **number of teams** (2–12), **students per team** (2–8), and **tournament
length** in Settings. The panel shows your exact bracket as you change them.

| Class | Setup | Why |
|---|---|---|
| **40 students** | **8 teams × 5** (default) | Small teams mean nobody hides, and 8 teams gives you a 3-round bracket. |
| 60 | 10 × 6 | |
| 80 | 10 × 8 | Ceiling is 12 × 8 = 96. |

**Tournament length** scales the boards so the whole bracket fits your period:

| Length | Each board | Lightning Final |
|---|---|---|
| 30 min | 3 categories × 3 | 8 questions |
| 45 min | 4 × 3 | 10 |
| 60 min | 4 × 4 | 10 |
| 90 min | 5 × 5 | 12 |
| 120 min | 6 × 5 | 15 |

Two class periods of 40 are two separate tournaments — just reload the host
screen between them for a fresh room code and a clean bracket.

**One caution above ~90 in a single room:** Firebase's free plan allows 100
devices connected at once. 80 students plus the host is 81, comfortably inside
it. Two 40-student rooms at the same time is also fine.

## Other settings (⚙ in the top bar)

Seconds to answer, Lightning Final seconds, minimum Daily Double wager, sound
on/off, and whether a wrong answer **deducts** points (off by default — with
open steals, deducting punishes the teams brave enough to buzz).

You can also nudge any score by hovering a team card and clicking **+ / −**, and
click any team card to hand them board control.

Shrinking the roster settings never strands a student: the game refuses to set
students-per-team below a roster that's already fuller than that, and asks for
confirmation before removing teams that already have students on them.

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
needed. It's a **pool**, not fixed rounds: the game draws unused clues each
round, so no question ever repeats inside one tournament.

```js
{ q: "The question students see.",
  a: "The answer only you see",
  alt: ["another phrasing you'd accept"],   // optional
  obj: "1.2" }                              // CompTIA objective, shown on the host screen
```

Each category's clues run **easiest first, hardest last** — that ordering is
what becomes the 100 → 500 rows on the board, so keep it if you add clues.

### What's in there now

**120 board questions** — 12 categories × 10 clues — plus **30 Lightning Final
questions**. Full 220-1102 coverage:

| Category | Objectives |
|---|---|
| Windows Editions | 1.1, 1.9 |
| Command Line | 1.2 |
| OS Tools | 1.3, 1.5 |
| Control Panel | 1.4 |
| Windows Networking | 1.6, 1.8 |
| Linux, macOS & Mobile | 1.10, 1.11 |
| Security Fundamentals | 2.1, 2.5, 2.6 |
| Threats & Attacks | 2.4 |
| Malware & Removal | 2.3, 3.3 |
| Wireless & Mobile Security | 2.2, 2.7, 2.8, 2.9, 2.10 |
| Software Troubleshooting | 3.1, 3.2, 3.4, 3.5 |
| Safety & Procedures | 4.1–4.9 |

That's enough for a **4-board tournament with zero repeats**. If a game ever
runs the pool dry, it recycles rather than breaking.

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
host tab; if you must, press `1`–`9` (then `0`, `-`, `=`) to keep buzzing
manually and adjust scores with the +/− buttons.

---

Color scheme inherited from
[Cyber Warrior Command Center 2.0](https://rafikiscyent888.github.io/Cyber-Warrior-Command-Center-2.0/).
