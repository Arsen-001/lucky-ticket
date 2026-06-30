'use client';

import { useEffect, useRef, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useGetMeQuery } from '@/api/me.api';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { Medal, type MedalType } from '@/components/shared/icons/Medal';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { TournamentUserResult } from '@/types/interfaces/tournaments.interfaces';
import type { TournamentType } from '@/types/types/tournaments.types';
import { statusTournamentLcBoostPct } from '@/utils/global/tournament.utils';
import '@/styles/components/tournament-card.css';

interface TournamentResultModalProps {
  open: boolean;
  onClose: () => void;
  tournamentName: string;
  tournamentType: TournamentType;
  shardType?: InventoryChipType;
  result?: TournamentUserResult;
}

type ResultView = 'top-three' | 'mid-place' | 'no-place' | 'not-played';

const PLACE_LABEL: Record<number, '1st' | '2nd' | '3rd'> = {
  1: '1st',
  2: '2nd',
  3: '3rd',
};

const MEDAL_BY_PLACE: Record<number, MedalType> = {
  1: 'gold',
  2: 'silver',
  3: 'bronze',
};

const RANK_TEXT_CLASS: Record<1 | 2 | 3, string> = {
  1: 'tournament-rank-text tournament-rank-text--gold',
  2: 'tournament-rank-text tournament-rank-text--silver',
  3: 'tournament-rank-text tournament-rank-text--bronze',
};

const MID_TEXT_CLASS = 'tournament-rank-text tournament-rank-text--mid';

const RANK_HALO_RGB: Record<1 | 2 | 3, string> = {
  1: '248, 189, 62',
  2: '192, 190, 177',
  3: '172, 97, 34',
};

const useCounter = (target: number, durationMs = 900) => {
  const [value, setValue] = useState(0);
  const startedAt = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    setValue(0);
    startedAt.current = null;
    const tick = (ts: number) => {
      if (startedAt.current === null) startedAt.current = ts;
      const elapsed = ts - startedAt.current;
      const ratio = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setValue(Math.round(target * eased));
      if (ratio < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, durationMs]);

  return value;
};

const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'success' = 'success') => {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tg: any = (window as any).Telegram?.WebApp?.HapticFeedback;
  if (!tg) return;
  try {
    if (style === 'success') tg.notificationOccurred('success');
    else tg.impactOccurred(style);
  } catch {
    /* noop */
  }
};

export function TournamentResultModal({
  open,
  onClose,
  tournamentName,
  tournamentType,
  shardType,
  result,
}: TournamentResultModalProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();

  const place = result?.place;
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  // `result.lc` is the actual credited amount — the backend already applied the
  // VIP/LP reward boost at finish-time (DOCS §7.3). Show it as-is; split out the
  // status bonus only to label the badge below.
  const lc = result?.lc ?? 0;
  const statusBoostPct = statusTournamentLcBoostPct(isLp, isVip);
  const baseLc = statusBoostPct > 0 ? Math.round(lc / (1 + statusBoostPct / 100)) : lc;
  const statusBonusLc = lc - baseLc;
  const statusLabelKey = isVip ? 'vip' : 'lucky player';
  const shards = result?.shards ?? 0;

  const view: ResultView =
    result === undefined
      ? 'not-played'
      : place !== undefined && place >= 1 && place <= 3
        ? 'top-three'
        : place !== undefined && place > 3 && lc > 0
          ? 'mid-place'
          : 'no-place';

  const counter = useCounter(view === 'top-three' || view === 'mid-place' ? lc : 0);
  const placeLabel = view === 'top-three' && place ? t(PLACE_LABEL[place]) : undefined;

  // Per-rank colors: 1st=gold, 2nd=silver, 3rd=bronze; mid-place uses pink/purple
  const rank = view === 'top-three' && place ? (place as 1 | 2 | 3) : null;
  const textClass = rank
    ? RANK_TEXT_CLASS[rank]
    : view === 'mid-place'
      ? MID_TEXT_CLASS
      : RANK_TEXT_CLASS[1];

  useEffect(() => {
    if (open && (view === 'top-three' || view === 'mid-place')) {
      triggerHaptic('success');
    }
  }, [open, view]);

  const titleByView: Record<ResultView, string> = {
    'top-three': `${t('you won')}!`,
    'mid-place': t('your result'),
    'no-place': t('better luck next time'),
    'not-played': t('tournament ended'),
  };

  return (
    <Modal open={open} onClose={onClose} hideCloseButton>
      <div className="relative bg-purple-gradient rounded-2xl overflow-hidden w-full max-w-[360px] mx-auto">
        <div className="relative flex flex-col items-center gap-4 px-6 pt-7 pb-5">
          {/* PRIZE AREA */}
          <div className="flex-center w-full">
            <div className="relative flex-center">
              {view === 'top-three' && place ? (
                <div
                  className="flex-center w-32 h-32 rounded-full"
                  style={{
                    background: `radial-gradient(circle, rgba(${RANK_HALO_RGB[place as 1 | 2 | 3]}, 0.28) 0%, rgba(${RANK_HALO_RGB[place as 1 | 2 | 3]}, 0.10) 45%, transparent 75%)`,
                  }}
                >
                  <Medal
                    type={MEDAL_BY_PLACE[place]}
                    height={120}
                    className="drop-shadow-2xl drop-shadow-black/50"
                  />
                </div>
              ) : view === 'mid-place' ? (
                <div
                  className="flex-center w-32 h-32 rounded-full border-2"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(222, 0, 155, 0.28) 0%, rgba(116, 61, 245, 0.10) 45%, transparent 75%)',
                    borderColor: 'rgba(222, 0, 155, 0.55)',
                    boxShadow:
                      '0 0 0 4px rgba(222, 0, 155, 0.10), 0 0 22px rgba(222, 0, 155, 0.30), inset 0 0 18px rgba(222, 0, 155, 0.18)',
                  }}
                >
                  <div className="flex flex-col items-center justify-center leading-none gap-1">
                    <span className={`${MID_TEXT_CLASS} text-5xl tabular-nums leading-none`}>
                      {place}
                    </span>
                    <span
                      className={`${MID_TEXT_CLASS} text-[13px] tabular-nums uppercase tracking-[0.2em] leading-none`}
                    >
                      {t('place')}
                    </span>
                  </div>
                </div>
              ) : view === 'no-place' ? (
                <div className="flex-center w-28 h-28 rounded-full bg-white/5 border border-white/10">
                  <Medal type={tournamentType} height={72} className="opacity-60" />
                </div>
              ) : (
                <div className="flex-center w-28 h-28 rounded-full bg-white/5 border border-white/10">
                  <Trophy size={48} className="text-white/40" strokeWidth={2.2} />
                </div>
              )}
            </div>
          </div>

          {/* TITLE BLOCK */}
          <div className="flex flex-col items-center justify-center gap-1 w-full">
            <h2 className="text-2xl font-extrabold leading-tight text-center">
              {titleByView[view]}
            </h2>
            <p className="text-xs text-white-secondary text-center max-w-[280px] line-clamp-2">
              {placeLabel ? `${placeLabel} · ` : ''}
              {tournamentName}
            </p>
          </div>

          {/* COUNTER + EXTRA REWARDS */}
          <div className="flex flex-col items-center justify-center gap-2 w-full">
            {(view === 'top-three' || view === 'mid-place') && (
              <>
                <div className="inline-flex items-baseline gap-2 leading-none">
                  <LcLabel size={26} className="self-center" />
                  <span className={`${textClass} text-4xl tabular-nums leading-none`}>
                    {counter}
                  </span>
                </div>
                {statusBonusLc > 0 && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.16em] ${
                      isVip
                        ? 'border-gold/40 bg-gold/15 text-gold'
                        : 'border-electric-pink/35 bg-electric-pink/12 text-electric-pink'
                    }`}
                  >
                    {t(statusLabelKey)} +{statusBoostPct}%
                  </span>
                )}
                {view === 'top-three' && shards > 0 && shardType && (
                  <div className="inline-flex items-center gap-1.5 leading-none">
                    <ChipShardIcon
                      type={shardType}
                      tier={tournamentType}
                      size={22}
                      className="shrink-0"
                    />
                    <span className={`${textClass} text-2xl tabular-nums leading-none`}>
                      {shards}
                    </span>
                    <span
                      className={`${textClass} text-base tabular-nums leading-none uppercase tracking-wider`}
                    >
                      {t('shards')}
                    </span>
                  </div>
                )}
              </>
            )}
            {view === 'no-place' && (
              <p className="text-sm text-white/55 text-center max-w-[260px]">
                {t('better luck next time')}
              </p>
            )}
          </div>

          {/* BUTTON */}
          <Button
            onClick={onClose}
            className="w-full rounded-xl py-3 text-sm font-extrabold uppercase tracking-[0.16em]"
          >
            {t('continue')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
