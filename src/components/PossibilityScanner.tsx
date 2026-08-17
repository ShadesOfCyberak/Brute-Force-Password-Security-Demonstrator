import { CheckCircle2, ScanLine } from "lucide-react";
import type { CandidateEntry, SimStatus } from "@/hooks/useBruteForce";

interface PossibilityScannerProps {
  recentCandidates: CandidateEntry[];
  currentCandidate: string;
  currentLength: number;
  maxLength: number;
  status: SimStatus;
  target: string;
}

/**
 * "Possibility Scanner" — a real-time visualization of the brute-force
 * search. Rather than rendering every single attempt (which could be tens
 * of thousands per second), it renders a throttled, representative sample
 * streamed in from the worker so the animation stays smooth and readable.
 */
export default function PossibilityScanner({
  recentCandidates,
  currentCandidate,
  currentLength,
  maxLength,
  status,
  target,
}: PossibilityScannerProps) {
  const found = status === "PASSWORD FOUND";
  const stream = recentCandidates.slice(-18).reverse();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-200">
          <ScanLine className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold">Possibility Scanner</h3>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          depth {Math.min(currentLength, maxLength)}/{maxLength}
        </span>
      </div>

      {/* Depth track: visualizes search-space progression by candidate length */}
      <div className="mb-4 flex items-center gap-1.5">
        {Array.from({ length: maxLength }, (_, i) => i + 1).map((depth) => {
          const isPast = depth < currentLength;
          const isCurrent = depth === currentLength;
          return (
            <div key={depth} className="flex flex-1 items-center gap-1.5">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-mono transition-all duration-300 ${
                  found
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-300"
                    : isCurrent
                      ? "scanner-node-active border-indigo-400 bg-indigo-500/30 text-indigo-100"
                      : isPast
                        ? "border-sky-400/50 bg-sky-500/10 text-sky-300"
                        : "border-white/10 bg-white/[0.02] text-slate-600"
                }`}
              >
                {depth}
              </div>
              {depth < maxLength && (
                <div
                  className={`h-px flex-1 transition-colors duration-300 ${
                    depth < currentLength || found ? "bg-sky-400/40" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Live candidate stream */}
      {!found ? (
        <div className="scanner-grid min-h-[92px] rounded-lg border border-white/5 bg-slate-950/50 p-3">
          {stream.length === 0 ? (
            <p className="flex h-16 items-center justify-center font-mono text-xs text-slate-600">
              Waiting for simulation to start…
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {stream.map((entry, i) => (
                <span
                  key={entry.id}
                  className="scan-chip rounded-md border border-indigo-400/20 bg-indigo-500/10 px-2 py-1 font-mono text-xs text-indigo-200"
                  style={{ opacity: 1 - i * 0.045, animationDelay: `${i * 15}ms` }}
                >
                  {entry.value || "\u00A0"}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="success-glow flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-4 text-center">
          <CheckCircle2 className="h-7 w-7 text-emerald-300" />
          <span className="font-mono text-lg font-bold tracking-wide text-emerald-200">{target}</span>
          <span className="text-xs text-emerald-400">Match confirmed</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-950/40 px-3 py-2">
        <span className="text-[11px] uppercase tracking-wide text-slate-500">Current Attempt</span>
        <span
          className={`truncate pl-3 font-mono text-sm font-semibold sm:text-base ${
            found ? "text-emerald-300" : "text-slate-100"
          }`}
        >
          {currentCandidate || "—"}
        </span>
      </div>
    </div>
  );
}
