'use client';

import { useMemo, useState } from 'react';
import { Cpu, MemoryStick } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetMeQuery } from '@/api/me.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { Button } from '@/components/shared/buttons/Button';
import { Modal } from '@/components/shared/modals/Modal';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  QUALITY_ACCENT,
  canEquipChipOnTier,
  chipEquipStarsCost,
  tierRank,
} from '@/utils/global/inventory.utils';
import type { InventoryChip } from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

interface EngineOption {
  id: string;
  tier: TicketType;
  index: number;
  eligible: boolean;
}

export interface ChipEquipModalProps {
  open: boolean;
  chip?: InventoryChip;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (engineId: string) => void;
}

export function ChipEquipModal({
  open,
  chip,
  loading = false,
  onClose,
  onConfirm,
}: ChipEquipModalProps) {
  const t = useAppTranslations();
  const { data: tickets } = useGetTicketsQuery();
  const { data: me } = useGetMeQuery();
  const [selectedEngineId, setSelectedEngineId] = useState<string | undefined>();

  const engines: EngineOption[] = useMemo(() => {
    if (!chip) return [];
    return (tickets ?? [])
      .filter(ticket => !ticket.blocked && ticket.engines?.length)
      .flatMap((ticket, ticketIndex) =>
        (ticket.engines ?? []).map((engine, engineIndex) => ({
          id: engine.id,
          tier: ticket.ticketType,
          index: ticketIndex * 100 + engineIndex,
          eligible: canEquipChipOnTier(chip.quality, ticket.ticketType),
        }))
      )
      .sort((a, b) => {
        const rankDelta = tierRank(b.tier) - tierRank(a.tier);
        if (rankDelta !== 0) return rankDelta;
        return a.index - b.index;
      });
  }, [tickets, chip]);

  const cost = chip ? chipEquipStarsCost(chip.level) : 0;
  const userStars = me?.telegramStars ?? 0;
  const canAfford = userStars >= cost;
  const accent = chip ? QUALITY_ACCENT[chip.quality] : 'var(--color-electric-pink)';
  const eligibleEngines = engines.filter(e => e.eligible);

  return (
    <Modal open={open} onClose={onClose} label={t('equip chip')}>
      <div className="card-outlined bg-purple-gradient flex flex-col gap-4 rounded-2xl p-5">
        <header>
          <h2 className="text-base font-extrabold text-white">{t('equip chip')}</h2>
          {chip && (
            <p className="text-pink-secondary mt-1 text-[12px] font-bold">
              {t(chip.quality)} · {chip.type === 'speed' ? t('time') : t('capacity')} · Lvl{' '}
              {chip.level} · +{chip.effectPct.toFixed(1)}%
            </p>
          )}
        </header>

        <p className="text-pink-secondary text-[11px]">{t('pick engine to equip')}</p>

        {/* The list owns the scrolling, not the whole card. An account with ten
            engines pushed the cost row and the Equip button past the panel's
            80vh edge, and the header scrolled away with them: the player saw a
            list of engines and no way to confirm one. */}
        <div
          className={twMerge(
            'flex flex-col gap-2',
            eligibleEngines.length > 4 &&
              'scrollbar-hidden scroll-fade-bottom max-h-[38vh] overflow-y-auto'
          )}
        >
          {eligibleEngines.length === 0 ? (
            <p className="text-xs text-white/55">{t('no engines available')}</p>
          ) : (
            eligibleEngines.map(engine => {
              const tierAccent = QUALITY_ACCENT[engine.tier];
              const Icon = chip?.type === 'capacity' ? MemoryStick : Cpu;
              const selected = selectedEngineId === engine.id;
              return (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => setSelectedEngineId(engine.id)}
                  className={twMerge(
                    'flex items-center gap-3 rounded-xl border bg-black/20 px-3 py-2.5 text-left transition-colors',
                    selected ? 'bg-black/45' : 'hover:bg-black/35'
                  )}
                  style={{
                    borderColor: selected
                      ? `color-mix(in srgb, ${tierAccent} 90%, transparent)`
                      : `color-mix(in srgb, ${tierAccent} 50%, transparent)`,
                    boxShadow: selected
                      ? `0 0 12px color-mix(in srgb, ${tierAccent} 40%, transparent)`
                      : 'none',
                  }}
                >
                  <div
                    className="flex-center h-9 w-9 rounded-lg border"
                    style={{
                      borderColor: `color-mix(in srgb, ${tierAccent} 60%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${tierAccent} 18%, transparent)`,
                    }}
                  >
                    <Icon
                      size={16}
                      stroke={tierAccent}
                      fill={tierAccent}
                      fillOpacity={0.3}
                      strokeWidth={2.4}
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-[13px] font-extrabold text-white">
                      {t('engine number', { number: engine.index + 1 })}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: tierAccent }}
                    >
                      {t(engine.tier)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div
          className="rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-wider"
          style={{
            color: accent,
            borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
          }}
        >
          {t('chip equip note')}
        </div>

        <footer className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold tabular-nums">
            <TelegramStarIcon size={14} />
            <span className={canAfford ? 'text-white' : 'text-error-text'}>
              {userStars} / {cost}
            </span>
          </div>
          <Button
            onClick={() => selectedEngineId && onConfirm(selectedEngineId)}
            disabled={!selectedEngineId || !canAfford || loading}
            loading={loading}
            className="px-4 py-2 text-[12px]"
          >
            {t('equip for {n} stars', { n: cost })}
          </Button>
        </footer>
      </div>
    </Modal>
  );
}
