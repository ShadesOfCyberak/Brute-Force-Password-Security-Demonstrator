import { useCallback, useEffect, useRef, useState } from "react";
import { createBruteForceWorker } from "@/workers/bruteForceWorkerSource";

export type SimStatus = "READY" | "RUNNING" | "PAUSED" | "PASSWORD FOUND" | "STOPPED" | "NOT FOUND";
export type SimSpeed = "slow" | "normal" | "fast";

export interface ChartPoint {
  t: number; // seconds since start
  attempts: number;
}

export interface FoundResult {
  target: string;
  attempts: number;
  elapsedTime: number;
  attemptsPerSecond: number;
}

export interface CandidateEntry {
  id: number;
  value: string;
}

interface StartArgs {
  target: string;
  charset: string;
  maxLength: number;
  speed: SimSpeed;
}

/**
 * React hook encapsulating all Web Worker lifecycle management for the
 * brute-force simulation: creation, message handling, and teardown.
 * Keeping this logic isolated makes the UI components simple consumers
 * of plain state + callbacks.
 */
export function useBruteForce() {
  const workerRef = useRef<Worker | null>(null);

  const [status, setStatus] = useState<SimStatus>("READY");
  const [currentCandidate, setCurrentCandidate] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [attemptsPerSecond, setAttemptsPerSecond] = useState(0);
  const [currentLength, setCurrentLength] = useState(1);
  const [recentCandidates, setRecentCandidates] = useState<CandidateEntry[]>([]);
  const [foundResult, setFoundResult] = useState<FoundResult | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [charsetSize, setCharsetSize] = useState(0);

  const lastChartPush = useRef(0);
  const idCounter = useRef(0);
  const nextIds = (values: string[]) => values.map((value) => ({ id: idCounter.current++, value }));

  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const worker = createBruteForceWorker();
    worker.onmessage = (event: MessageEvent) => {
      const { type, payload } = event.data || {};
      switch (type) {
        case "STARTED":
          setCharsetSize(payload.charsetSize);
          setStatus("RUNNING");
          break;
        case "UPDATE": {
          setCurrentCandidate(payload.currentCandidate);
          setAttempts(payload.attempts);
          setElapsedTime(payload.elapsedTime);
          setAttemptsPerSecond(payload.attemptsPerSecond);
          setCurrentLength(payload.currentLength);
          setRecentCandidates((prev) => {
            const merged = [...prev, ...nextIds(payload.recentCandidates)];
            return merged.slice(-40);
          });
          // Throttle chart updates to roughly 4 points/sec regardless of worker speed.
          const now = performance.now();
          if (now - lastChartPush.current > 250) {
            lastChartPush.current = now;
            setChartData((prev) => {
              const next = [...prev, { t: payload.elapsedTime / 1000, attempts: payload.attempts }];
              return next.slice(-60);
            });
          }
          break;
        }
        case "FOUND": {
          setAttempts(payload.attempts);
          setElapsedTime(payload.elapsedTime);
          setAttemptsPerSecond(payload.attemptsPerSecond);
          setCurrentCandidate(payload.target);
          setRecentCandidates((prev) => [...prev, ...nextIds([payload.target])].slice(-40));
          setFoundResult({
            target: payload.target,
            attempts: payload.attempts,
            elapsedTime: payload.elapsedTime,
            attemptsPerSecond: payload.attemptsPerSecond,
          });
          setChartData((prev) => [...prev, { t: payload.elapsedTime / 1000, attempts: payload.attempts }].slice(-60));
          setStatus("PASSWORD FOUND");
          break;
        }
        case "PAUSED":
          setAttempts(payload.attempts);
          setElapsedTime(payload.elapsedTime);
          setStatus("PAUSED");
          break;
        case "RESUMED":
          setStatus("RUNNING");
          break;
        case "STOPPED":
          setAttempts(payload.attempts);
          setElapsedTime(payload.elapsedTime);
          setStatus("STOPPED");
          break;
        case "EXHAUSTED":
          setAttempts(payload.attempts);
          setElapsedTime(payload.elapsedTime);
          setStatus("NOT FOUND");
          break;
        case "RESET":
          break;
        case "ERROR":
          console.error("Brute-force worker error:", payload?.message);
          setStatus("STOPPED");
          break;
        default:
          break;
      }
    };
    workerRef.current = worker;
    return worker;
  }, []);

  const start = useCallback(
    ({ target, charset, maxLength, speed }: StartArgs) => {
      const worker = ensureWorker();
      setAttempts(0);
      setElapsedTime(0);
      setAttemptsPerSecond(0);
      setCurrentCandidate("");
      setRecentCandidates([]);
      setFoundResult(null);
      setChartData([]);
      setCurrentLength(1);
      lastChartPush.current = 0;
      worker.postMessage({ type: "START", payload: { target, charset, maxLength, speed } });
    },
    [ensureWorker],
  );

  const pause = useCallback(() => {
    workerRef.current?.postMessage({ type: "PAUSE" });
  }, []);

  const resume = useCallback(() => {
    workerRef.current?.postMessage({ type: "RESUME" });
  }, []);

  const stop = useCallback(() => {
    workerRef.current?.postMessage({ type: "STOP" });
  }, []);

  const setSpeed = useCallback((speed: SimSpeed) => {
    workerRef.current?.postMessage({ type: "SET_SPEED", payload: { speed } });
  }, []);

  const reset = useCallback(() => {
    workerRef.current?.postMessage({ type: "RESET" });
    setStatus("READY");
    setCurrentCandidate("");
    setAttempts(0);
    setElapsedTime(0);
    setAttemptsPerSecond(0);
    setCurrentLength(1);
    setRecentCandidates([]);
    setFoundResult(null);
    setChartData([]);
  }, []);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return {
    status,
    currentCandidate,
    attempts,
    elapsedTime,
    attemptsPerSecond,
    currentLength,
    recentCandidates,
    foundResult,
    chartData,
    charsetSize,
    start,
    pause,
    resume,
    stop,
    reset,
    setSpeed,
  };
}
