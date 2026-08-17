import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface ButtonSpinnerProps {
  /** Match the glyph it replaces (the star, the label's cap height) so the button keeps its width. */
  size?: number;
  className?: string;
}

/**
 * The in-flight mark for a custom action button — the same `Loader2` the shared
 * `Button` spins for `loading`, for the buttons that cannot be a `Button`
 * (the engine rows, the claim pill: their own gradients, their own metrics).
 *
 * Every tap that waits on the server shows it (user, 18.08.2026): a held button
 * that merely dims reads as broken, and the round trip through the proxy is
 * long enough to notice. Decorative — the button itself carries `aria-busy`.
 */
export function ButtonSpinner({ size = 12, className }: ButtonSpinnerProps) {
  return (
    <Loader2
      aria-hidden
      size={size}
      strokeWidth={2.5}
      className={twMerge('animate-spin shrink-0', className)}
    />
  );
}
