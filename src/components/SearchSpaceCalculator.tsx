import { Calculator } from "lucide-react";
import { formatBigNumber, formatNumber } from "@/utils/formatting";

interface SearchSpaceCalculatorProps {
  charsetSize: number;
  maxLength: number;
  totalCombinations: bigint;
}

export default function SearchSpaceCalculator({
  charsetSize,
  maxLength,
  totalCombinations,
}: SearchSpaceCalculatorProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-slate-200">
        <Calculator className="h-4 w-4 text-purple-400" />
        <h3 className="text-sm font-semibold">Search Space Calculator</h3>
      </div>

      <div className="space-y-3 font-mono text-xs sm:text-sm">
        <div className="rounded-lg bg-slate-950/50 p-3 text-slate-300">
          <p>Character Set Size = N = {formatNumber(charsetSize)}</p>
          <p>Maximum Length = L = {maxLength}</p>
          <p className="mt-1 text-slate-500">Total Possible Combinations = N¹ + N² + ... + N^L</p>
        </div>

        <div className="rounded-lg border border-purple-400/20 bg-purple-500/10 p-3">
          <p className="text-[11px] uppercase tracking-wide text-purple-300">Possible combinations</p>
          <p className="mt-1 break-all text-lg font-bold text-purple-100 sm:text-xl">
            {formatBigNumber(totalCombinations)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Larger character sets and longer passwords exponentially increase the number of possible combinations —
        this is the mathematical foundation of password strength.
      </p>
    </div>
  );
}
