import { Package, Zap } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useEngineConfig } from '@/hooks/useEngineConfig';
import {
  capacityLevelBonusTickets,
  engineLevelBoostPct,
  speedLevelBoostPct,
} from '@/utils/global/ticket-engine.utils';
import type { InventoryBooster, InventoryChip } from '@/types/interfaces/inventory.interfaces';
import '@/styles/components/engine-cube-faces.css';

export interface EngineCubeBackFaceProps {
  engineLevel: number;
  speedLevel: number;
  capacityLevel: number;
  baseCycleSeconds: number;
  baseCapacity: number;
  /** Aggregated additive speed-boost % from all sources (level + chip + booster + LP + ...). */
  totalBoostPct: number;
  /** Speed-boost % granted by status (LP or VIP — whichever is active). 0 if neither. */
  luckyPlayerBoostPct?: number;
  /** Short status label for the boost row (e.g. "LP", "VIP"). Defaults to "LP". */
  statusLabel?: string;
  /** Speed-boost % from the equipped avatar (0 if none) — its own row when > 0. */
  avatarBoostPct?: number;
  speedChip?: InventoryChip;
  capacityChip?: InventoryChip;
  speedBooster?: InventoryBooster;
  capacityBooster?: InventoryBooster;
  accent?: string;
}

const formatHumanCycle = (seconds: number): string => {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${total}s`;
};

const SPEED_ACCENT = '#C5B0F8';
const CAPACITY_ACCENT = '#FFE08A';

interface StatRowProps {
  label: string;
  children: React.ReactNode;
}

function StatRow({ label, children }: StatRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="w-14 shrink-0 text-[9px] font-extrabold uppercase tracking-[0.16em] text-white/45">
        {label}
      </span>
      <div className="flex flex-1 items-center justify-end gap-2.5 text-[10.5px] tabular-nums">
        {children}
      </div>
    </div>
  );
}

interface InlineStatProps {
  icon: React.ReactNode;
  text: string;
  dim?: boolean;
}

function InlineStat({ icon, text, dim }: InlineStatProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-0.5',
        dim ? 'text-white/30' : 'font-bold text-white'
      )}
    >
      {icon}
      {text}
    </span>
  );
}

export function EngineCubeBackFace({
  engineLevel,
  speedLevel,
  capacityLevel,
  baseCycleSeconds,
  baseCapacity,
  totalBoostPct,
  luckyPlayerBoostPct = 0,
  statusLabel,
  avatarBoostPct = 0,
  speedChip,
  capacityChip,
  speedBooster,
  capacityBooster,
  accent = 'var(--color-electric-pink)',
}: EngineCubeBackFaceProps) {
  const t = useAppTranslations();
  const { tables } = useEngineConfig();
  const lvl = t('lvl');
  // Mirrors `engineCapacity()`: the capacity sub-level adds ABSOLUTE tickets
  // (+1 per paid tap by default) on top of the engine-level base, then the
  // chip/booster % scales the whole batch. TOTAL shows the resulting
  // per-cycle output, matching the "×N" language of the base row.
  const capacityBonus = capacityLevelBonusTickets(capacityLevel, tables);
  // The engine's own speed contribution = promotion-level boost (+100 %/level,
  // §10.2) PLUS the speed sub-level. Folding both under "engine" keeps TOTAL
  // reconcilable — the promotion boost was previously summed into TOTAL with no
  // row of its own, so a promoted engine's rows no longer added up.
  const engineSpeedBoost =
    engineLevelBoostPct(engineLevel, tables) + speedLevelBoostPct(speedLevel, tables);
  const capacityChipPct = (capacityChip?.effectPct ?? 0) + (capacityBooster?.effectPct ?? 0);
  const totalCapacity = Math.max(
    1,
    Math.round((baseCapacity + capacityBonus) * (1 + capacityChipPct / 100))
  );

  return (
    <div
      className="cube-hud cube-hud--bare"
      style={{ '--hud-accent': accent } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-extrabold uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          {t('engine stats')}
        </span>
        <span
          className="rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.18em]"
          style={{
            color: accent,
            borderColor: `color-mix(in srgb, ${accent} 70%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
          }}
        >
          {lvl} {engineLevel}
        </span>
      </div>

      <div className="cube-hud-scanline" />

      <div className="flex flex-col gap-2.5">
        <StatRow label={t('base')}>
          <InlineStat
            icon={<Zap size={11} stroke={SPEED_ACCENT} strokeWidth={2.6} />}
            text={formatHumanCycle(baseCycleSeconds)}
          />
          <InlineStat
            icon={<Package size={11} stroke={CAPACITY_ACCENT} strokeWidth={2.6} />}
            text={`×${baseCapacity}`}
          />
        </StatRow>

        <StatRow label={t('engine')}>
          <InlineStat
            icon={<Zap size={11} stroke={SPEED_ACCENT} strokeWidth={2.6} />}
            text={`+${engineSpeedBoost}%`}
            dim={engineSpeedBoost === 0}
          />
          <InlineStat
            icon={<Package size={11} stroke={CAPACITY_ACCENT} strokeWidth={2.6} />}
            text={`+${capacityBonus}`}
            dim={capacityLevel === 0}
          />
        </StatRow>

        <StatRow label={t('chip')}>
          <InlineStat
            icon={<Zap size={11} stroke={SPEED_ACCENT} strokeWidth={2.6} />}
            text={speedChip ? `+${speedChip.effectPct}%` : '—'}
            dim={!speedChip}
          />
          <InlineStat
            icon={<Package size={11} stroke={CAPACITY_ACCENT} strokeWidth={2.6} />}
            text={capacityChip ? `+${capacityChip.effectPct}%` : '—'}
            dim={!capacityChip}
          />
        </StatRow>

        <StatRow label={t('boost')}>
          <InlineStat
            icon={<Zap size={11} stroke={SPEED_ACCENT} strokeWidth={2.6} />}
            text={speedBooster ? `+${speedBooster.effectPct}%` : '—'}
            dim={!speedBooster}
          />
          <InlineStat
            icon={<Package size={11} stroke={CAPACITY_ACCENT} strokeWidth={2.6} />}
            text={capacityBooster ? `+${capacityBooster.effectPct}%` : '—'}
            dim={!capacityBooster}
          />
        </StatRow>

        <StatRow label={statusLabel ?? t('lp')}>
          <InlineStat
            icon={<Zap size={11} stroke={SPEED_ACCENT} strokeWidth={2.6} />}
            text={luckyPlayerBoostPct > 0 ? `+${luckyPlayerBoostPct}%` : '—'}
            dim={luckyPlayerBoostPct === 0}
          />
          <InlineStat
            icon={<Package size={11} stroke={CAPACITY_ACCENT} strokeWidth={2.6} />}
            text="—"
            dim
          />
        </StatRow>

        {avatarBoostPct > 0 && (
          <StatRow label={t('avatar')}>
            <InlineStat
              icon={<Zap size={11} stroke={SPEED_ACCENT} strokeWidth={2.6} />}
              text={`+${avatarBoostPct}%`}
            />
            <InlineStat
              icon={<Package size={11} stroke={CAPACITY_ACCENT} strokeWidth={2.6} />}
              text="—"
              dim
            />
          </StatRow>
        )}

        <div className="cube-hud-scanline" />

        <div className="flex items-center justify-between gap-2">
          <span
            className="w-14 shrink-0 text-[9px] font-extrabold uppercase tracking-[0.16em]"
            style={{
              color: accent,
              textShadow: `0 0 8px color-mix(in srgb, ${accent} 60%, transparent)`,
            }}
          >
            {t('total')}
          </span>
          <div className="flex flex-1 items-center justify-end gap-2.5 text-[10.5px] tabular-nums">
            <InlineStat
              icon={<Zap size={11} stroke={SPEED_ACCENT} strokeWidth={2.6} />}
              text={`+${Math.round(totalBoostPct)}%`}
            />
            <InlineStat
              icon={<Package size={11} stroke={CAPACITY_ACCENT} strokeWidth={2.6} />}
              text={`×${totalCapacity}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
