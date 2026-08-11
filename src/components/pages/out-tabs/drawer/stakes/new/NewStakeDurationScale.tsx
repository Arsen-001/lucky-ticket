'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { triggerHaptic } from '@/utils/global/haptic.utils';
import { computeStakeAprPercent, type StakeMathKnobs } from '@/utils/global/stakes.utils';

export interface NewStakeDurationScaleProps {
  months: number;
  knobs: StakeMathKnobs;
  onChange: (months: number) => void;
  className?: string;
}

/** Bar heights, in px, from the shortest duration to the longest. */
const BAR_MIN = 8;
const BAR_MAX = 34;
/** How many neighbours bulge around the finger, and by how much at the centre. */
const FISHEYE_REACH = 3;
const FISHEYE_MAX = 1.5;

/**
 * The duration control: one scale, and it scrubs.
 *
 * This screen used to carry two controls for the same number — a range input
 * and, under it, a bar chart of the APR per month that only responded to taps.
 * Two widgets for one value is one too many, and the chart was the one that
 * actually says something (it shows what a longer lock buys), so the range
 * input is gone and the chart took over the gesture: press anywhere on it and
 * drag left/right, the month under the finger follows, and it stays where the
 * finger lifts. Same interaction as the test-quest rail (`TestQuestRewardRail`),
 * rotated to the horizontal.
 *
 * `touch-action: none` keeps the drag inside the scale instead of scrolling the
 * sheet underneath it, a plain tap is a zero-length drag so it still selects,
 * and the whole thing is one `slider` for keyboards and screen readers.
 */
export function NewStakeDurationScale({
  months,
  knobs,
  onChange,
  className,
}: NewStakeDurationScaleProps) {
  const t = useAppTranslations();
  const trackRef = useRef<HTMLDivElement>(null);
  // Month under the finger while scrubbing; null when idle.
  const [scrubMonth, setScrubMonth] = useState<number | null>(null);

  const { durationMinMonths: minM, durationMaxMonths: maxM } = knobs;
  const steps = Math.max(1, maxM - minM + 1);
  const clamped = Math.min(Math.max(months, minM), maxM);
  const activeMonth = scrubMonth ?? clamped;

  /** Viewport X → month, clamped to the track. */
  const monthAt = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return clamped;
    const index = Math.floor(((clientX - rect.left) / rect.width) * steps);
    return Math.min(maxM, Math.max(minM, minM + index));
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Claims the pointer so the drag keeps reporting once the finger wanders off
    // the bars — without it the gesture dies the moment it leaves vertically.
    trackRef.current?.setPointerCapture(e.pointerId);
    const month = monthAt(e.clientX);
    setScrubMonth(month);
    onChange(month);
    triggerHaptic('light');
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (scrubMonth == null) return;
    const month = monthAt(e.clientX);
    if (month === scrubMonth) return;
    setScrubMonth(month);
    onChange(month);
    triggerHaptic('light'); // one tick per month crossed — the scale feels notched
  };

  const handlePointerUp = () => {
    if (scrubMonth == null) return;
    onChange(scrubMonth); // where the finger lifts is where it stays
    setScrubMonth(null);
    triggerHaptic('medium');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
    if (!step && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    const target = e.key === 'Home' ? minM : e.key === 'End' ? maxM : clamped + step;
    onChange(Math.min(maxM, Math.max(minM, target)));
  };

  const scrubbing = scrubMonth != null;
  const aprRange = knobs.aprMaxPercent - knobs.aprMinPercent;

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={t('pick duration')}
      aria-valuemin={minM}
      aria-valuemax={maxM}
      aria-valuenow={activeMonth}
      aria-valuetext={t('{n} months', { n: activeMonth })}
      onKeyDown={handleKeyDown}
      className={twMerge('outline-none', className)}
    >
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        // touch-action: none — the drag belongs to the scale, not to the sheet
        // scrolling underneath it. py-2 widens the grab strip past the bars.
        className="flex touch-none select-none items-end justify-between gap-0.5 py-2"
      >
        {Array.from({ length: steps }, (_, i) => {
          const month = minM + i;
          const ratio =
            aprRange > 0
              ? (computeStakeAprPercent(month, knobs) - knobs.aprMinPercent) / aprRange
              : 0;
          const isActive = month === activeMonth;
          // Fish-eye: bars swell around the finger so the month being picked
          // stays readable past it — transform only, nothing in layout moves.
          const distance = scrubbing ? Math.abs(month - scrubMonth) : Infinity;
          const bulge =
            distance <= FISHEYE_REACH ? 1 + (FISHEYE_MAX - 1) * (1 - distance / FISHEYE_REACH) : 1;

          return (
            <div key={month} className="flex flex-1 flex-col items-center gap-1">
              <div
                style={{
                  height: `${BAR_MIN + ratio * (BAR_MAX - BAR_MIN)}px`,
                  transform: bulge > 1 ? `scaleX(${bulge.toFixed(2)})` : undefined,
                }}
                className={twMerge(
                  'w-full rounded-sm transition-[background-color,box-shadow] duration-200',
                  isActive
                    ? 'bg-electric-pink shadow-[0_0_12px] shadow-electric-pink/60'
                    : 'bg-electric-purple/30'
                )}
              />
              <span
                className={twMerge(
                  'text-[8px] tabular-nums',
                  isActive ? 'text-electric-pink font-extrabold' : 'font-bold text-white/30'
                )}
              >
                {month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
