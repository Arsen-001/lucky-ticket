/** Reward-chip kinds parsed from a Test-Quest reward label. */
export type RewardChipKind = 'lc' | 'ticket' | 'star' | 'ap' | 'lp' | 'engine' | 'other';

/** One parsed drop token, ready to render as an iconified chip. */
export interface RewardChip {
  kind: RewardChipKind;
  /** The token text as authored, e.g. "500k LC", "10 билетов", "LP 3д". */
  text: string;
}

// Keyword → chip kind, first match wins. Ordered so the specific units (engine,
// tickets, LS/AP/LP) are tested before the generic LC coin fallback.
const CHIP_RULES: { re: RegExp; kind: RewardChipKind }[] = [
  { re: /движ/i, kind: 'engine' },
  { re: /билет/i, kind: 'ticket' },
  { re: /\bLS\b/i, kind: 'star' },
  { re: /\bAP\b/i, kind: 'ap' },
  { re: /\bLP\b/i, kind: 'lp' },
  { re: /\bLC\b/i, kind: 'lc' },
];

/**
 * Split a reward label ("500k LC · 10 билетов · LP 3д · 10 LS") into typed chips
 * for iconified rendering. Robust to token order; unknown tokens fall back to
 * `other`. Icons carry the meaning, so a mixed-locale shell still reads cleanly.
 */
export const parseRewardChips = (label: string): RewardChip[] =>
  label
    .split(/\s*[·+]\s*/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(text => ({
      kind: CHIP_RULES.find(r => r.re.test(text))?.kind ?? 'other',
      text,
    }));
