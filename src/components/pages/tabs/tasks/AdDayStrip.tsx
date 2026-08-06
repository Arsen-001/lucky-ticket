import { twMerge } from 'tailwind-merge';
import { TaskRewardType } from '@/types/enums/tasks.enums';
import type { AdSlot } from '@/types/interfaces/tasks.interfaces';

/** Currencies an ordinary view never pays — what makes a slot worth marking. */
const RARE_TYPES: TaskRewardType[] = [TaskRewardType.STARS, TaskRewardType.TICKETS];

/**
 * Slots worth pointing at ahead of time: the ones paying stars or a ticket.
 *
 * "Anything above the usual reward" was the first rule and it was wrong on the
 * live ladder — with the admin's ten steps (view 1 pays 1 AP, most pay AP + LC,
 * only 5 and 10 pay a star or a ticket) it marked **seven slots out of ten**.
 * A mark on 70% of the strip is a background, not a mark; that is the same
 * mistake the old carousel made with ten rarity frames over one flat reward.
 *
 * Stars and tickets are the two things a view cannot pay by default, so they
 * are the honest "look here". Empty when nothing rare is on the ladder (the
 * app's out-of-the-box state) and, at the other end, when *every* slot is rare
 * — marking all of them says nothing either.
 */
function findStandoutSlots(slots: AdSlot[]): Set<string> {
  if (slots.length < 2) return new Set();

  const standout = new Set<string>();
  for (const slot of slots) {
    if (slot.rewards.some(reward => RARE_TYPES.includes(reward.type))) standout.add(slot.id);
  }
  return standout.size === slots.length ? new Set() : standout;
}

export interface AdDayStripProps {
  slots: AdSlot[];
  /** The slot that can be watched right now; `-1` once the day is spent. */
  activeIndex: number;
  className?: string;
}

/**
 * The day as one tick per view: spent ones filled violet, the live one pink and
 * taller, the ones that pay more marked gold *before* they are reached.
 *
 * It replaced a carousel of twenty cards. Nineteen of those were unreachable at
 * any moment and had to be scrolled past; the same information fits a 16px
 * strip that needs no interaction at all.
 */
export function AdDayStrip({ slots, activeIndex, className }: AdDayStripProps) {
  if (!slots.length) return null;
  const standout = findStandoutSlots(slots);

  return (
    <div className={twMerge('flex items-end gap-[3px]', className)} aria-hidden>
      {slots.map((slot, index) => {
        const isNext = index === activeIndex;
        const rich = standout.has(slot.id);
        return (
          <span
            key={slot.id}
            className={twMerge(
              'h-2.5 flex-1 rounded-[3px] bg-white/8',
              slot.watched && 'from-electric-purple/55 to-gradient-purple bg-gradient-to-b',
              !slot.watched && slot.paid && 'bg-gold/30',
              !slot.watched && rich && 'from-gold/85 to-bronze/70 bg-gradient-to-b',
              isNext && 'bg-pink-gradient h-4 shadow-[0_0_8px_rgba(222,0,155,0.5)]',
              // A live slot that also pays more keeps the pink fill and takes
              // the gold as an inner edge — otherwise one of the two facts
              // always loses.
              isNext && rich && 'shadow-[0_0_8px_rgba(222,0,155,0.5),inset_0_0_0_1.5px_#f8bd3e]',
              // Same trick once it is spent: violet fill, gold memory.
              slot.watched && rich && 'shadow-[inset_0_0_0_1px_rgba(248,189,62,0.55)]'
            )}
          />
        );
      })}
    </div>
  );
}
