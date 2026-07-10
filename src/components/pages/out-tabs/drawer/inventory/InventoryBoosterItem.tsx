'use client';

import { Timer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { BoosterIcon } from '@/components/shared/icons/BoosterIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { CHIP_TYPE_ICON, QUALITY_ACCENT } from '@/utils/global/inventory.utils';
import type { InventoryBooster } from '@/types/interfaces/inventory.interfaces';
import type { Dictionary } from '@/types/types/i18n.types';

export interface InventoryBoosterItemProps {
  booster: InventoryBooster;
  index: number;
  onActivate?: (booster: InventoryBooster) => void;
}

export function InventoryBoosterItem({ booster, index, onActivate }: InventoryBoosterItemProps) {
  const t = useAppTranslations();
  const { leftTime, expired } = useCountDown(booster.expiresAt);
  const TypeMarker = CHIP_TYPE_ICON[booster.type];
  const accent = QUALITY_ACCENT[booster.quality];
  const typeLabel = booster.type === 'speed' ? t('time') : t('capacity');
  // An expired active booster (backend hasn't swept it yet) renders as inactive.
  const isActive = !!booster.activeOnEngineId && !!booster.expiresAt && !expired;

  return (
    <div
      className="shine-card animate-slide-in-bottom relative flex items-center gap-3 overflow-hidden rounded-2xl p-3"
      style={{
        animationDelay: `${index * 60}ms`,
        ['--shine-card-accent' as string]: accent,
      }}
    >
      <BoosterIcon type={booster.type} tier={booster.quality} size={64} className="shrink-0" />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className="text-[14px] font-extrabold uppercase tracking-[0.16em] leading-none"
          style={{ color: accent }}
        >
          {typeLabel} {t('booster')}
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-full border px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider"
            style={{
              color: accent,
              borderColor: `color-mix(in srgb, ${accent} 65%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)`,
            }}
          >
            {t(booster.quality as Parameters<Dictionary>[0])}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-white/70">
            <TypeMarker size={11} stroke="currentColor" strokeWidth={2.4} />+{booster.effectPct}%
          </span>
          {isActive && (
            <span className="rounded-full border border-success/40 bg-success/15 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-success">
              {t('active')}
            </span>
          )}
        </div>
        <span className="mt-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/55">
          <Timer size={11} strokeWidth={2.4} />
          {isActive ? (
            <span className="tabular-nums" style={{ color: accent }}>
              {leftTime}
            </span>
          ) : (
            t('{n}h duration', { n: booster.durationHours })
          )}
        </span>
      </div>

      <div className="shrink-0">
        <Button onClick={() => onActivate?.(booster)} className={twMerge('px-3 py-2 text-[11px]')}>
          {t('activate')}
        </Button>
      </div>
    </div>
  );
}
