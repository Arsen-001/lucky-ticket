import { Hammer } from 'lucide-react';
import '@/styles/components/inventory.css';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { QUALITY_ACCENT, QUALITY_TIERS } from '@/utils/global/inventory.utils';
import type { TicketType } from '@/types/types/ticket.types';

export interface InventoryBuildersStripProps {
  buildersByTier: Record<TicketType, number>;
  tierFilter: 'all' | TicketType;
}

export function InventoryBuildersStrip({
  buildersByTier,
  tierFilter,
}: InventoryBuildersStripProps) {
  const t = useAppTranslations();

  const tiers = tierFilter === 'all' ? QUALITY_TIERS : [tierFilter];

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-pink-secondary text-[10px] font-extrabold uppercase tracking-wider">
          {t('chip builders')}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
          {t('one per new chip')}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {tiers.map(tier => {
          const accent = QUALITY_ACCENT[tier];
          const count = buildersByTier[tier] ?? 0;
          return (
            <div
              key={tier}
              className="relative flex items-center justify-between gap-2 overflow-hidden rounded-xl border bg-black/25 px-3 py-2.5"
              style={{ borderColor: `color-mix(in srgb, ${accent} 45%, transparent)` }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <Hammer
                  size={22}
                  stroke={accent}
                  fill={accent}
                  fillOpacity={0.3}
                  strokeWidth={2.2}
                />
                <span
                  className="text-[9px] font-extrabold uppercase tracking-wider truncate"
                  style={{ color: accent }}
                >
                  {t(tier)}
                </span>
              </div>
              <span
                className="text-sm font-extrabold tabular-nums"
                style={{ color: count > 0 ? 'white' : 'rgba(255,255,255,0.3)' }}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
