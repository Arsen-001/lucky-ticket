'use client';

import { useEffect, useMemo, useState } from 'react';
import { Cpu, Loader2, MemoryStick, Timer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { QUALITY_ACCENT, buildEngineSlots } from '@/utils/global/inventory.utils';
import type { InventoryBooster } from '@/types/interfaces/inventory.interfaces';
import type { EngineSlotInfo } from '@/utils/global/inventory.utils';

export interface BoosterActivateModalProps {
  open: boolean;
  booster?: InventoryBooster;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (engineId: string) => void;
}

export function BoosterActivateModal({
  open,
  booster,
  loading = false,
  onClose,
  onConfirm,
}: BoosterActivateModalProps) {
  const t = useAppTranslations();
  const { data: tickets } = useGetTicketsQuery();
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) setPendingId(null);
  }, [loading]);

  // Numbered by `buildEngineSlots`, the same list the inventory screen labels
  // its equipped chips from — the two used to number engines differently, so
  // "Engine #12" on a chip card and "Engine #12" in this list were not the
  // same engine.
  const matchingEngines: EngineSlotInfo[] = useMemo(() => {
    if (!booster) return [];
    return buildEngineSlots(tickets, undefined).filter(slot => slot.tier === booster.quality);
  }, [tickets, booster]);

  const accent = booster ? QUALITY_ACCENT[booster.quality] : 'var(--color-electric-pink)';

  return (
    <Modal open={open} onClose={onClose} label={t('activate booster')}>
      <div className="card-outlined bg-purple-gradient rounded-2xl p-5">
        <h2 className="text-base font-extrabold text-white">{t('activate booster')}</h2>
        {booster && (
          <p className="text-pink-secondary mt-1 text-[12px] font-bold">
            {t(booster.quality)} · {booster.type === 'speed' ? t('time') : t('capacity')} · +
            {booster.effectPct}% · {t('{n}h duration', { n: booster.durationHours })}
          </p>
        )}
        <p className="text-pink-secondary mt-3 text-[11px]">
          {t('pick tier-locked engine', {
            tier: booster ? t(booster.quality) : '',
          })}
        </p>

        {/* The list scrolls, not the card — the same fix `ChipEquipModal` got
            and this one did not: nine Bronze engines pushed the timing note off
            the panel's bottom edge and cut the last engine in half, so the
            player saw a list with no visible end and no note. */}
        <div
          className={twMerge(
            'mt-3 flex flex-col gap-2',
            matchingEngines.length > 4 &&
              'scrollbar-hidden scroll-fade-bottom max-h-[38vh] overflow-y-auto'
          )}
        >
          {matchingEngines.length === 0 ? (
            <p className="text-xs text-white/55">{t('no matching tier engines')}</p>
          ) : (
            matchingEngines.map(engine => {
              const tierAccent = QUALITY_ACCENT[engine.tier];
              const Icon = booster?.type === 'capacity' ? MemoryStick : Cpu;
              return (
                <button
                  key={engine.id}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setPendingId(engine.id);
                    onConfirm(engine.id);
                  }}
                  className={twMerge(
                    'flex items-center gap-3 rounded-xl border bg-black/20 px-3 py-2.5 text-start transition-colors hover:bg-black/35 disabled:cursor-default disabled:opacity-50'
                  )}
                  style={{
                    borderColor: `color-mix(in srgb, ${tierAccent} 50%, transparent)`,
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
                  {pendingId === engine.id && loading && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                      stroke={tierAccent}
                      strokeWidth={2.6}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>

        <div
          className="mt-4 flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-wider"
          style={{
            color: accent,
            borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`,
          }}
        >
          <Timer size={12} strokeWidth={2.4} />
          {t('booster activate note')}
        </div>
      </div>
    </Modal>
  );
}
