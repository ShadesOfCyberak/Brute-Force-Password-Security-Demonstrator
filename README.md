# Brute-Force Password Security Demonstrator

An interactive, fully client-side educational dashboard that visually demonstrates how a
brute-force algorithm systematically searches a character-set space until it matches a
user-provided **test** password. Built for classroom / portfolio demonstration of password
security concepts — not a tool for attacking real accounts or services.

## 1. Project Overview

The app lets a user type a password they own (or a suggested test value), choose which
character sets to include in the simulated attacker's alphabet, and watch a Web-Worker-driven
brute-force generator work through the search space in strict lexicographic order (`a`, `b`,
`c`, ... `aa`, `ab`, ... ) until it reaches the target. Live statistics, a "Possibility
Scanner" animation, and two Chart.js charts make the exponential growth of password search
spaces tangible.

**No password ever leaves the browser.** There is no backend, no network call, and no
persistence — everything runs locally in a Web Worker.

## 2. Features

- Target password input with show/hide toggle and quick-fill suggested test passwords.
- Character-set selection (lowercase, uppercase, numbers, special characters) with live
  character-set size readout.
- Adjustable maximum search length (1–8) with automatic risk classification
  (low / moderate / high / extreme) and a required acknowledgement checkbox for extreme
  search spaces.
- Systematic, non-random brute-force generator running inside a Web Worker so the UI never
  freezes.
- Start / Pause / Resume / Stop / Reset controls with correct enabled/disabled states and
  true pause-then-continue behaviour (no restart on resume).
- Live stats: attempts, elapsed time, attempts/second, and total search-space size.
- "Possibility Scanner" — a throttled, animated stream of recently generated candidates plus
  a search-depth track, so the UI stays smooth even when the worker is producing thousands of
  candidates per second.
- Visual speed control (Slow / Normal / Fast) that governs how fast the simulation
  progresses and how often the UI is updated, without changing the correctness of the
  underlying systematic search.
- Real-time "Attempts vs Time" line chart and a "Password Complexity vs Search Space" bar
  chart (log scale) that updates live as you change character sets / max length.
- Search-space calculator showing the N¹ + N² + ... + Nᴸ formula and a human-readable result.
- Prominent success panel with target, attempts, time taken, and average speed, plus a
  "Run Again" button.
- Educational sections: "How Brute Force Works" and "Why Strong Passwords Matter".
- Dark, glassmorphism cybersecurity theme; fully responsive (desktop / tablet / mobile).
- Input validation: empty password, no character set selected, target containing characters
  outside the chosen sets, target longer than the max length, and extreme search-space
  acknowledgement.

## 3. How the Brute-Force Algorithm Works

The generator lives in `src/workers/bruteForceWorkerSource.ts` and runs inside a Web Worker
(instantiated from an in-memory `Blob` so it works under the project's single-file build).

It uses an **odometer-style iterative generator**:

1. Start with `length = 1` and an index array `[0]` pointing at the first character of the
   selected charset.
2. Build the candidate string from the current indices and compare it to the target.
3. Increment the last index; if it overflows the charset size, reset it to 0 and carry the
   increment to the previous position (just like an odometer / counting in base N).
4. If every position overflows, increase `length` by 1 and start a fresh all-zero index array.
5. Repeat until the candidate matches the target (`FOUND`) or `length` exceeds the configured
   maximum (`EXHAUSTED`).

This produces exactly the traversal order described in the spec: `a, b, c, ..., z, aa, ab,
ac, ...` and guarantees every combination is counted as one attempt.

To keep the browser responsive, the worker processes candidates in small batches
(`batchSize`) on a timer (`tickMs`), both of which are controlled by the selected
Slow/Normal/Fast speed preset. After each batch it posts an `UPDATE` message with the current
candidate, cumulative attempts, elapsed time, attempts/second, a small sample of recent
candidates (for the scanner animation), and the current candidate length.

## 4. How to Run Locally

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal (typically `http://localhost:5173`).

To create a production build:

```bash
npm run build
npm run preview
```

## 5. Project Architecture

```text
src/
├── components/
│   ├── Header.tsx                # Title, subtitle, "LOCAL SIMULATION" badge
│   ├── ConfigurationPanel.tsx    # Target password, charset checkboxes, max length, risk
│   ├── SimulationPanel.tsx       # Status, controls, stats, scanner, progress
│   ├── PossibilityScanner.tsx    # Animated candidate stream + depth track
│   ├── StatisticsCards.tsx       # Attempts / time / rate / search-space cards
│   ├── SearchSpaceCalculator.tsx # N^1 + N^2 + ... + N^L formula + result
│   ├── ResultsPanel.tsx          # "PASSWORD FOUND" summary + Run Again
│   ├── ComplexityChart.tsx       # Attempts-vs-time & complexity-vs-length charts
│   └── EducationalSection.tsx    # How brute force works / why strong passwords matter
├── hooks/
│   └── useBruteForce.ts          # Worker lifecycle, message handling, exposed state
├── workers/
│   └── bruteForceWorkerSource.ts # Worker source (as a string) + Blob worker factory
├── utils/
│   ├── searchSpace.ts            # Charset building, BigInt combinatorics, risk levels
│   └── formatting.ts             # Number/time/rate formatting helpers
├── App.tsx                       # Top-level state & composition
├── main.tsx
└── index.css                     # Theme, keyframes/animations
```

The Web Worker is created from a `Blob` URL rather than `new URL('./file.js', import.meta.url)`
because the project builds to a single inlined HTML file (`vite-plugin-singlefile`); the Blob
approach works reliably regardless of bundling strategy.

## 6. Technologies Used

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4 (utility-first styling, dark glassmorphism theme)
- Web Workers (native browser API) for off-main-thread computation
- Chart.js + react-chartjs-2 for the real-time charts
- lucide-react for icons

## 7. Educational / Security Disclaimer

This application is **for educational demonstration only**. It is designed to help students
and developers visualize password search-space complexity. It:

- Only operates on a password the user explicitly types into the browser.
- Never transmits any data over a network — no backend, database, or external API is used.
- Never logs the target password to the console.
- Is not designed, tuned, or intended for attacking real accounts, services, or systems.

Use only passwords you own or are explicitly authorized to test. Do not use this tool against
any account, system, or service without proper authorization.

## 9. Possible Future Improvements

- Add a dictionary-attack simulation mode alongside pure brute force.
- Add password-strength scoring (entropy bits) alongside the search-space calculator.
- Persist chart history across multiple runs for comparison.
- Add Web Worker pooling to visualize multiple parallel "workers" scanning different length
  ranges simultaneously.
- Internationalization (i18n) support.
- Export run statistics as CSV/JSON for classroom reports.
