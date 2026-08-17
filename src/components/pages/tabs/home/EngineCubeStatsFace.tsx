import { formatLocalDate } from '@/utils/global/date.utils';
import { CalendarDays, Crown, Sparkles, TrendingUp, UserRound, Zap } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { SuperBoostBadge } from '@/components/shared/badges/SuperBoostBadge';
import { formatCompact, formatTicketRate } from '@/utils/global/number.utils';
import '@/styles/components/engine-cube-faces.css';

export interface EngineCubeStatsFaceProps {
  lifetimeProduced: number;
  ticketsPerHour: number;
  engineLevel: number;
  ownerName?: string;
  createdAt?: string;
  /** Premium status of the owner ("VIP" / "LP"); omitted for a plain account. */
  statusLabel?: string;
  /** VIP level (VIP-only concept); shown inside the status badge. */
  statusLevel?: number;
  /** VIP's additive engine-speed % — the summand it puts into the stack. */
  vipSpeedBoostPct?: number;
  /**
   * Lucky Player's engine-speed FACTOR (1.3 = ×1.3, 1 / absent = none) and what
   * that factor is worth on this engine. Kept apart from the VIP number on
   * purpose: the two stack, and they are not the same kind of boost.
   */
  luckyPlayerSpeedMultiplier?: number;
  luckyPlayerSpeedPct?: number;
  accent?: string;
}

export function EngineCubeStatsFace({
  lifetimeProduced,
  ticketsPerHour,
  engineLevel,
  ownerName,
  createdAt,
  statusLabel,
  statusLevel,
  vipSpeedBoostPct = 0,
  luckyPlayerSpeedMultiplier = 1,
  luckyPlayerSpeedPct = 0,
  accent = 'var(--color-electric-pink)',
}: EngineCubeStatsFaceProps) {
  const t = useAppTranslations();
  const isVipStatus = statusLabel === 'VIP';
  // Lucky Player pink, VIP gold — the same two colours the speed breakdown
  // paints their rows with, so the passport and the ledger name one thing once.
  const statusColor = isVipStatus ? 'var(--color-gold)' : 'var(--color-pink)';
  const hasSuperBoost = luckyPlayerSpeedMultiplier > 1 && luckyPlayerSpeedPct > 0;

  const createdLabel = createdAt ? formatLocalDate(createdAt) : null;
  // The LIVE rate — running boosters included, same as the cycle the countdown
  // shows (DOCS §9.8). `formatTicketRate` keeps a sub-1 rate's fraction: a base
  // bronze engine mints 0.5 T/H and rounding it to "1" doubles the promise.
  const perHour = formatTicketRate(ticketsPerHour);

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
            {t('per hour')}
          </span>
        </div>
      </div>

      <div className="cube-hud-scanline" />

      <div className="mt-auto flex flex-col gap-0.5 text-[9px] font-bold uppercase tracking-[0.14em]">
        {statusLabel && (
          <div className="flex items-center justify-between gap-2 text-white/55">
            <span className="flex items-center gap-1">
              {isVipStatus ? (
                <Crown size={10} stroke="var(--color-gold)" strokeWidth={2.4} />
              ) : (
                <Sparkles size={10} stroke="var(--color-teal)" strokeWidth={2.4} />
              )}
              {t('status')}
            </span>
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-black leading-none"
              style={
                isVipStatus
                  ? {
                      background: 'linear-gradient(135deg, #fff5d9 0%, #f8bd3e 45%, #b8860b 100%)',
                      color: 'var(--color-background)',
                      textShadow: '0 1px 0 rgba(255,255,255,0.35)',
                    }
                  : {
                      color: 'var(--color-teal)',
                      borderWidth: 1,
                      borderColor: 'color-mix(in srgb, var(--color-teal) 60%, transparent)',
                      backgroundColor: 'color-mix(in srgb, var(--color-teal) 18%, transparent)',
                    }
              }
            >
              {isVipStatus ? t('vip level', { level: statusLevel ?? 0 }) : statusLabel}
            </span>
          </div>
        )}
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
        {/* What the owner's statuses actively grant THIS engine, one line each —
            they are two different accelerators and they stack, so a single
            merged number would hide both facts. VIP adds its percentage into the
            stack; Lucky Player multiplies the finished stack, and leads with the
            factor for the same reason the ledger does. */}
        {(vipSpeedBoostPct > 0 || hasSuperBoost) && (
          <div
            className="mt-1 flex flex-col gap-0.5 rounded-md px-1.5 py-1"
            style={{
              backgroundColor: `color-mix(in srgb, ${hasSuperBoost && !isVipStatus ? 'var(--color-pink)' : statusColor} 14%, transparent)`,
            }}
          >
            {vipSpeedBoostPct > 0 && (
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1" style={{ color: 'var(--color-gold)' }}>
                  <Zap size={10} stroke="var(--color-gold)" strokeWidth={2.6} />
                  {t('vip')} {t('speed')}
                </span>
                {/* Rounded like every other boost percentage (EngineStatsLedger) —
                    the engine screen now shows this face right under that ledger,
                    and "+2%" there next to "+1.9%" here reads as two boosts. */}
                <span className="font-black tabular-nums" style={{ color: 'var(--color-gold)' }}>
                  +{Math.round(vipSpeedBoostPct)}%
                </span>
              </div>
            )}
            {hasSuperBoost && (
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1" style={{ color: 'var(--color-pink)' }}>
                  <Sparkles size={10} stroke="var(--color-pink)" strokeWidth={2.6} />
                  {t('lucky player')}
                </span>
                <span className="flex items-center gap-1">
                  <SuperBoostBadge multiplier={luckyPlayerSpeedMultiplier} size="xs" />
                  <span className="text-[8px] font-bold tabular-nums text-white/40">
                    +{Math.round(luckyPlayerSpeedPct)}%
                  </span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
