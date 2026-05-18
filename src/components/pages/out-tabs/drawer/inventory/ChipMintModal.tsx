'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { ChipIcon } from '@/components/shared/icons/ChipIcon';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  CHIP_MINT_SHARD_COST,
  QUALITY_ACCENT,
  QUALITY_TIERS,
  TYPE_ACCENT,
} from '@/utils/global/inventory.utils';
import type {
  InventoryChipType,
  InventoryShardCount,
} from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import { ChipMintChoiceCell } from './ChipMintChoiceCell';
import { ChipMintCostRow } from './ChipMintCostRow';

export interface ChipMintModalProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (params: { type: InventoryChipType; quality: TicketType }) => void;
  shards: InventoryShardCount[];
}

export function ChipMintModal({
  open,
  loading = false,
  onClose,
  onConfirm,
  shards,
}: ChipMintModalProps) {
  const t = useAppTranslations();
  const [type, setType] = useState<InventoryChipType>('speed');
  const [quality, setQuality] = useState<TicketType>('bronze');

  const availableShards = shards.find(s => s.type === type && s.quality === quality)?.count ?? 0;
  const requiredShards = CHIP_MINT_SHARD_COST[quality];
  const hasShards = availableShards >= requiredShards;

  const accent = QUALITY_ACCENT[quality];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="card-outlined bg-purple-gradient flex flex-col gap-4 rounded-2xl p-5">
        <header className="flex flex-col">
          <h2 className="text-base font-extrabold text-white">{t('mint a new chip')}</h2>
          <p className="text-pink-secondary mt-1 text-[11px]">{t('mint pick params')}</p>
        </header>

        <section className="flex flex-col gap-2">
          <span className="text-pink-secondary text-[10px] font-extrabold uppercase tracking-wider">
            {t('chip type')}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <ChipMintChoiceCell
              active={type === 'speed'}
              accent={TYPE_ACCENT.speed}
              onClick={() => setType('speed')}
              icon={<ChipIcon type="speed" tier={quality} size={96} />}
              label={t('time')}
            />
            <ChipMintChoiceCell
              active={type === 'capacity'}
              accent={TYPE_ACCENT.capacity}
              onClick={() => setType('capacity')}
              icon={<ChipIcon type="capacity" tier={quality} size={96} />}
              label={t('capacity')}
            />
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <span className="text-pink-secondary text-[10px] font-extrabold uppercase tracking-wider">
            {t('chip quality')}
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {QUALITY_TIERS.map(q => {
              const a = QUALITY_ACCENT[q];
              const active = q === quality;
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  className={twMerge(
                    'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[9px] font-extrabold uppercase tracking-wider transition-colors',
                    active ? 'text-white' : 'text-white/55 hover:text-white/85'
                  )}
                  style={{
                    borderColor: active
                      ? `color-mix(in srgb, ${a} 70%, transparent)`
                      : 'color-mix(in srgb, white 10%, transparent)',
                    backgroundColor: active
                      ? `color-mix(in srgb, ${a} 22%, transparent)`
                      : 'transparent',
                    boxShadow: active
                      ? `0 0 10px color-mix(in srgb, ${a} 35%, transparent)`
                      : 'none',
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: a }} />
                  {t(q)}
                </button>
              );
            })}
          </div>
        </section>

        <section
          className="flex flex-col gap-2 rounded-xl border px-3 py-3"
          style={{
            borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        >
          <ChipMintCostRow
            icon={<ChipShardIcon type={type} tier={quality} size={48} />}
            label={t('matching shard')}
            owned={availableShards}
            required={requiredShards}
            ok={hasShards}
          />
        </section>

        <Button
          onClick={() => onConfirm({ type, quality })}
          disabled={!hasShards || loading}
          loading={loading}
          className="w-full py-3 text-[13px]"
        >
          {t('mint')}
        </Button>
      </div>
    </Modal>
  );
}
