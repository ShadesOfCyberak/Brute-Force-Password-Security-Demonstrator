import { useMemo, useState } from "react";
import Header from "@/components/Header";
import ConfigurationPanel from "@/components/ConfigurationPanel";
import SimulationPanel from "@/components/SimulationPanel";
import ResultsPanel from "@/components/ResultsPanel";
import SearchSpaceCalculator from "@/components/SearchSpaceCalculator";
import ComplexityChart from "@/components/ComplexityChart";
import EducationalSection from "@/components/EducationalSection";
import { useBruteForce, type SimSpeed } from "@/hooks/useBruteForce";
import {
  buildCharset,
  classifySearchSpace,
  targetIsSearchable,
  totalCombinations,
  type CharsetKey,
  type CharsetSelection,
} from "@/utils/searchSpace";

const DEFAULT_SELECTION: CharsetSelection = {
  lowercase: true,
  uppercase: false,
  numbers: true,
  special: false,
};

export default function App() {
  const [target, setTarget] = useState("abc12");
  const [showPassword, setShowPassword] = useState(false);
  const [selection, setSelection] = useState<CharsetSelection>(DEFAULT_SELECTION);
  const [maxLength, setMaxLength] = useState(5);
  const [speed, setSpeedState] = useState<SimSpeed>("normal");
  const [acknowledgeRisk, setAcknowledgeRisk] = useState(false);

  const {
    status,
    currentCandidate,
    attempts,
    elapsedTime,
    attemptsPerSecond,
    currentLength,
    recentCandidates,
    foundResult,
    chartData,
    charsetSize: activeCharsetSize,
    start,
    pause,
    resume,
    stop,
    reset,
    setSpeed,
  } = useBruteForce();

  const charset = useMemo(() => buildCharset(selection), [selection]);
  const totalCombos = useMemo(() => totalCombinations(charset.length || 1, maxLength), [charset, maxLength]);
  const risk = useMemo(() => classifySearchSpace(totalCombos), [totalCombos]);

  const isIdleForConfig = status === "READY" || status === "PASSWORD FOUND" || status === "STOPPED" || status === "NOT FOUND";

  const validationMessage = useMemo(() => {
    if (!target) return "Target password cannot be empty.";
    if (charset.length === 0) return "Select at least one character set.";
    if (!targetIsSearchable(target, charset)) {
      return "Target password contains characters outside the selected character sets — it can never be found.";
    }
    if (target.length > maxLength) {
      return "Target password is longer than the configured maximum search length.";
    }
    if (risk === "extreme" && !acknowledgeRisk) {
      return "This search space is extremely large. Please acknowledge the warning below before starting.";
    }
    return null;
  }, [target, charset, maxLength, risk, acknowledgeRisk]);

  const canStart = validationMessage === null;

  function handleToggleCharset(key: CharsetKey) {
    setSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleStart() {
    if (!canStart) return;
    start({ target, charset, maxLength, speed });
  }

  function handleSpeedChange(next: SimSpeed) {
    setSpeedState(next);
    setSpeed(next);
  }

  function handleRunAgain() {
    reset();
  }

  const displayedCharsetSize = status === "READY" ? charset.length : activeCharsetSize || charset.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Decorative background grid */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px]" />

      <Header />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
          <div className="flex flex-col gap-6">
            <ConfigurationPanel
              target={target}
              onTargetChange={setTarget}
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword((v) => !v)}
              selection={selection}
              onToggleCharset={handleToggleCharset}
              charsetSize={charset.length}
              maxLength={maxLength}
              onMaxLengthChange={setMaxLength}
              risk={risk}
              disabled={!isIdleForConfig}
              acknowledgeRisk={acknowledgeRisk}
              onAcknowledgeRiskChange={setAcknowledgeRisk}
            />
            <SearchSpaceCalculator charsetSize={charset.length} maxLength={maxLength} totalCombinations={totalCombos} />
          </div>

          <div className="flex flex-col gap-6">
            <SimulationPanel
              status={status}
              currentCandidate={currentCandidate}
              attempts={attempts}
              elapsedTime={elapsedTime}
              attemptsPerSecond={attemptsPerSecond}
              currentLength={currentLength}
              maxLength={maxLength}
              recentCandidates={recentCandidates}
              totalCombinations={totalCombos}
              target={target}
              speed={speed}
              onSpeedChange={handleSpeedChange}
              onStart={handleStart}
              onPause={pause}
              onResume={resume}
              onStop={stop}
              onReset={reset}
              canStart={canStart}
              validationMessage={validationMessage}
            />

            {foundResult && <ResultsPanel result={foundResult} onRunAgain={handleRunAgain} />}

            <ComplexityChart chartData={chartData} charsetSize={displayedCharsetSize} maxLength={maxLength} />
          </div>
        </div>

        <EducationalSection />

        <footer className="pb-8 pt-2 text-center text-xs text-slate-600">
          Brute-Force Password Security Demonstrator — 100% client-side educational simulation. No data leaves your
          browser.
        </footer>
      </main>
    </div>
  );
}
