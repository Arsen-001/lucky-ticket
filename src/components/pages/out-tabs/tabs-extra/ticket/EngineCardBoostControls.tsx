'use client';

import { memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Package, Zap } from 'lucide-react';
import { BoostRow } from '@/components/pages/out-tabs/tabs-extra/ticket/BoostRow';
import {
  capacityLevelBonusTickets,
  maxBoostLevel,
  speedLevelBoostPct,
} from '@/utils/global/ticket-engine.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useEngineConfig } from '@/hooks/useEngineConfig';

const SPEED_ACCENT = '#C5B0F8';
const CAPACITY_ACCENT = '#FFE08A';

export interface EngineCardBoostControlsProps {
  engineId: string;
  speedLevel: number;
  capacityLevel: number;
  speedCost: number;
  capacityCost: number;
  compact: boolean;
  onUpgradeSpeed: (engineId: string) => void;
  onUpgradeCapacity: (engineId: string) => void;
  /** An upgrade of this engine is in flight — both rows hold (@see BoostRow). */
  upgradePending?: boolean;
}

/**
 * The speed/capacity upgrade rows. Their inputs change only on an upgrade, so
 * `memo` keeps them from re-rendering on a claim/skip/countdown tick. The
 * `onUpgrade*` props are the id-taking handlers straight from the parent (stable
 * refs); the per-engine closure is created here so the parent doesn't churn a new
 * arrow each render and break this memo.
 */
function EngineCardBoostControlsImpl({
  engineId,
  speedLevel,
  capacityLevel,
  speedCost,
  capacityCost,
  compact,
  onUpgradeSpeed,
  onUpgradeCapacity,
  upgradePending = false,
}: EngineCardBoostControlsProps) {
  const t = useAppTranslations();
  const { tables } = useEngineConfig();

  return (
    <div className={twMerge('flex flex-col', compact ? 'gap-1' : 'mt-1 gap-1.5')}>
      <BoostRow
        label={t('speed')}
        valueText={`+${speedLevelBoostPct(speedLevel, tables)}%`}
        level={speedLevel}
        max={maxBoostLevel(tables)}
        accent={SPEED_ACCENT}
        costStars={speedCost}
        onUpgrade={() => onUpgradeSpeed(engineId)}
        pending={upgradePending}
        compact={compact}
        icon={
          <Zap
            size={compact ? 16 : 14}
            fill={SPEED_ACCENT}
            fillOpacity={0.3}
            stroke={SPEED_ACCENT}
            strokeWidth={2.2}
          />
        }
      />
      <BoostRow
        label={t('capacity')}
        valueText={`+${capacityLevelBonusTickets(capacityLevel, tables)}`}
        level={capacityLevel}
        max={maxBoostLevel(tables)}
        accent={CAPACITY_ACCENT}
        costStars={capacityCost}
        onUpgrade={() => onUpgradeCapacity(engineId)}
        pending={upgradePending}
        compact={compact}
        icon={
          <Package
            size={compact ? 16 : 14}
            fill={CAPACITY_ACCENT}
            fillOpacity={0.18}
            stroke={CAPACITY_ACCENT}
            strokeWidth={2.2}
          />
        }
      />
    </div>
  );
}

export const EngineCardBoostControls = memo(EngineCardBoostControlsImpl);
