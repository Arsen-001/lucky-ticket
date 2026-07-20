'use client';

import { Trophy, Users } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetTestQuestLeaderboardQuery } from '@/api/testQuest.api';

export interface TestQuestLeaderboardProps {
  className?: string;
}

const rankColor = (rank: number): string => {
  if (rank === 1) return 'text-gold';
  if (rank === 2) return 'text-silver';
  if (rank === 3) return 'text-orange';
  return 'text-white/50';
};

/**
 * Friends leaderboard ("Топ по друзьям") — the live referral race that decides
 * the crown (levels 3 → 1). Rendered under the Test-Quest slider.
 */
export function TestQuestLeaderboard({ className }: TestQuestLeaderboardProps) {
  const t = useAppTranslations();
  const { data } = useGetTestQuestLeaderboardQuery();

  if (!data) return null;

  return (
    <div
      className={twMerge(
        'flex flex-col gap-2 rounded-2xl border border-white/10 bg-background-overlay p-3',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex-center h-7 w-7 rounded-lg bg-gradient-to-br from-gold to-orange shadow-md shadow-black/30">
          <Trophy size={14} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold leading-tight">{t('founders leaderboard')}</h3>
          <p className="line-clamp-1 text-[11px] text-pink-secondary">
            {t('founders leaderboard blurb')}
          </p>
        </div>
        {data.myRank != null && (
          <div className="shrink-0 rounded-full bg-pink-gradient px-2.5 py-1 text-[11px] font-bold tabular-nums text-white">
            #{data.myRank}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {data.top.map(row => (
          <div
            key={row.rank}
            className={twMerge(
              'flex items-center gap-2 rounded-xl px-2.5 py-1.5',
              row.isMe ? 'border border-electric-pink/30 bg-electric-pink/15' : 'bg-white/[0.03]'
            )}
          >
            <span
              className={twMerge(
                'w-6 shrink-0 text-center text-xs font-extrabold tabular-nums',
                rankColor(row.rank)
              )}
            >
              {row.rank}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
              {row.username}
            </span>
            <span className="flex shrink-0 items-center gap-1 text-xs font-bold tabular-nums text-teal">
              <Users size={12} />
              {row.referrals}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
