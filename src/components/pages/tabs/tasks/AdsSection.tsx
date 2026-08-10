'use client';

import { twMerge } from 'tailwind-merge';
import { Eye } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { useSecondsUntil } from '@/hooks/useSecondsUntil';
import { TaskCategory } from '@/types/enums/tasks.enums';
import type { AdSlot, AdsBlock } from '@/types/interfaces/tasks.interfaces';
import { TaskCategoryIcon } from './TaskCategoryIcon';
import { AdWatchCard } from './AdWatchCard';
import { AdBuyMoreCard } from './AdBuyMoreCard';
import { SectionShine } from './SectionShine';
import { ArrivalShine } from '@/components/shared/ArrivalShine';
import { ClaimableDot } from '@/components/shared/badges/ClaimableDot';

export interface AdsSectionProps {
  ads?: AdsBlock;
  loading?: boolean;
  /**
   * Timestamp before which the next ad must not be requested (the pause after
   * a view). Null once the pause is over — or when there has not been one.
   */
  readyAt?: number | null;
  onWatch: (slot: AdSlot) => void;
  /** Opens the buy-extra-views modal; omit to hide the offer entirely. */
  onBuyExtra?: () => void;
  registerSection?: (category: TaskCategory, el: HTMLElement | null) => void;
  className?: string;
  highlightToken?: number | null;
}

/**
 * Rewarded ads on the tasks screen: a header with the day's count, one card for
 * the next view, and the buy-more offer once the free slots are spent.
 *
 * Was a carousel of one card per view. That shape came from a reward ladder
 * that the economy never had — twenty cards, ten rarity frames, one flat
 * reward — and cost 348px of the screen to keep nineteen unreachable cards
 * scrollable. The ladder now lives in the strip inside the card, which marks
 * the views that pay more only when they actually do.
 */
export function AdsSection({
  ads,
  loading,
  readyAt,
  onWatch,
  onBuyExtra,
  registerSection,
  className,
  highlightToken,
}: AdsSectionProps) {
  const t = useAppTranslations();
  const { leftTime, expired } = useCountDown(ads?.resetAt);
  const cooldown = useSecondsUntil(readyAt);

  const slots = ads?.slots ?? [];
  const watched = ads?.watchedToday ?? 0;
  const total = ads?.total ?? 0;
  const nextSlot = slots.find(slot => !slot.watched) ?? null;

  // The offer rides under the card, and only once every slot the player already
  // has is spent — dangling a paid offer next to unwatched free views is just
  // selling them something they already own.
  const extra = ads?.extra;
  const showBuyExtra =
    !!onBuyExtra && !!extra?.enabled && !loading && slots.length > 0 && watched >= total;

  // A bought view pays everything except activity points when the economy valve
  // is closed. Saying so before the tap is the difference between a rule and a
  // missing reward.
  const paidWithoutAp = !!nextSlot?.paid && extra?.grantsAp === false;

  return (
    <section
      ref={el => registerSection?.(TaskCategory.ADS, el)}
      data-category={TaskCategory.ADS}
      className={twMerge(
        'flex scroll-mt-20 flex-col gap-3 border-y border-white/[0.07] px-4 pt-5 pb-5',
        className
      )}
    >
      <header className="relative flex items-center gap-3 overflow-hidden rounded-2xl">
        <SectionShine token={highlightToken ?? null} />
        <TaskCategoryIcon category={TaskCategory.ADS} size={20} />
        <div className="min-w-0 flex-1">
          <ArrivalShine id="watchVideo" variant="title">
            <h2 className="flex items-center gap-1.5 text-base leading-tight font-extrabold">
              <span className="min-w-0 truncate">{t('category ads')}</span>
              {/* A view left in the day is a reward waiting, so it gets the same
                  mark as a claimable task — the chips and the tab count it. */}
              {!!nextSlot && <ClaimableDot label={t('something to claim')} />}
            </h2>
          </ArrivalShine>
          <p className="text-pink-secondary text-[11px]">{t('ads progress', { watched, total })}</p>
        </div>
        {ads?.resetAt && !expired && (
          <span className="flex-center shrink-0 gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/60">
            {t('resets in')}
            <span className="tabular-nums">{leftTime}</span>
          </span>
        )}
      </header>

      {slots.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-6 text-center text-sm text-white/50">
          <Eye size={28} className="mx-auto mb-2 text-white/30" />
          {t('no ads available')}
        </div>
      ) : (
        <AdWatchCard
          slots={slots}
          watchedToday={watched}
          total={total}
          nextSlot={nextSlot}
          cooldownSeconds={cooldown}
          loading={loading}
          paidWithoutAp={paidWithoutAp}
          resetLabel={leftTime}
          onWatch={onWatch}
        />
      )}

      {showBuyExtra && extra && <AdBuyMoreCard extra={extra} onOpen={onBuyExtra} />}
    </section>
  );
}
