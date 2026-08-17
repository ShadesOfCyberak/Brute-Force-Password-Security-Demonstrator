import { Eye, EyeOff, Info, KeyRound } from "lucide-react";
import { CHARSET_DEFINITIONS, CharsetKey, CharsetSelection, SearchSpaceRisk } from "@/utils/searchSpace";

const SUGGESTED_PASSWORDS = ["abc", "123", "a1b", "abc12"];

interface ConfigurationPanelProps {
  target: string;
  onTargetChange: (value: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  selection: CharsetSelection;
  onToggleCharset: (key: CharsetKey) => void;
  charsetSize: number;
  maxLength: number;
  onMaxLengthChange: (value: number) => void;
  risk: SearchSpaceRisk;
  disabled: boolean;
  acknowledgeRisk: boolean;
  onAcknowledgeRiskChange: (value: boolean) => void;
}

const RISK_STYLES: Record<SearchSpaceRisk, string> = {
  low: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
  moderate: "text-sky-300 border-sky-400/30 bg-sky-500/10",
  high: "text-amber-300 border-amber-400/30 bg-amber-500/10",
  extreme: "text-red-300 border-red-400/30 bg-red-500/10",
};

const RISK_LABEL: Record<SearchSpaceRisk, string> = {
  low: "Low — will resolve quickly",
  moderate: "Moderate — may take a while at slow speeds",
  high: "High — this could take a long time to simulate",
  extreme: "Extreme — simulation may run indefinitely, use with care",
};

export default function ConfigurationPanel({
  target,
  onTargetChange,
  showPassword,
  onToggleShowPassword,
  selection,
  onToggleCharset,
  charsetSize,
  maxLength,
  onMaxLengthChange,
  risk,
  disabled,
  acknowledgeRisk,
  onAcknowledgeRiskChange,
}: ConfigurationPanelProps) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 backdrop-blur-xl sm:p-6">
      <div className="flex items-center gap-2 text-slate-100">
        <KeyRound className="h-5 w-5 text-indigo-400" />
        <h2 className="text-lg font-semibold">Configuration</h2>
      </div>

      {/* Target password */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Target Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={target}
            disabled={disabled}
            onChange={(e) => onTargetChange(e.target.value)}
            placeholder="Enter a test password you own"
            className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 pr-10 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {SUGGESTED_PASSWORDS.map((p) => (
            <button
              key={p}
              type="button"
              disabled={disabled}
              onClick={() => onTargetChange(p)}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-slate-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-indigo-200 disabled:opacity-40"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Character sets */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Character Sets</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(Object.keys(CHARSET_DEFINITIONS) as CharsetKey[]).map((key) => (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                selection[key]
                  ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-100"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20"
              } ${disabled ? "pointer-events-none opacity-50" : ""}`}
            >
              <input
                type="checkbox"
                checked={selection[key]}
                onChange={() => onToggleCharset(key)}
                className="h-4 w-4 accent-indigo-500"
              />
              <span className="font-mono text-xs sm:text-sm">{CHARSET_DEFINITIONS[key].label}</span>
            </label>
          ))}
        </div>
        <p className="rounded-md bg-slate-950/50 px-3 py-2 font-mono text-xs text-slate-400">
          Character set size: <span className="font-semibold text-sky-300">{charsetSize}</span>
        </p>
      </div>

      {/* Max length */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Maximum Search Length</label>
          <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-slate-200">{maxLength}</span>
        </div>
        <input
          type="range"
          min={1}
          max={8}
          step={1}
          value={maxLength}
          disabled={disabled}
          onChange={(e) => onMaxLengthChange(Number(e.target.value))}
          className="w-full accent-indigo-500 disabled:opacity-50"
        />
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>1</span>
          <span>8</span>
        </div>
        <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${RISK_STYLES[risk]}`}>
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{RISK_LABEL[risk]}</span>
        </div>
        {risk === "extreme" && (
          <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            <input
              type="checkbox"
              checked={acknowledgeRisk}
              onChange={(e) => onAcknowledgeRiskChange(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 accent-red-500"
            />
            I understand this search space is extremely large and the simulation may run indefinitely until I stop
            it.
          </label>
        )}
      </div>

      <p className="border-t border-white/10 pt-4 text-xs leading-relaxed text-slate-500">
        For educational demonstration only. Use only passwords you own or are authorized to test.
        Nothing is transmitted outside your browser — the target password never leaves this device.
      </p>
    </div>
  );
}
