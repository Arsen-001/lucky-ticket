import { activityTierOrder } from '@/constants/global.constants';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

/**
 * Placeholder for the card's two bands while `me` is still in flight.
 *
 * It exists for a blunter reason than looking tidy. Rendering the real ladder
 * against the provisional `activityPoints = 0` picks the wrong current tier, and
 * the correction that arrives with the data rewrites every medal's `width` and
 * `src` at once. Whichever medal request is still open at that moment gets
 * cancelled — and Chrome then never resolves that URL again for the page: the
 * element sits at `currentSrc === ''`, `complete === false`, blank forever, while
 * the same URL fetched by hand answers in 20 ms. Mounting each medal once, at its
 * final size, is what actually fixes it.
 *
 * Same height as the bands it stands in for, so the card does not jump when the
 * data lands.
 */
export function ActivityCardBandsSkeleton() {
  return (
    <>
      <div className="border-t border-white/8 px-4 py-3">
        <Skeleton variant="line" className="h-1.5 w-full rounded-full" />
        <div className="mt-2 flex">
          {activityTierOrder.map(tier => (
            <div key={tier} className="flex flex-1 flex-col items-center gap-1">
              <span className="flex h-9 items-end">
                <Skeleton variant="round" className="h-5 w-5" />
              </span>
              <Skeleton variant="line" className="h-2.5 w-10" />
              <Skeleton variant="line" className="h-2.5 w-6" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-white/8 px-4 py-3">
        <Skeleton variant="line" className="h-2.5 w-24" />
        {[0, 1].map(index => (
          <div key={index} className="flex flex-col gap-1">
            <Skeleton variant="line" className="h-3.5 w-full" />
            <Skeleton variant="line" className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </>
  );
}
