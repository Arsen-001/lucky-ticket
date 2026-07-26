'use client';

import {
  Flame,
  CalendarDays,
  Trophy,
  Medal,
  Percent,
  Coins,
  Ticket,
  Star,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { useGetPlayerStatsQuery } from '@/api/profile.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';
import { GlobalConstants } from '@/constants/global.constants';
import { StatTile } from './StatTile';
import { StatsSection } from './StatsSection';

/** Days between `iso` and now, floored — "в игре N дней". */
function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

/**
 * The player's own lifetime record.
 *
 * Everything here is all-time on purpose — the profile already answers "how am
 * I doing now", so this screen answers "how far have I come". Values the data
 * cannot support yet (no finished tournament → no best place, no win rate) are
 * passed through as null and render as a dash rather than a flattering zero.
 */
export function PlayerStatsContainer() {
  const t = useAppTranslations();
  const { data, isLoading, isError, refetch } = useGetPlayerStatsQuery();

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const lc = GlobalConstants.coinName;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <StatsSection title={t('activity')}>
        <StatTile
          label={t('days in game')}
          value={data ? formatNumber(daysSince(data.since)) : null}
          icon={CalendarDays}
          accent="purple"
          loading={isLoading}
        />
        <StatTile
          label={t('active days')}
          value={data ? formatNumber(data.activity.daysActive) : null}
          icon={Sparkles}
          accent="teal"
          loading={isLoading}
        />
        <StatTile
          label={t('current streak')}
          value={data ? formatNumber(data.activity.currentStreak) : null}
          hint={
            data
              ? `${t('longest streak')}: ${formatNumber(data.activity.longestStreak)}`
              : undefined
          }
          icon={Flame}
          accent="pink"
          loading={isLoading}
        />
        <StatTile
          label={t('activity points')}
          value={data ? formatCompact(data.activity.activityPoints) : null}
          icon={Star}
          accent="gold"
          loading={isLoading}
        />
      </StatsSection>

      <StatsSection title={t('tournaments')}>
        <StatTile
          label={t('tournaments played')}
          value={data ? formatNumber(data.tournaments.played) : null}
          icon={Trophy}
          accent="purple"
          loading={isLoading}
        />
        <StatTile
          label={t('top 3 finishes')}
          value={data ? formatNumber(data.tournaments.won) : null}
          icon={Medal}
          accent="gold"
          loading={isLoading}
        />
        <StatTile
          label={t('best place')}
          value={data?.tournaments.bestPlace != null ? `#${data.tournaments.bestPlace}` : null}
          icon={Medal}
          accent="pink"
          loading={isLoading}
        />
        <StatTile
          label={t('win rate')}
          value={data?.tournaments.winRate != null ? `${data.tournaments.winRate}%` : null}
          icon={Percent}
          accent="teal"
          loading={isLoading}
        />
      </StatsSection>

      <StatsSection title={t('all time')}>
        <StatTile
          label={t('earned in tournaments')}
          value={data ? `${formatCompact(data.tournaments.lcWon)} ${lc}` : null}
          icon={Coins}
          accent="gold"
          loading={isLoading}
        />
        <StatTile
          label={t('total earned')}
          value={data ? `${formatCompact(data.lifetime.lcEarned)} ${lc}` : null}
          icon={Coins}
          accent="teal"
          loading={isLoading}
        />
        <StatTile
          label={t('tickets claimed')}
          value={data ? formatNumber(data.lifetime.ticketsClaimed) : null}
          icon={Ticket}
          accent="purple"
          loading={isLoading}
        />
        <StatTile
          label={t('friends invited')}
          value={data ? formatNumber(data.lifetime.referrals) : null}
          icon={UserPlus}
          accent="pink"
          loading={isLoading}
        />
      </StatsSection>
    </div>
  );
}
