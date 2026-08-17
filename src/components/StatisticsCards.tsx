import { Activity, Clock, Gauge, Layers } from "lucide-react";
import { formatBigNumber, formatDuration, formatNumber, formatRate } from "@/utils/formatting";

interface StatisticsCardsProps {
  attempts: number;
  elapsedTime: number;
  attemptsPerSecond: number;
  totalCombinations: bigint;
}

export default function StatisticsCards({
  attempts,
  elapsedTime,
  attemptsPerSecond,
  totalCombinations,
}: StatisticsCardsProps) {
  const cards = [
    {
      label: "Attempts",
      value: formatNumber(attempts),
      icon: Activity,
      accent: "text-indigo-300",
    },
    {
      label: "Elapsed Time",
      value: formatDuration(elapsedTime),
      icon: Clock,
      accent: "text-sky-300",
    },
    {
      label: "Attempts/Second",
      value: formatRate(attemptsPerSecond),
      icon: Gauge,
      accent: "text-emerald-300",
    },
    {
      label: "Search Space",
      value: formatBigNumber(totalCombinations),
      icon: Layers,
      accent: "text-purple-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, accent }) => (
        <div
          key={label}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 shadow-inner shadow-black/20 sm:p-4"
        >
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-slate-500">
            <Icon className={`h-3.5 w-3.5 ${accent}`} />
            {label}
          </div>
          <div className="truncate font-mono text-base font-semibold text-slate-100 sm:text-lg">{value}</div>
        </div>
      ))}
    </div>
  );
}
