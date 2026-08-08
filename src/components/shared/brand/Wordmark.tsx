import { twMerge } from 'tailwind-merge';
import '@/styles/components/wordmark.css';

/**
 * The brand lockup — the single place the wordmark is painted. `Lucky` is white,
 * `Ticket` rides the brand gradient and `365` the gold one, the same lockup as
 * the admin panel's top-left corner and the landing page. Per the locked brand
 * rule it is ALWAYS one unbroken word: never split across lines, never a
 * standalone "365".
 *
 * Callers pass only a size (`text-sm`, `text-[40px]`, a clamp via their own
 * class) — face, weight and paint stay here so the brand cannot drift per screen.
 */
const SEGMENTS = [
  { text: 'Lucky', className: 'wordmark__lucky' },
  { text: 'Ticket', className: 'wordmark__ticket' },
  { text: '365', className: 'wordmark__accent' },
] as const;

/** Guardrail anchor: must equal `GlobalConstants.projectName` (see tests). */
export const WORDMARK_TEXT = SEGMENTS.map(segment => segment.text).join('');

export interface WordmarkProps {
  className?: string;
}

export function Wordmark({ className }: WordmarkProps) {
  return (
    <span className={twMerge('wordmark', className)}>
      {SEGMENTS.map(segment => (
        <span key={segment.text} className={segment.className}>
          {segment.text}
        </span>
      ))}
    </span>
  );
}
