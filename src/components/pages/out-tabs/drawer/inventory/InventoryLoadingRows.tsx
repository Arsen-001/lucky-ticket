import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { staggerMs } from '@/utils/global/animation.utils';

export interface InventoryLoadingRowsProps {
  /** How many placeholder rows to draw — one screenful is plenty. */
  count?: number;
}

/**
 * What the inventory looks like while it is being fetched.
 *
 * Not decoration: with real data still in flight every number on this screen is
 * a truthful-looking zero — "+0%", "0 of 20 slots", "Chips 0", and a shard row
 * that says «no shards yet» next to a «where shards come from» button. For the
 * ~400–1200 ms the request takes, a player with a full collection is told they
 * own nothing. A placeholder says "loading" and cannot be misread as an answer.
 */
export function InventoryLoadingRows({ count = 4 }: InventoryLoadingRowsProps) {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="animate-slide-in-bottom flex items-center gap-3 rounded-2xl border border-white/8 bg-black/25 p-2.5"
          style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
        >
          <Skeleton variant="rounded-rectangle" className="h-16 w-16 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton variant="line" className="h-3 w-24" />
            <Skeleton variant="line" className="h-2.5 w-32" />
            <Skeleton variant="line" className="h-1 w-full" />
          </div>
          <Skeleton variant="rounded-rectangle" className="h-9 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}
