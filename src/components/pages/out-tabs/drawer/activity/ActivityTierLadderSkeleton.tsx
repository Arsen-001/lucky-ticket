import { activityTierOrder } from '@/constants/global.constants';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

/**
 * Placeholder for the tier ladder while `me` is still in flight.
 *
 * It exists for a blunter reason than looking tidy. Rendering the real ladder
 * against the provisional `activityPoints = 0` picks the wrong current tier, and
 * the correction that arrives with the data rewrites every medal's `width` and
 * `src` at once. Whichever medal request is still open at that moment gets
 * cancelled — and Chrome then never resolves that URL again for the page: the
 * element sits at `currentSrc === ''`, `complete === false`, blank forever, while
 * the same URL fetched by hand answers in 20 ms. Mounting each medal once, at its
 * final size, is what actually fixes it.
 */
export function ActivityTierLadderSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="relative">
        <Skeleton variant="line" className="h-2 w-full rounded-full" />
        <div className="pointer-events-none absolute inset-0 flex items-center">
          {activityTierOrder.map(tier => (
            <div key={tier} className="flex-center flex-1">
              <Skeleton variant="round" className="h-7 w-7" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex">
        {activityTierOrder.map(tier => (
          <div key={tier} className="flex flex-1 flex-col items-center gap-1">
            <Skeleton variant="line" className="h-2 w-10" />
            <Skeleton variant="line" className="h-2 w-5" />
          </div>
        ))}
      </div>
    </div>
  );
}
