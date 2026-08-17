import { useMemo } from "react";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  LogarithmicScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { BarChart3, LineChart } from "lucide-react";
import { combinationsForLength } from "@/utils/searchSpace";
import type { ChartPoint } from "@/hooks/useBruteForce";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend,
);

interface ComplexityChartProps {
  chartData: ChartPoint[];
  charsetSize: number;
  maxLength: number;
}

const GRID_COLOR = "rgba(148, 163, 184, 0.08)";
const TICK_COLOR = "#94a3b8";
const FONT = { family: "'JetBrains Mono', ui-monospace, monospace", size: 10 };

export default function ComplexityChart({ chartData, charsetSize, maxLength }: ComplexityChartProps) {
  const attemptsChartData = useMemo(
    () => ({
      labels: chartData.map((p) => p.t.toFixed(1)),
      datasets: [
        {
          label: "Attempts",
          data: chartData.map((p) => p.attempts),
          borderColor: "#818cf8",
          backgroundColor: "rgba(129, 140, 248, 0.15)",
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    }),
    [chartData],
  );

  const complexityChartData = useMemo(() => {
    const lengths = Array.from({ length: maxLength }, (_, i) => i + 1);
    return {
      labels: lengths.map((l) => `${l}`),
      datasets: [
        {
          label: "Combinations",
          data: lengths.map((l) => {
            const combos = combinationsForLength(Math.max(charsetSize, 1), l);
            // Clamp to a safe JS number for charting purposes (log scale display only).
            const asNumber = Number(combos > 1e300 ? 1e300 : combos);
            return asNumber;
          }),
          backgroundColor: lengths.map((l) => (l === maxLength ? "#f472b6" : "#38bdf8")),
          borderRadius: 4,
          barThickness: 22,
        },
      ],
    };
  }, [charsetSize, maxLength]);

  const commonScaleOptions = {
    grid: { color: GRID_COLOR },
    ticks: { color: TICK_COLOR, font: FONT },
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-slate-200">
          <LineChart className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-semibold">Attempts vs Time</h3>
        </div>
        <div className="h-56">
          {chartData.length > 1 ? (
            <Line
              data={attemptsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ...commonScaleOptions, title: { display: true, text: "seconds", color: TICK_COLOR, font: FONT } },
                  y: { ...commonScaleOptions },
                },
              }}
            />
          ) : (
            <EmptyState label="Chart updates once the simulation is running" />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-slate-200">
          <BarChart3 className="h-4 w-4 text-pink-400" />
          <h3 className="text-sm font-semibold">Password Complexity vs Search Space</h3>
        </div>
        <div className="h-56">
          <Bar
            data={complexityChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ...commonScaleOptions, title: { display: true, text: "length", color: TICK_COLOR, font: FONT } },
                y: {
                  ...commonScaleOptions,
                  type: "logarithmic",
                  title: { display: true, text: "combinations (log)", color: TICK_COLOR, font: FONT },
                },
              },
            }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Bars show N^length for the currently selected character set (N = {Math.max(charsetSize, 0)}). The highlighted
          bar is your chosen maximum length.
        </p>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="flex h-full items-center justify-center font-mono text-xs text-slate-600">{label}</div>;
}
