/** Reward-chip kinds parsed from a Test-Quest reward label. */
export type RewardChipKind = 'lc' | 'ticket' | 'star' | 'ap' | 'lp' | 'engine' | 'other';

/** One parsed drop token, ready to render as an iconified chip. */
export interface RewardChip {
  kind: RewardChipKind;
  /** Locale-neutral display text: a bare number for kinds whose icon already
   *  carries the unit (tickets, engine), a code + number otherwise ("25k LC",
   *  "LP 3d"). Never a localized unit word, so it reads in any shell locale. */
  text: string;
}

// Keyword → chip kind, first match wins. Matches both the language-neutral tokens
// authored on the front end (TIX, ENG, LC…) and the localized unit words a live
// server may send (Russian "билет", "двигат"), so a mixed-locale response still
// classifies. Ordered so specific units are tested before the generic LC coin.
// "движ" stays alongside "двигат": a server deployed before the term was
// unified still answers with the old word.
const CHIP_RULES: { re: RegExp; kind: RewardChipKind }[] = [
  { re: /двигат|движ|\bENG\b/i, kind: 'engine' },
  { re: /билет|\bTIX\b/i, kind: 'ticket' },
  { re: /\bLS\b/i, kind: 'star' },
  { re: /\bAP\b/i, kind: 'ap' },
  { re: /\bLP\b/i, kind: 'lp' },
  { re: /\bLC\b/i, kind: 'lc' },
];

const kindFor = (token: string): RewardChipKind =>
  CHIP_RULES.find(r => r.re.test(token))?.kind ?? 'other';

// First number in the token, keeping a "k"/"m" magnitude suffix ("300k", "8").
const amountOf = (token: string): string | undefined => /\d+[km]?/i.exec(token)?.[0];

// Locale-neutral display text for a token. The icon carries the unit for tickets
// and engines, so those show a bare number; LP keeps its code + a neutral "d"
// (days); everything else keeps the neutral token as authored (LC/LS/AP/VIP).
const displayText = (token: string, kind: RewardChipKind): string => {
  const amount = amountOf(token);
  if ((kind === 'ticket' || kind === 'engine') && amount) return amount;
  if (kind === 'lp' && amount) return `LP ${amount}d`;
  return token;
};

/**
 * Split a reward label ("300k LC · 8 TIX · LP 3d · 10 LS") into typed chips for
 * iconified rendering. Robust to token order; unknown tokens fall back to
 * `other`. Icons carry the meaning and the text is de-localized to numbers +
 * codes, so a live server's Russian units ("8 билетов") still read cleanly.
 */
export const parseRewardChips = (label: string): RewardChip[] =>
  label
    .split(/\s*[·+]\s*/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(token => {
      const kind = kindFor(token);
      return { kind, text: displayText(token, kind) };
    });
