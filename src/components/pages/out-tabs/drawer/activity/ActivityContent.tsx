'use client';

import { useGetMeQuery } from '@/api/me.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { effectiveAdsDailyLimit } from '@/utils/global/status.utils';
import { ActivityScoreCard } from './ActivityScoreCard';
import { ActivityActionRow } from './ActivityActionRow';
import { ActivityCardBandsSkeleton } from './ActivityCardBandsSkeleton';
import { ActivityDecayChip } from './ActivityDecayChip';
import { ActivityGateBand } from './ActivityGateBand';
import { ActivityLadderBand } from './ActivityLadderBand';
import { ActivityPerksDisclosure } from './ActivityPerksDisclosure';
import { ActivitySourceGrid } from './ActivitySourceGrid';
import { computeApProgress } from './ap-progress';

/**
 * The AP screen in the LC wallet's card language: one dark object carrying the
 * score, where the five tiers sit, how far this player is along the two halves
 * of the next gate, and the three screens where AP is earned.
 *
 * The two bands divide the work rather than repeat it — the ladder is the map,
 * the gate is this player's position on it. Decay rides in the header chip and
 * the pace takes the subline, so neither costs a band; the catalogue opens on
 * the four sources that pay fastest at this tier and keeps the other nine
 * behind one tap.
 */
export function ActivityContent() {
  const t = useAppTranslations();
  const { data: me, isLoading, isError, refetch } = useGetMeQuery();

  const progress = computeApProgress(
    me?.activityPoints ?? 0,
    me?.referralsCount ?? 0,
    me?.lastActivityAt
  );
  const watchVideoLimit = effectiveAdsDailyLimit(
    me?.isLuckyPlayer ?? false,
    me?.isVIP ?? false,
    me?.statusPerks
  );
  const accent = `var(--color-${progress.tier})`;

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-2">
      <ActivityScoreCard
        tier={progress.tier}
        activityPoints={me?.activityPoints}
        loading={isLoading}
        chip={!isLoading && <ActivityDecayChip decay={progress.decay} />}
        subline={t('~{n} AP per day without donation', { n: progress.dailyBaseline })}
        className="animate-slide-in-bottom"
      >
        {isLoading ? (
          <ActivityCardBandsSkeleton />
        ) : (
          <>
            <ActivityLadderBand tierIdx={progress.tierIdx} />
            {progress.nextTier && (
              <ActivityGateBand
                nextTier={progress.nextTier}
                activityPoints={me?.activityPoints ?? 0}
                referralsCount={me?.referralsCount ?? 0}
              />
            )}
          </>
        )}
        <ActivityActionRow accent={accent} />
      </ActivityScoreCard>

      <ActivitySourceGrid tier={progress.tier} watchVideoLimit={watchVideoLimit} />

      <ActivityPerksDisclosure
        tier={progress.tier}
        nextTier={progress.nextTier}
        refGap={progress.refGap}
      />
    </div>
  );
}
