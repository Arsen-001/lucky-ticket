'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

const TIER_VAR: Record<TicketType, string> = {
  bronze: 'var(--color-bronze)',
  silver: 'var(--color-silver)',
  gold: 'var(--color-gold)',
  platinum: 'var(--color-platinum)',
  diamond: 'var(--color-diamond)',
};

export interface ShardZoomModalProps {
  open: boolean;
  onClose: () => void;
  type: InventoryChipType;
  tier: TicketType;
}

/**
 * Enlarged ("zoom") preview of a single chip shard so the user can clearly see
 * which shard it is — the real tier-colored asset plus its tier and type.
 * Tier and type are shown as independent labels (not a concatenated name) so it
 * localizes cleanly across en/hy/ru without grammar issues.
 */
export function ShardZoomModal({ open, onClose, type, tier }: ShardZoomModalProps) {
  const t = useAppTranslations();
  const accent = TIER_VAR[tier];
  const typeLabel = type === 'capacity' ? t('capacity') : t('time');

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-background-overlay p-6 text-center">
        <div className="flex-center relative h-44 w-44">
          <span
            aria-hidden
            className="animation-blink absolute inset-0 rounded-full blur-xl"
            style={{
              background: `radial-gradient(circle, color-mix(in srgb, ${accent} 55%, transparent) 0%, transparent 70%)`,
            }}
          />
          <ChipShardIcon type={type} tier={tier} size={150} className="relative drop-shadow-2xl" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-pink-secondary text-[11px] font-bold uppercase tracking-[0.15em]">
            {t('shard')}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-sm font-extrabold"
              style={{
                color: accent,
                backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`,
              }}
            >
              {t(tier)}
            </span>
            <span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-sm font-extrabold text-white">
              {typeLabel}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
