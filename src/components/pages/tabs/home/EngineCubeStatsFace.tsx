import dayjs from 'dayjs';
import { CalendarDays, TrendingUp, UserRound } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import '@/styles/components/engine-cube-faces.css';

export interface EngineCubeStatsFaceProps {
  lifetimeProduced: number;
  ticketsPerHour: number;
  engineLevel: number;
  ownerName?: string;
  createdAt?: string;
  accent?: string;
}

export function EngineCubeStatsFace({
  lifetimeProduced,
  ticketsPerHour,
  engineLevel,
  ownerName,
  createdAt,
  accent = 'var(--color-electric-pink)',
}: EngineCubeStatsFaceProps) {
  const t = useAppTranslations();

  const createdLabel = createdAt ? dayjs(createdAt).format('MMM D, YYYY') : null;
  // Sub-1 rates must keep their fraction — a base bronze engine mints 0.5 T/H
  // and rounding it up to "1" doubles the promised output.
  const rounded = Math.max(0, ticketsPerHour);
  const perHour =
    rounded >= 1 ? String(Math.round(rounded * 10) / 10) : String(Math.round(rounded * 100) / 100);

  return (
    <div
      className="cube-hud cube-hud--compact"
      style={{ '--hud-accent': accent } as React.CSSProperties}
    >
      <span className="cube-hud-corner-tr" />
      <span className="cube-hud-corner-bl" />

      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-extrabold uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          {t('engine passport')}
        </span>
        <span
          className="rounded-full border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.18em]"
          style={{
            color: accent,
            borderColor: `color-mix(in srgb, ${accent} 70%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
          }}
        >
          {t('lvl')} {engineLevel}
        </span>
      </div>

      <div className="cube-hud-scanline" />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-start gap-0.5">
          <span className="cube-hud-stat-value cube-hud-stat-value--md">
            {formatCompact(lifetimeProduced)}
          </span>
          <span className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-white/55">
            {t('lifetime tickets')}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="flex items-end gap-1 leading-none">
            <TrendingUp size={14} stroke={accent} strokeWidth={2.6} className="mb-0.5" />
            <span className="cube-hud-stat-value cube-hud-stat-value--md">{perHour}</span>
            <span className="cube-hud-stat-value cube-hud-stat-value--xs mb-0.5">T/H</span>
          </span>
          <span className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-white/55">
            {t('per hour base')}
          </span>
        </div>
      </div>

      <div className="cube-hud-scanline" />

      <div className="mt-auto flex flex-col gap-0.5 text-[9px] font-bold uppercase tracking-[0.14em]">
        {ownerName && (
          <div className="flex items-center justify-between gap-2 text-white/55">
            <span className="flex items-center gap-1">
              <UserRound size={10} stroke={accent} strokeWidth={2.4} />
              {t('owner')}
            </span>
            <span className="text-white">{ownerName}</span>
          </div>
        )}
        {createdLabel && (
          <div className="flex items-center justify-between gap-2 text-white/55">
            <span className="flex items-center gap-1">
              <CalendarDays size={10} stroke={accent} strokeWidth={2.4} />
              {t('created')}
            </span>
            <span className="text-white tabular-nums">{createdLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
