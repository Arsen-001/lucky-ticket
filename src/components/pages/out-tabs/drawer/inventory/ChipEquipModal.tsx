'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Cpu, MemoryStick } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetMeQuery } from '@/api/me.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { Button } from '@/components/shared/buttons/Button';
import { Modal } from '@/components/shared/modals/Modal';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  QUALITY_ACCENT,
  buildEngineSlots,
  canEquipChipOnTier,
  chipEffectLabel,
  chipSlotStarsCost,
} from '@/utils/global/inventory.utils';
import type { InventoryChip } from '@/types/interfaces/inventory.interfaces';
import type { EngineSlotInfo } from '@/utils/global/inventory.utils';

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

  // The modal is mounted for the whole screen's life, so the selection outlived
  // the chip it was made for: pick an engine for a Bronze chip, close, open a
  // Gold one — nothing is highlighted in the new list (that engine is not in
  // it), and the confirm button is live anyway. Tapping it equipped the chip
  // onto the engine the player last looked at, on a different screen.
  useEffect(() => {
    setSelectedEngineId(undefined);
  }, [chip?.id, open]);

  // One numbering for the whole feature: the inventory screen labels an
  // equipped chip with the number this list picks from, so they have to come
  // out of the same builder — they used to be computed twice, differently.
  const engines: EngineSlotInfo[] = useMemo(() => buildEngineSlots(tickets, undefined), [tickets]);

  // Depends on the engine picked below: a chip already on another engine is
  // being MOVED, and the server bills the detach too (DOCS §10.4).
  const cost = chip ? chipSlotStarsCost(chip, selectedEngineId) : 0;
  const userStars = me?.telegramStars ?? 0;
  const canAfford = userStars >= cost;
  const accent = chip ? QUALITY_ACCENT[chip.quality] : 'var(--color-electric-pink)';
  const eligibleEngines = chip
    ? engines.filter(engine => canEquipChipOnTier(chip.quality, engine.tier))
    : [];

  return (
    <Modal open={open} onClose={onClose} label={t('equip chip')}>
      <div className="card-outlined bg-purple-gradient flex flex-col gap-4 rounded-2xl p-5">
        <header>
          <h2 className="text-base font-extrabold text-white">{t('equip chip')}</h2>
          {chip && (
            <p className="text-pink-secondary mt-1 text-[12px] font-bold">
              {/* `t('lv {level}')`, not a hardcoded "Lvl": the chip's own row
                  says «Ур. 8» and this modal said «Lvl 8» about the same chip. */}
              {t(chip.quality)} · {chip.type === 'speed' ? t('time') : t('capacity')} ·{' '}
              {t('lv {level}', { level: chip.level })} · {chipEffectLabel(chip, t)}
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
                    'flex items-center gap-3 rounded-xl border bg-black/20 px-3 py-2.5 text-start transition-colors',
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
                      {t('engine number', { number: engine.number })}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: tierAccent }}
                    >
                      {t(engine.tier)}
                    </span>
                  </div>
                  {/* Where the chip is right now — without it a move looks like
                      a fresh equip, and the one row that costs nothing (putting
                      it back where it already is) is indistinguishable. */}
                  {chip?.equippedOnEngineId === engine.id && (
                    <Check size={16} strokeWidth={3} style={{ color: tierAccent }} />
                  )}
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

        {/* Attaching is free (DOCS §10.4), and a price row reading "10000 / 0"
            under a button promising "· 0 ★" invented a cost where there is
            none. The row appears only when this equip is a MOVE, which is the
            one case that bills. */}
        <footer className="flex items-center justify-end gap-3">
          {cost > 0 && (
            <div className="me-auto flex items-center gap-1.5 text-[11px] font-bold tabular-nums">
              <TelegramStarIcon size={14} />
              <span className={canAfford ? 'text-white' : 'text-error-text'}>
                {userStars} / {cost}
              </span>
            </div>
          )}
          <Button
            onClick={() => selectedEngineId && onConfirm(selectedEngineId)}
            // A short balance is not a reason to disable: the container turns
            // the tap into the buy-Stars sheet with this exact price. Only a
            // missing choice keeps the button down.
            disabled={!selectedEngineId || loading}
            loading={loading}
            className="px-4 py-2 text-[12px]"
          >
            {cost > 0 ? t('equip for {n} stars', { n: cost }) : t('equip')}
          </Button>
        </footer>
      </div>
    </Modal>
  );
}
