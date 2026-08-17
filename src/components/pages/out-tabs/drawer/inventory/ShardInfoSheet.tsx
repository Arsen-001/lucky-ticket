'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Layers } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { ChipIcon } from '@/components/shared/icons/ChipIcon';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import { useEngineConfig } from '@/hooks/useEngineConfig';
import { QUALITY_ACCENT, chipShardName } from '@/utils/global/inventory.utils';
import type { InventoryChip, InventoryShardCount } from '@/types/interfaces/inventory.interfaces';
import type { Dictionary } from '@/types/types/i18n.types';
import { ChipMintCostRow } from './ChipMintCostRow';
import { ShardChipUseRow } from './ShardChipUseRow';

/** Enough rows to see the pattern; the collection itself is right below. */
const MAX_CHIP_ROWS = 4;

export interface ShardInfoSheetProps {
  open: boolean;
  /** The stack that was tapped. */
  shard?: InventoryShardCount;
  /** Every chip owned — the sheet keeps only the ones this shard fits. */
  chips: InventoryChip[];
  onClose: () => void;
}

/**
 * What one stack of shards actually is, and which chip it belongs to.
 *
 * The vault showed ten near-identical pills with a number on each and no way
 * to ask what any of them was for: the art differs by tier colour, the tier
 * itself is only in a `title` attribute a phone never shows, and nothing said
 * that a Gold Time shard can be spent on Gold Time chips and on nothing else.
 * Tapping a pill answers all three — what it is, what it fits, and what the
 * shards on hand are already enough for.
 */
export function ShardInfoSheet({ open, shard, chips, onClose }: ShardInfoSheetProps) {
  const t = useAppTranslations();
  const router = useRouter();
  // Above the early return — rules of hooks. Same served price the Mint modal
  // quotes and the server charges.
  const { chipMintShardCost } = useEngineConfig();

  if (!shard) return null;

  const { type, quality, count } = shard;
  const accent = QUALITY_ACCENT[quality];
  const name = chipShardName(t, type, quality);
  const mintCost = chipMintShardCost[quality];

  // Cheapest upgrade first: the one row that may already be paid for is the
  // reason the player opened this.
  const matching = chips
    // A chip at the top cannot take another shard — it is not a use for this stack.
    .filter(chip => chip.type === type && chip.quality === quality && chip.shardsForNextLevel > 0)
    .sort((a, b) => a.shardsForNextLevel - b.shardsForNextLevel);
  const shown = matching.slice(0, MAX_CHIP_ROWS);

  const go = (route: Parameters<typeof router.push>[0]) => {
    onClose();
    router.push(route);
  };

  return (
    <Modal open={open} onClose={onClose} label={name}>
      <div className="card-outlined bg-purple-gradient flex flex-col gap-4 rounded-2xl p-5">
        <header className="flex items-center gap-3 pe-8">
          <ChipShardIcon type={type} tier={quality} size={56} empty={count === 0} />
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-base font-extrabold leading-tight text-white">{name}</h2>
            <span className="text-[11px] font-extrabold tabular-nums" style={{ color: accent }}>
              {t('you own {n}', { n: count })}
            </span>
          </div>
        </header>

        <section className="flex flex-col gap-2">
          <span className="text-pink-secondary text-[10px] font-extrabold uppercase tracking-wider">
            {t('what this shard is for')}
          </span>

          <div
            className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5"
            style={{
              borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}
          >
            <ChipShardIcon type={type} tier={quality} size={30} />
            <ArrowRight size={14} strokeWidth={3} className="shrink-0 text-white/35" />
            <ChipIcon type={type} tier={quality} size={52} className="shrink-0" />
            <div className="flex min-w-0 flex-col items-start gap-1">
              <span
                className="text-[12px] font-extrabold uppercase leading-none tracking-[0.14em]"
                style={{ color: accent }}
              >
                {type === 'speed' ? t('time') : t('capacity')}
              </span>
              <span
                className="rounded-full border px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider"
                style={{
                  color: accent,
                  borderColor: `color-mix(in srgb, ${accent} 60%, transparent)`,
                }}
              >
                {t(quality as Parameters<Dictionary>[0])}
              </span>
            </div>
          </div>

          <p className="text-[12px] leading-snug text-white/70">{t('shard fits rule')}</p>
        </section>

        <section className="flex flex-col gap-2.5 rounded-xl border border-white/10 bg-black/20 p-3">
          <ChipMintCostRow
            icon={<ChipShardIcon type={type} tier={quality} size={22} />}
            label={t('mint a new chip')}
            owned={count}
            required={mintCost}
            ok={count >= mintCost}
          />

          <div className="h-px bg-white/10" />

          <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/45">
            {t('your chips')}
          </span>

          {shown.length === 0 ? (
            <p className="text-[11px] leading-snug text-white/50">{t('no chips of this kind')}</p>
          ) : (
            shown.map(chip => (
              <ShardChipUseRow key={chip.id} chip={chip} owned={count} accent={accent} />
            ))
          )}

          {matching.length > shown.length && (
            <span className="text-[10px] font-bold text-white/40 tabular-nums">
              {t('more chips {count}', { count: matching.length - shown.length })}
            </span>
          )}
        </section>

        <section className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-white/55">
            <Layers size={12} strokeWidth={2.6} />
            {t('where to get shards')}
          </span>
          <p className="text-[12px] leading-snug text-white/70">{t('shards source explainer')}</p>
        </section>

        <footer className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => go(routes.tournaments.index)}
            className="flex-1 py-2.5 text-[12px]"
          >
            {t('tournaments')}
          </Button>
          <Button onClick={() => go(routes.market('shards'))} className="flex-1 py-2.5 text-[12px]">
            {t('buy shards')}
          </Button>
        </footer>
      </div>
    </Modal>
  );
}
