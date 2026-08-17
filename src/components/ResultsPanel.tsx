import { PartyPopper, RotateCcw } from "lucide-react";
import { formatDuration, formatNumber, formatRate } from "@/utils/formatting";
import type { FoundResult } from "@/hooks/useBruteForce";

interface ResultsPanelProps {
  result: FoundResult;
  onRunAgain: () => void;
}

export default function ResultsPanel({ result, onRunAgain }: ResultsPanelProps) {
  return (
    <div className="found-panel relative overflow-hidden rounded-2xl border border-emerald-400/40 bg-emerald-500/[0.08] p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(16,185,129,0.25),transparent_60%)]" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
            <PartyPopper className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-wide text-emerald-200">PASSWORD FOUND</h3>
            <p className="text-xs text-emerald-400/80">The simulated search located the exact target.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 font-mono text-sm sm:grid-cols-2">
          <ResultRow label="Target" value={result.target} highlight />
          <ResultRow label="Attempts" value={formatNumber(result.attempts)} />
          <ResultRow label="Time Taken" value={formatDuration(result.elapsedTime)} />
          <ResultRow label="Average Speed" value={formatRate(result.attemptsPerSecond)} />
        </div>

        <button
          onClick={onRunAgain}
          className="flex w-fit items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" />
          Run Again
        </button>
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg bg-slate-950/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-emerald-400/70">{label}</p>
      <p className={`truncate text-sm font-semibold ${highlight ? "text-emerald-200" : "text-slate-100"}`}>{value}</p>
    </div>
  );
}
