import { ShieldCheck, TerminalSquare } from "lucide-react";

/** Top page header with title, subtitle and a "local simulation" badge. */
export default function Header() {
  return (
    <header className="relative overflow-hidden border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-20%,rgba(99,102,241,0.25),transparent_55%),radial-gradient(circle_at_80%_120%,rgba(56,189,248,0.18),transparent_50%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 shadow-lg shadow-indigo-950/40 sm:h-14 sm:w-14">
            <TerminalSquare className="h-6 w-6 text-white sm:h-8 sm:w-8" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-white via-indigo-100 to-sky-200 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl lg:text-3xl">
              Brute-Force Password Security Demonstrator
            </h1>
            <p className="mt-1 text-sm text-slate-400 sm:text-base">
              Educational simulation of password search-space complexity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-300 sm:self-auto">
          <ShieldCheck className="h-4 w-4" />
          LOCAL SIMULATION
        </div>
      </div>
    </header>
  );
}
