'use client';

import '@/styles/components/stakes.css';
import { Ticket } from '@/components/shared/icons/Ticket';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { findLevelDef, formatStakeRelative } from '@/utils/global/stakes.utils';
import { StakesLevelChip } from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
import type { StakeHistoryEntry, StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';

export interface StakesHistoryRowProps {
  entry: StakeHistoryEntry;
  levels: StakeLevelDefinition[];
}

export function StakesHistoryRow({ entry, levels }: StakesHistoryRowProps) {
  const t = useAppTranslations();
  const levelDef = findLevelDef(levels, entry.level);

  if (!levelDef) return null;

  return (
    <div className="stake-card-shell stake-card-border flex items-center gap-3 px-3 py-2.5">
      <Ticket type={levelDef.guaranteedTicket} width={44} height={44} className="shrink-0" />

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <StakesLevelChip level={levelDef.level} tier={levelDef.guaranteedTicket} size="sm" />
          <span className="text-pink-secondary text-[10px] font-semibold">
            {formatStakeRelative(entry.completedAt, t)}
          </span>
        </div>
        <div className="text-white-secondary mt-1 text-[11px]">
          {entry.outcome === 'cancelled' ? (
            <span className="font-bold text-error/90">{t('cancelled · LC returned')}</span>
          ) : (
            <span>
              {t('{count} tickets', { count: entry.ticketsCount })}
              {entry.bonusLC > 0 && (
                <>
                  {' · '}
                  <span className="text-gold font-bold">
                    +{entry.bonusLC.toLocaleString()} {GlobalConstants.coinName}
                  </span>
                </>
              )}
              {entry.bonusStars > 0 && (
                <>
                  {' · '}
                  <span className="text-gold font-bold">
                    +{entry.bonusStars} {t('stars')}
                  </span>
                </>
              )}
            </span>
          )}
        </div>
      </div>

      <div className="relative flex items-center gap-1">
        <CoinIcon size={20} />
        <span className="text-gold text-[11px] font-bold tabular-nums">
          {entry.amount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
