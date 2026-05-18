'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { QUALITY_ACCENT, QUALITY_TIERS } from '@/utils/global/inventory.utils';
import type {
  InventoryChipType,
  InventoryShardCount,
} from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import '@/styles/components/inventory.css';

export interface InventoryShardsStripProps {
  shards: InventoryShardCount[];
  tierFilter: 'all' | TicketType;
  typeFilter: 'all' | InventoryChipType;
}

const TOOLTIP_HIDE_MS = 1800;
const FLAT_THRESHOLD = 6;

interface ShardCellProps {
  tier: TicketType;
  type: InventoryChipType;
  count: number;
  isOpen: boolean;
  onTap: () => void;
}

function ShardCell({ tier, type, count, isOpen, onTap }: ShardCellProps) {
  const t = useAppTranslations();
  const tierAccent = QUALITY_ACCENT[tier];
  const fullName = `${t(tier)} ${type === 'speed' ? t('time') : t('capacity')}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onTap}
        title={fullName}
        aria-label={fullName}
        className="relative flex w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border bg-black/25 px-2 py-3 transition-all active:scale-95"
        style={{ borderColor: `color-mix(in srgb, ${tierAccent} 45%, transparent)` }}
      >
        <ChipShardIcon type={type} tier={tier} size={62} empty={count === 0} />
        <span
          className="text-sm font-extrabold tabular-nums"
          style={{ color: count > 0 ? 'white' : 'rgba(255,255,255,0.3)' }}
        >
          {count}
        </span>
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="animate-fade-in pointer-events-none absolute left-1/2 -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-black/85 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-lg"
          style={{
            boxShadow: `0 0 14px color-mix(in srgb, ${tierAccent} 35%, transparent)`,
            color: tierAccent,
          }}
        >
          {fullName}
          <span
            aria-hidden
            className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent"
            style={{ borderTopColor: 'rgba(0,0,0,0.85)' }}
          />
        </div>
      )}
    </div>
  );
}

export function InventoryShardsStrip({
  shards,
  tierFilter,
  typeFilter,
}: InventoryShardsStripProps) {
  const t = useAppTranslations();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const showLabel = (key: string) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setActiveKey(key);
    hideTimerRef.current = setTimeout(() => setActiveKey(null), TOOLTIP_HIDE_MS);
  };

  const visibleTiers = QUALITY_TIERS.filter(tier => tierFilter === 'all' || tierFilter === tier);
  const types: InventoryChipType[] = typeFilter === 'all' ? ['speed', 'capacity'] : [typeFilter];
  const totalCells = visibleTiers.length * types.length;
  const useFlat = totalCells < FLAT_THRESHOLD;

  return (
    <section className="flex flex-col gap-2">
      <span className="text-pink-secondary text-[10px] font-extrabold uppercase tracking-wider">
        {t('available shards')}
      </span>

      {useFlat ? (
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${QUALITY_TIERS.length}, minmax(0, 1fr))`,
          }}
        >
          {visibleTiers.flatMap(tier =>
            types.map(type => {
              const found = shards.find(s => s.quality === tier && s.type === type);
              const key = `${tier}-${type}`;
              return (
                <ShardCell
                  key={key}
                  tier={tier}
                  type={type}
                  count={found?.count ?? 0}
                  isOpen={activeKey === key}
                  onTap={() => showLabel(key)}
                />
              );
            })
          )}
        </div>
      ) : (
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${QUALITY_TIERS.length}, minmax(0, 1fr))`,
          }}
        >
          {visibleTiers.map(tier => (
            <div key={tier} className="flex flex-col gap-2">
              {types.map(type => {
                const found = shards.find(s => s.quality === tier && s.type === type);
                const key = `${tier}-${type}`;
                return (
                  <ShardCell
                    key={key}
                    tier={tier}
                    type={type}
                    count={found?.count ?? 0}
                    isOpen={activeKey === key}
                    onTap={() => showLabel(key)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
