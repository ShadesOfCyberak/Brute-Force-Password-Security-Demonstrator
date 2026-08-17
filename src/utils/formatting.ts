/**
 * formatting.ts
 * -----------------------------------------------------------------------
 * Small collection of pure helper functions used across the dashboard to
 * present numbers, time spans and big integers in a human readable way.
 * Kept free of any React / DOM dependency so it can be unit tested and
 * reused inside the Web Worker as well (copied there as plain JS source).
 * -----------------------------------------------------------------------
 */

/** Format an integer/BigInt with thousands separators, e.g. 1234567 -> "1,234,567" */
export function formatNumber(value: number | bigint): string {
  return value.toLocaleString("en-US");
}

/**
 * Format a (possibly huge) BigInt into a compact, readable string.
 * Small numbers get plain thousands separators, very large ones fall back
 * to scientific notation so the UI never overflows.
 */
export function formatBigNumber(value: bigint): string {
  const asString = value.toString();
  if (asString.length <= 15) {
    return formatNumber(value);
  }
  // Convert to approximate scientific notation for very large numbers.
  const exponent = asString.length - 1;
  const mantissa = `${asString[0]}.${asString.slice(1, 4)}`;
  return `${mantissa} × 10^${exponent}`;
}

/** Format milliseconds as a human readable duration string (e.g. "1m 03.4s"). */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0.000s";
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(3)}s`;
  }
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  if (minutes < 60) {
    return `${minutes}m ${seconds.toFixed(1)}s`;
  }
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return `${hours}h ${remMinutes}m`;
}

/** Format an attempts-per-second rate. */
export function formatRate(rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0) return "0 /s";
  return `${formatNumber(Math.round(rate))} /s`;
}

/** Rough, human friendly estimate of how long a search would take at a given rate. */
export function estimateTimeToExhaust(totalCombinations: bigint, ratePerSecond: number): string {
  if (ratePerSecond <= 0) return "unknown";
  const secondsBig = totalCombinations / BigInt(Math.max(1, Math.round(ratePerSecond)));
  const seconds = Number(secondsBig);
  if (!Number.isFinite(seconds) || seconds > 1e15) return "longer than the age of the universe";
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes.toFixed(1)} minutes`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)} hours`;
  const days = hours / 24;
  if (days < 365) return `${days.toFixed(1)} days`;
  const years = days / 365;
  return `${formatNumber(Math.round(years))} years`;
}
