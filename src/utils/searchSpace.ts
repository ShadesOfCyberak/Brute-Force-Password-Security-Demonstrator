/**
 * searchSpace.ts
 * -----------------------------------------------------------------------
 * Pure helper functions for computing the brute-force character set and
 * the resulting theoretical search space. All math uses BigInt because
 * the numbers involved grow extremely fast (exponential) and would
 * quickly exceed Number.MAX_SAFE_INTEGER.
 * -----------------------------------------------------------------------
 */

export const CHARSET_DEFINITIONS = {
  lowercase: { label: "Lowercase (a-z)", chars: "abcdefghijklmnopqrstuvwxyz" },
  uppercase: { label: "Uppercase (A-Z)", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  numbers: { label: "Numbers (0-9)", chars: "0123456789" },
  special: { label: "Special (!@#$%^&*)", chars: "!@#$%^&*" },
} as const;

export type CharsetKey = keyof typeof CHARSET_DEFINITIONS;

export interface CharsetSelection {
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  special: boolean;
}

/** Build the ordered, deduplicated character list used by the generator. */
export function buildCharset(selection: CharsetSelection): string {
  let chars = "";
  (Object.keys(CHARSET_DEFINITIONS) as CharsetKey[]).forEach((key) => {
    if (selection[key]) chars += CHARSET_DEFINITIONS[key].chars;
  });
  return chars;
}

/** Total possible combinations for lengths 1..maxLength given a charset size N. */
export function totalCombinations(charsetSize: number, maxLength: number): bigint {
  const n = BigInt(charsetSize);
  let total = 0n;
  let power = 1n;
  for (let i = 1; i <= maxLength; i++) {
    power *= n;
    total += power;
  }
  return total;
}

/** Combinations for one exact length (N^length). Useful for chart per-length breakdown. */
export function combinationsForLength(charsetSize: number, length: number): bigint {
  return BigInt(charsetSize) ** BigInt(length);
}

/**
 * Verify that every character of the target password is actually included
 * in the selected charset — otherwise the brute force could never succeed.
 */
export function targetIsSearchable(target: string, charset: string): boolean {
  if (!target) return false;
  const set = new Set(charset.split(""));
  return target.split("").every((c) => set.has(c));
}

/** Risk classification used to color-code search-space warnings in the UI. */
export type SearchSpaceRisk = "low" | "moderate" | "high" | "extreme";

export function classifySearchSpace(total: bigint): SearchSpaceRisk {
  if (total < 100_000_000n) return "low"; // < 100 million
  if (total < 100_000_000_000n) return "moderate"; // < 100 billion
  if (total < 1_000_000_000_000_000n) return "high"; // < 1 quadrillion
  return "extreme";
}
