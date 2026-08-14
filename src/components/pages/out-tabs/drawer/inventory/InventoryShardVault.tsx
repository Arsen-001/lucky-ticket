'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { QUALITY_TIERS } from '@/utils/global/inventory.utils';
import type {
  InventoryChipType,
  InventoryShardCount,
} from '@/types/interfaces/inventory.interfaces';
import { InventoryShardPill } from './InventoryShardPill';

const TYPES: InventoryChipType[] = ['speed', 'capacity'];

export interface InventoryShardVaultProps {
  shards: InventoryShardCount[];
  className?: string;
}

/**
 * Shards, folded down to one line.
 *
 * The old strip spent 230px and half the first screen on a ten-cell grid that
 * is mostly zeroes on a real account — the player scrolled past it to reach the
 * chips those shards are for. Collapsed, it shows only the stacks that actually
 * exist; the full grid (including the empty tiers, which are an answer too) is
 * one tap away.
 */
export function InventoryShardVault({ shards, className }: InventoryShardVaultProps) {
  const t = useAppTranslations();
  const [open, setOpen] = useState(false);

  const total = shards.reduce((sum, s) => sum + s.count, 0);
  const owned = shards.filter(s => s.count > 0);

  return (
    <section className={twMerge('flex flex-col gap-2', className)}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        // `py-1.5` is load-bearing, not padding taste: a 15px-tall control needs
        // 14.5px of hit zone above itself, and only 12px separate it from the
        // sticky filter bar — which then owned the topmost sample point
        // (e2e/a11y.spec.ts caught it). Taller box, shorter reach, zone clear.
        className="tap-target relative flex items-center gap-2 self-start py-1.5 text-[10px] font-extrabold uppercase tracking-wider"
      >
        <span className="text-pink-secondary">{t('shards title')}</span>
        <span className="text-white tabular-nums">{total}</span>
        <ChevronDown
          size={13}
          strokeWidth={3}
          className={twMerge('text-pink-secondary transition-transform', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div className="grid grid-cols-5 gap-1.5">
          {QUALITY_TIERS.map(tier =>
            TYPES.map(type => (
              <InventoryShardPill
                key={`${tier}-${type}`}
                tier={tier}
                type={type}
                expanded
                count={shards.find(s => s.quality === tier && s.type === type)?.count ?? 0}
              />
            ))
          )}
        </div>
      ) : owned.length === 0 ? (
        <p className="text-[11px] text-white/45">{t('no shards yet')}</p>
      ) : (
        <div className="scrollbar-hidden -mx-5 flex items-center gap-1.5 overflow-x-auto px-5">
          {owned.map(shard => (
            <InventoryShardPill
              key={`${shard.quality}-${shard.type}`}
              tier={shard.quality}
              type={shard.type}
              count={shard.count}
            />
          ))}
        </div>
      )}
    </section>
  );
}
