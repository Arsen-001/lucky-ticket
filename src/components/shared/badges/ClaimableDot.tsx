import { twMerge } from 'tailwind-merge';

export type ClaimableDotSize = 'sm' | 'md';

export interface ClaimableDotProps {
  /**
   * Accessible name. Give it wherever the dot is the only thing saying "there
   * is something to take" (a tab, a section header); leave it off next to a
   * control that already says «Забрать» in words.
   */
  label?: string;
  size?: ClaimableDotSize;
  className?: string;
}

/**
 * «Здесь есть что забрать» — one dot, never a number.
 *
 * The counts already live on the filter chips and the frequency tabs, where a
 * number answers "how many". On a card, a section header or a tab the question
 * is only "is there anything", so this badge deliberately carries no figure:
 * it is the same mark everywhere the app leads to a claimable reward, which is
 * what lets a player follow it from the tab bar down to the row that pays.
 *
 * `animation-blink` rather than `animate-task-pulse`: the pulsing ring belongs
 * to the claim button itself, and a screen with a dozen rings on it stops
 * pointing anywhere. Reduced motion collapses it globally (animations.css).
 */
export function ClaimableDot({ label, size = 'md', className }: ClaimableDotProps) {
  const sizeClasses: Record<ClaimableDotSize, string> = {
    sm: 'size-1.5',
    md: 'size-2.5',
  };

  return (
    <span
      // `img`, not `status`: a live region would re-announce every one of these
      // on each tasks refetch. This is a graphic with a name — read when the
      // row around it is read, and silent otherwise.
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={twMerge(
        // The ring is the background colour, not a light: the dot sits on cards,
        // gradients and photos alike, and without it the pink disappears into
        // the pink frame of a legendary card.
        'animation-blink bg-electric-pink ring-background/80 pointer-events-none inline-block shrink-0 rounded-full shadow-[0_0_8px_rgba(222,0,155,0.85)] ring-2',
        sizeClasses[size],
        className
      )}
    />
  );
}
