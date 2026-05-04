import { Skeleton } from '@/components/shared/seleketons/Skeleton';

export interface TournamentSlidersSkeletonProps {
  /** How many slider rows to draw — usually mirrors the tab's slider count. */
  count: number;
}

/**
 * Lightweight placeholder shown for ~300ms while the tournament sub-tab swaps
 * its slider content. Mirrors the real slider layout so the transition feels
 * intentional instead of janky.
 */
export function TournamentSlidersSkeleton({ count }: TournamentSlidersSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          {/* Header row */}
          <div className="flex items-center gap-2">
            <Skeleton variant="card" className="w-7 h-7 rounded-lg" />
            <div className="min-w-0 flex-1 flex flex-col gap-1">
              <Skeleton variant="line" className="w-32 h-4" />
              <Skeleton variant="line" className="w-48 h-3" />
            </div>
          </div>
          {/* Carousel placeholders */}
          <div className="scrollbar-hidden -mx-4 flex gap-[27px] overflow-hidden px-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton
                key={j}
                variant="card"
                className="shrink-0 w-[176px] h-[200px] rounded-2xl"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
