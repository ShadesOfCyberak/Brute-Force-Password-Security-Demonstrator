import { BookOpen, ListOrdered, ShieldAlert } from "lucide-react";

const HOW_IT_WORKS = [
  "The attacker/tester chooses a character set (e.g. lowercase, numbers, symbols).",
  "The algorithm systematically generates possible combinations, shortest first.",
  "Each generated combination is compared against the target password.",
  "The process repeats — trying every combination — until the correct one is found.",
  "Longer and more complex passwords require dramatically more combinations to reach.",
];

const WHY_STRONG_PASSWORDS = [
  "Password length is one of the biggest factors — each extra character multiplies the search space.",
  "Larger character sets (mixing case, numbers, symbols) exponentially increase possible combinations.",
  "Unique passwords per account prevent one leak from compromising everything else.",
  "Password managers can generate and store long, random passwords you never have to memorize.",
  "Multi-factor authentication (MFA) adds a second barrier even if a password is guessed or leaked.",
];

export default function EducationalSection() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-slate-200">
          <ListOrdered className="h-4 w-4 text-indigo-400" />
          <h3 className="text-base font-semibold">How Brute Force Works</h3>
        </div>
        <ol className="space-y-2.5">
          {HOW_IT_WORKS.map((line, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-400">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-bold text-indigo-300">
                {i + 1}
              </span>
              {line}
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-slate-200">
          <ShieldAlert className="h-4 w-4 text-emerald-400" />
          <h3 className="text-base font-semibold">Why Strong Passwords Matter</h3>
        </div>
        <ul className="space-y-2.5">
          {WHY_STRONG_PASSWORDS.map((line, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-400">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-2 flex items-start gap-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.06] p-4 text-xs leading-relaxed text-slate-400 sm:text-sm">
        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
        <p>
          This dashboard is a purely local, client-side educational tool. It never sends data to a server, never
          attacks real accounts or services, and is intended to help students and developers visualize why password
          length and complexity matter for security.
        </p>
      </div>
    </div>
  );
}
