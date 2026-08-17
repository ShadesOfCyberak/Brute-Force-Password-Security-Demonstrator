import { Pause, Play, RotateCcw, Square, Zap } from "lucide-react";
import type { SimSpeed, SimStatus } from "@/hooks/useBruteForce";
import StatisticsCards from "./StatisticsCards";
import PossibilityScanner from "./PossibilityScanner";
import type { CandidateEntry } from "@/hooks/useBruteForce";

interface SimulationPanelProps {
  status: SimStatus;
  currentCandidate: string;
  attempts: number;
  elapsedTime: number;
  attemptsPerSecond: number;
  currentLength: number;
  maxLength: number;
  recentCandidates: CandidateEntry[];
  totalCombinations: bigint;
  target: string;
  speed: SimSpeed;
  onSpeedChange: (speed: SimSpeed) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  canStart: boolean;
  validationMessage: string | null;
}

const STATUS_STYLES: Record<SimStatus, string> = {
  READY: "text-slate-300 border-slate-500/30 bg-slate-500/10",
  RUNNING: "text-indigo-200 border-indigo-400/40 bg-indigo-500/15 status-pulse",
  PAUSED: "text-amber-200 border-amber-400/40 bg-amber-500/15",
  "PASSWORD FOUND": "text-emerald-200 border-emerald-400/50 bg-emerald-500/15",
  STOPPED: "text-red-200 border-red-400/40 bg-red-500/15",
  "NOT FOUND": "text-red-200 border-red-400/40 bg-red-500/15",
};

export default function SimulationPanel({
  status,
  currentCandidate,
  attempts,
  elapsedTime,
  attemptsPerSecond,
  currentLength,
  maxLength,
  recentCandidates,
  totalCombinations,
  target,
  speed,
  onSpeedChange,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  canStart,
  validationMessage,
}: SimulationPanelProps) {
  const isRunning = status === "RUNNING";
  const isPaused = status === "PAUSED";
  const isFinished = status === "PASSWORD FOUND" || status === "STOPPED" || status === "NOT FOUND";
  const lengthProgress = Math.min(100, (currentLength / maxLength) * 100);
  const attemptsPct = totalCombinations > 0n ? (Number(BigInt(attempts) * 10000n / (totalCombinations > 0n ? totalCombinations : 1n)) / 100) : 0;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-6">
      {/* Status + speed control */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold tracking-widest ${STATUS_STYLES[status]}`}>
          <span className="h-2 w-2 rounded-full bg-current" />
          {status}
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] p-1">
          <Zap className="ml-1.5 h-3.5 w-3.5 text-slate-500" />
          {(["slow", "normal", "fast"] as SimSpeed[]).map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                speed === s ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Current candidate */}
      <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-center sm:p-5">
        <p className="text-[11px] uppercase tracking-wide text-slate-500">Current Attempt</p>
        <p className="mt-1 truncate font-mono text-2xl font-bold text-sky-300 sm:text-3xl">
          {currentCandidate ? currentCandidate : "—"}
        </p>
      </div>

      <StatisticsCards
        attempts={attempts}
        elapsedTime={elapsedTime}
        attemptsPerSecond={attemptsPerSecond}
        totalCombinations={totalCombinations}
      />

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>Search depth progress</span>
          <span>
            {currentLength}/{maxLength} chars · {attemptsPct.toFixed(4)}% of space explored
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-500"
            style={{ width: `${lengthProgress}%` }}
          />
        </div>
      </div>

      <PossibilityScanner
        recentCandidates={recentCandidates}
        currentCandidate={currentCandidate}
        currentLength={currentLength}
        maxLength={maxLength}
        status={status}
        target={target}
      />

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <ControlButton
          label="START"
          icon={Play}
          onClick={onStart}
          disabled={!canStart || isRunning || isPaused}
          className="bg-indigo-500 text-white hover:bg-indigo-400"
        />
        <ControlButton
          label="PAUSE"
          icon={Pause}
          onClick={onPause}
          disabled={!isRunning}
          className="bg-amber-500 text-amber-950 hover:bg-amber-400"
        />
        <ControlButton
          label="RESUME"
          icon={Play}
          onClick={onResume}
          disabled={!isPaused}
          className="bg-sky-500 text-sky-950 hover:bg-sky-400"
        />
        <ControlButton
          label="STOP"
          icon={Square}
          onClick={onStop}
          disabled={!isRunning && !isPaused}
          className="bg-red-500 text-white hover:bg-red-400"
        />
        <ControlButton
          label="RESET"
          icon={RotateCcw}
          onClick={onReset}
          disabled={status === "READY"}
          className="bg-white/10 text-slate-200 hover:bg-white/20"
        />
      </div>

      {!canStart && validationMessage && status === "READY" && (
        <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          {validationMessage}
        </p>
      )}

      {isFinished && status === "NOT FOUND" && (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          Search space exhausted within the configured maximum length without finding the target. Try increasing the
          maximum length or adjusting the character sets.
        </p>
      )}
    </div>
  );
}

function ControlButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  className,
}: {
  label: string;
  icon: typeof Play;
  onClick: () => void;
  disabled?: boolean;
  className: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-bold tracking-wide transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30 sm:flex-none sm:px-4 ${className}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
