/**
 * bruteForceWorkerSource.ts
 * -----------------------------------------------------------------------
 * The actual Web Worker logic is authored here as a plain-JavaScript
 * string. It is instantiated through a Blob URL (see
 * `createBruteForceWorker` below) instead of `new URL('./file.js', ...)`
 * because this project is bundled as a single HTML file — Blob workers
 * work reliably in that setup while file-based worker chunks do not.
 *
 * Protocol
 * -----------------------------------------------------------------------
 * Main -> Worker:
 *   { type: 'START',  payload: { target, charset, maxLength, speed } }
 *   { type: 'PAUSE'  }
 *   { type: 'RESUME' }
 *   { type: 'STOP'   }
 *   { type: 'RESET'  }
 *   { type: 'SET_SPEED', payload: { speed } }
 *
 * Worker -> Main:
 *   { type: 'STARTED',   payload: { charsetSize } }
 *   { type: 'UPDATE',    payload: { currentCandidate, attempts, elapsedTime, attemptsPerSecond, recentCandidates, currentLength } }
 *   { type: 'FOUND',     payload: { target, attempts, elapsedTime, attemptsPerSecond } }
 *   { type: 'PAUSED',    payload: { attempts, elapsedTime } }
 *   { type: 'RESUMED' }
 *   { type: 'STOPPED',   payload: { attempts, elapsedTime } }
 *   { type: 'RESET' }
 *   { type: 'EXHAUSTED', payload: { attempts, elapsedTime } }
 *   { type: 'ERROR',     payload: { message } }
 * -----------------------------------------------------------------------
 */

export const bruteForceWorkerSource = `
"use strict";

/* ---- Mutable worker state ---------------------------------------- */
var charset = [];
var target = "";
var maxLength = 6;
var indices = [0];
var length = 1;
var attempts = 0;
var running = false;
var paused = false;
var startTime = 0;
var pausedAccum = 0;
var pauseStartedAt = 0;
var timerId = null;

/* Speed presets: control batch size (candidates per tick) and the tick
   interval. This keeps the UI thread free and lets the user control how
   fast the visualization progresses without breaking correctness — every
   candidate is still generated and counted in order. */
var SPEED_PRESETS = {
  slow:   { batchSize: 15,   tickMs: 130 },
  normal: { batchSize: 250,  tickMs: 55 },
  fast:   { batchSize: 2500, tickMs: 28 }
};
var currentSpeed = SPEED_PRESETS.normal;

function resetState() {
  charset = [];
  target = "";
  indices = [0];
  length = 1;
  attempts = 0;
  running = false;
  paused = false;
  startTime = 0;
  pausedAccum = 0;
  pauseStartedAt = 0;
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
}

function candidateFromIndices() {
  var out = "";
  for (var i = 0; i < indices.length; i++) {
    out += charset[indices[i]];
  }
  return out;
}

/** Odometer-style increment: advances to the next combination, growing the
 *  length once the current length is exhausted. This guarantees a fully
 *  systematic traversal of the search space (a, b, c, ..., aa, ab, ...). */
function advance() {
  var pos = indices.length - 1;
  while (pos >= 0) {
    indices[pos]++;
    if (indices[pos] < charset.length) return;
    indices[pos] = 0;
    pos--;
  }
  // Overflowed every position -> move to the next length.
  length++;
  indices = new Array(length).fill(0);
}

function elapsedMs() {
  if (paused) {
    return pauseStartedAt - startTime - pausedAccum;
  }
  return Date.now() - startTime - pausedAccum;
}

function scheduleTick() {
  if (!running || paused) return;
  timerId = setTimeout(runBatch, currentSpeed.tickMs);
}

function runBatch() {
  if (!running || paused) return;

  var sample = [];
  var sampleInterval = Math.max(1, Math.floor(currentSpeed.batchSize / 24));
  var lastCandidate = "";
  var found = false;
  var exhausted = false;

  for (var i = 0; i < currentSpeed.batchSize; i++) {
    if (charset.length === 0) { exhausted = true; break; }
    if (length > maxLength) { exhausted = true; break; }

    lastCandidate = candidateFromIndices();
    attempts++;

    if (i % sampleInterval === 0) sample.push(lastCandidate);

    if (lastCandidate === target) {
      found = true;
      break;
    }
    advance();
  }

  var elapsed = elapsedMs();
  var rate = attempts / (elapsed / 1000 || 1);

  if (found) {
    running = false;
    if (timerId !== null) { clearTimeout(timerId); timerId = null; }
    self.postMessage({
      type: "FOUND",
      payload: { target: target, attempts: attempts, elapsedTime: elapsed, attemptsPerSecond: rate }
    });
    return;
  }

  if (exhausted) {
    running = false;
    if (timerId !== null) { clearTimeout(timerId); timerId = null; }
    self.postMessage({
      type: "EXHAUSTED",
      payload: { attempts: attempts, elapsedTime: elapsed }
    });
    return;
  }

  self.postMessage({
    type: "UPDATE",
    payload: {
      currentCandidate: lastCandidate,
      attempts: attempts,
      elapsedTime: elapsed,
      attemptsPerSecond: rate,
      recentCandidates: sample,
      currentLength: length
    }
  });

  scheduleTick();
}

self.onmessage = function (event) {
  var msg = event.data || {};
  try {
    switch (msg.type) {
      case "START": {
        var payload = msg.payload || {};
        resetState();
        charset = (payload.charset || "").split("");
        target = payload.target || "";
        maxLength = payload.maxLength || 6;
        currentSpeed = SPEED_PRESETS[payload.speed] || SPEED_PRESETS.normal;
        running = true;
        paused = false;
        startTime = Date.now();
        pausedAccum = 0;
        self.postMessage({ type: "STARTED", payload: { charsetSize: charset.length } });
        scheduleTick();
        break;
      }
      case "PAUSE": {
        if (running && !paused) {
          paused = true;
          pauseStartedAt = Date.now();
          if (timerId !== null) { clearTimeout(timerId); timerId = null; }
          self.postMessage({ type: "PAUSED", payload: { attempts: attempts, elapsedTime: elapsedMs() } });
        }
        break;
      }
      case "RESUME": {
        if (running && paused) {
          pausedAccum += Date.now() - pauseStartedAt;
          paused = false;
          self.postMessage({ type: "RESUMED" });
          scheduleTick();
        }
        break;
      }
      case "STOP": {
        var wasRunning = running;
        var stats = { attempts: attempts, elapsedTime: elapsedMs() };
        running = false;
        paused = false;
        if (timerId !== null) { clearTimeout(timerId); timerId = null; }
        if (wasRunning) {
          self.postMessage({ type: "STOPPED", payload: stats });
        }
        break;
      }
      case "SET_SPEED": {
        var sp = (msg.payload && msg.payload.speed) || "normal";
        currentSpeed = SPEED_PRESETS[sp] || SPEED_PRESETS.normal;
        break;
      }
      case "RESET": {
        resetState();
        self.postMessage({ type: "RESET" });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    self.postMessage({ type: "ERROR", payload: { message: (err && err.message) || String(err) } });
  }
};
`;

/** Instantiate the brute-force Web Worker from an in-memory Blob. */
export function createBruteForceWorker(): Worker {
  const blob = new Blob([bruteForceWorkerSource], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  // Revoke shortly after creation; the worker has already been instantiated.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return worker;
}
