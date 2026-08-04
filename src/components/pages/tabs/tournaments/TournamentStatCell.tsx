import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface TournamentStatCellProps {
  /**
   * Fixed caption above the figure. It is the whole point of the cell: the row
   * it replaced showed a bare «96», which read as "96 players" when it actually
   * meant "96 seats", and nothing on the card said which.
   */
  caption: string;
  children: ReactNode;
  className?: string;
}

/** One captioned figure in a tournament card's stat strip. */
export function TournamentStatCell({ caption, children, className }: TournamentStatCellProps) {
  return (
    <div
      className={twMerge('flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2', className)}
    >
      <span className="max-w-full truncate text-[8px] leading-none font-bold tracking-[0.16em] text-white/35 uppercase">
        {caption}
      </span>
      <span className="flex max-w-full items-center gap-1 leading-none">{children}</span>
    </div>
  );
}
