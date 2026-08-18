'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';
import { useGetMeQuery } from '@/api/me.api';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { Medal } from '@/components/shared/icons/Medal';
import { PlaceCup } from '@/components/shared/icons/PlaceCup';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type {
  TournamentPlacesResponse,
  TournamentUserResult,
} from '@/types/interfaces/tournaments.interfaces';
import type { TournamentType } from '@/types/types/tournaments.types';
import { statusTournamentLcBoostPct } from '@/utils/global/tournament.utils';
import { formatNumber } from '@/utils/global/number.utils';
import '@/styles/components/tournament-card.css';
import { triggerHaptic } from '@/utils/global/haptic.utils';

interface TournamentResultModalProps {
  open: boolean;
  onClose: () => void;
  tournamentId?: string;
  tournamentName: string;
  tournamentType: TournamentType;
  shardType?: InventoryChipType;
  result?: TournamentUserResult;
  /** Displayed field size (real + cosmetic count) — shown as "place of total". */
  total?: number;
  /** Prize grid; the last paying place is read off it. */
  places?: TournamentPlacesResponse;
}

type ResultView = 'placed' | 'unplaced' | 'not-played';

const RANK_TEXT_CLASS: Record<1 | 2 | 3, string> = {
  1: 'tournament-rank-text tournament-rank-text--gold',
  2: 'tournament-rank-text tournament-rank-text--silver',
  3: 'tournament-rank-text tournament-rank-text--bronze',
};

const MID_TEXT_CLASS = 'tournament-rank-text tournament-rank-text--mid';

const RANK_HEX: Record<1 | 2 | 3, string> = {
  1: '#F8BD3E',
  2: '#C0BEB1',
  3: '#AC6122',
};

const MID_HEX = '#DE009B';
const FLAT_HEX = 'rgba(255,255,255,0.30)';

const RING = { size: 148, stroke: 7 };

/** Last place the grid still pays, so "N places short of the prize zone" can be said. */
const lastPayingPlace = (places?: TournamentPlacesResponse): number | undefined => {
  const paying = places?.places?.filter(p => p.percentage > 0) ?? [];
  if (!paying.length) return undefined;
  return Math.max(...paying.map(p => p.to ?? p.from));
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

export function TournamentResultModal({
  open,
  onClose,
  tournamentId,
  tournamentName,
  tournamentType,
  shardType,
  result,
  total,
  places,
}: TournamentResultModalProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const { data: me } = useGetMeQuery();

  const place = result?.place;
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  // `result.lc` is the actual credited amount — the backend already applied the
  // VIP/LP reward boost at finish-time (DOCS §7.3). Split the status bonus back
  // out only to show it as its own receipt line.
  const lc = result?.lc ?? 0;
  const statusBoostPct = statusTournamentLcBoostPct(isLp, isVip, me?.statusPerks);
  const baseLc = statusBoostPct > 0 ? Math.round(lc / (1 + statusBoostPct / 100)) : lc;
  const statusBonusLc = lc - baseLc;
  const statusLabelKey = isVip ? 'vip' : 'lucky player';
  const shards = result?.shards ?? 0;
  // Jackpot drop payout (DOCS §20.4) — every participant of the charged
  // tournament gets at least the consolation share, so it can arrive with any
  // placement, including one that pays no regular prize.
  const jackpotLc = result?.jackpotLc ?? 0;
  const totalLc = lc + jackpotLc;
  const paid = totalLc > 0 || shards > 0;

  const view: ResultView =
    result === undefined ? 'not-played' : place !== undefined ? 'placed' : 'unplaced';

  const rank = place !== undefined && place <= 3 ? (place as 1 | 2 | 3) : null;
  // Colour says rank, never tier: gold/silver/bronze for the podium, brand pink
  // for a paying finish below it, flat white for one that paid nothing.
  const accent = rank ? RANK_HEX[rank] : paid ? MID_HEX : FLAT_HEX;
  // A finish that paid nothing keeps the plain white number: the pink gradient
  // is reward language and reads as a win where there wasn't one.
  const textClass = rank ? RANK_TEXT_CLASS[rank] : paid ? MID_TEXT_CLASS : 'text-white/70';

  // Count up only while the modal is on screen. A card renders its result modal
  // whether or not it is open, so this used to run a rAF loop per finished
  // tournament in the list — and the count-up was over long before the player
  // ever opened it.
  const counter = useCounter(open ? totalLc : 0);

  // Share of the field the player finished ahead of — the arc, not the number,
  // is what makes "47" legible at a glance.
  const beaten = place && total && total > 1 ? (total - place) / (total - 1) : 0;
  const topPct = place && total ? Math.max(1, Math.round((place / total) * 100)) : null;
  const ringRadius = (RING.size - RING.stroke) / 2;
  const circumference = 2 * Math.PI * ringRadius;

  const prizeCutoff = lastPayingPlace(places);
  const missedBy = place && prizeCutoff && place > prizeCutoff ? place - prizeCutoff : 0;

  const receiptRows =
    (lc > 0 ? 1 : 0) + (statusBonusLc > 0 ? 1 : 0) + (jackpotLc > 0 ? 1 : 0) + (shards > 0 ? 1 : 0);

  useEffect(() => {
    if (open && paid) triggerHaptic('success');
  }, [open, paid]);

  const title =
    view === 'not-played'
      ? t('tournament ended')
      : rank
        ? `${t('you won')}!`
        : paid
          ? t('your result')
          : t('better luck next time');

  const handleStandings = () => {
    if (!tournamentId) return;
    onClose();
    router.push(routes.tournaments.getById(tournamentId));
  };

  return (
    <Modal open={open} onClose={onClose} hideCloseButton label={title}>
      <div className="relative bg-purple-gradient rounded-2xl overflow-hidden w-full max-w-[360px] mx-auto">
        <div className="relative flex flex-col items-center gap-3.5 px-5 pt-6 pb-5">
          {/* HERO — the podium cup for a top-3 finish, the rank ring below it */}
          {rank ? (
            <div className="flex flex-col items-center">
              <div
                className="flex-center w-[150px] h-[150px] rounded-full"
                style={{
                  background: `radial-gradient(circle, ${accent}3D 0%, ${accent}14 45%, transparent 72%)`,
                }}
              >
                <PlaceCup tier={tournamentType} place={rank} size={134} />
              </div>
              <span
                className="-mt-3 rounded-full border px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] tabular-nums backdrop-blur-sm"
                style={{
                  borderColor: `${accent}80`,
                  color: accent,
                  background: `linear-gradient(180deg, ${accent}2E 0%, rgba(0,0,0,0.5) 100%)`,
                }}
              >
                {total ? t('{place} of {total}', { place, total }) : t('place')}
              </span>
            </div>
          ) : view === 'placed' ? (
            <div className="relative flex-center" style={{ width: RING.size, height: RING.size }}>
              <svg
                width={RING.size}
                height={RING.size}
                viewBox={`0 0 ${RING.size} ${RING.size}`}
                className="absolute inset-0 -rotate-90"
              >
                <circle
                  cx={RING.size / 2}
                  cy={RING.size / 2}
                  r={ringRadius}
                  fill="none"
                  stroke="rgba(255,255,255,0.10)"
                  strokeWidth={RING.stroke}
                />
                {beaten > 0 && (
                  <circle
                    cx={RING.size / 2}
                    cy={RING.size / 2}
                    r={ringRadius}
                    fill="none"
                    stroke={accent}
                    strokeWidth={RING.stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - beaten)}
                  />
                )}
              </svg>
              {/* The glow lives on its own round div: a `filter` on the SVG
                  rasterises the whole element and paints a visible box. */}
              <div
                className="absolute inset-[3px] rounded-full"
                style={{ boxShadow: paid ? `0 0 26px ${accent}55` : undefined }}
              />
              <div
                className="absolute inset-[10px] rounded-full"
                style={{
                  background: paid
                    ? `radial-gradient(circle, ${accent}38 0%, transparent 70%)`
                    : undefined,
                }}
              />
              <div className="relative flex flex-col items-center leading-none">
                <span className={`${textClass} text-[56px] tabular-nums leading-none`}>
                  {place}
                </span>
                <span className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/55 tabular-nums">
                  {total ? t('of {total}', { total }) : t('place')}
                </span>
              </div>
              {/* Tier chip — the medal art means TIER, never placement. */}
              <div className="absolute -bottom-1 -right-1 flex-center w-11 h-11 rounded-full bg-background/85 border border-white/10">
                <Medal type={tournamentType} height={30} />
              </div>
            </div>
          ) : (
            <div className="flex-center w-28 h-28 rounded-full bg-white/5 border border-white/10">
              {view === 'unplaced' ? (
                <Medal type={tournamentType} height={72} className="opacity-60" />
              ) : (
                <Trophy size={48} className="text-white/40" strokeWidth={2.2} />
              )}
            </div>
          )}

          {/* TITLE */}
          <div className="flex flex-col items-center justify-center gap-1 w-full">
            <h2 className="text-2xl font-extrabold leading-tight text-center">{title}</h2>
            <p className="text-xs text-white-secondary text-center max-w-[280px] line-clamp-2">
              {tournamentName}
              {topPct !== null && (
                <span className="text-white/40">
                  {' · '}
                  {topPct <= 50
                    ? t('top {n}', { n: `${topPct}%` })
                    : t('better than {percent}% of players', { percent: 100 - topPct })}
                </span>
              )}
            </p>
            {missedBy > 0 && !paid && (
              <p className="text-[11px] text-white/40 text-center">
                {t('{count} places short of the prize zone', { count: missedBy })}
              </p>
            )}
          </div>

          {/* REWARD — one source reads as a headline number, several as a receipt */}
          {paid && receiptRows === 1 && (
            <div className="inline-flex items-baseline gap-2 leading-none">
              <LcLabel size={26} className="self-center" />
              {shards > 0 && shardType ? (
                <span className="inline-flex items-center gap-1.5 leading-none">
                  <ChipShardIcon type={shardType} tier={tournamentType} size={22} />
                  <span className={`${textClass} text-3xl tabular-nums leading-none`}>
                    {shards}
                  </span>
                </span>
              ) : (
                <span className={`${textClass} text-4xl tabular-nums leading-none`}>
                  {formatNumber(counter)}
                </span>
              )}
            </div>
          )}

          {paid && receiptRows > 1 && (
            <div className="w-full flex flex-col gap-1.5 rounded-xl border border-white/10 bg-black/20 px-3 py-3">
              {lc > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/55">{t('place prize')}</span>
                  <span className="inline-flex items-center gap-1.5 leading-none">
                    <LcLabel size={16} className="self-center" />
                    <span className="text-sm font-extrabold tabular-nums">
                      {formatNumber(baseLc)}
                    </span>
                  </span>
                </div>
              )}
              {statusBonusLc > 0 && (
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] ${isVip ? 'text-gold' : 'text-electric-pink'}`}
                  >{`${t(statusLabelKey)} +${statusBoostPct}%`}</span>
                  <span className="inline-flex items-center gap-1.5 leading-none">
                    <LcLabel size={16} className="self-center" />
                    <span
                      className={`text-sm font-extrabold tabular-nums ${isVip ? 'text-gold' : 'text-electric-pink'}`}
                    >
                      +{formatNumber(statusBonusLc)}
                    </span>
                  </span>
                </div>
              )}
              {jackpotLc > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gold">{t('jackpot')}</span>
                  <span className="inline-flex items-center gap-1.5 leading-none">
                    <LcLabel size={16} className="self-center" />
                    <span className="text-sm font-extrabold tabular-nums text-gold">
                      +{formatNumber(jackpotLc)}
                    </span>
                  </span>
                </div>
              )}
              {shards > 0 && shardType && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/55">{t('chip shards')}</span>
                  <span className="inline-flex items-center gap-1.5 leading-none">
                    <ChipShardIcon type={shardType} tier={tournamentType} size={16} />
                    <span className="text-sm font-extrabold tabular-nums">+{shards}</span>
                  </span>
                </div>
              )}
              <div className="mt-1 border-t border-white/10 pt-2 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/50">
                  {t('total')}
                </span>
                <span className="inline-flex items-baseline gap-1.5">
                  <LcLabel size={20} className="self-center" />
                  <span className={`${textClass} text-2xl tabular-nums leading-none`}>
                    {formatNumber(counter)}
                  </span>
                </span>
              </div>
            </div>
          )}

          {!paid && view !== 'not-played' && (
            <p className="text-sm text-white/55 text-center max-w-[260px]">
              {t('no prize description')}
            </p>
          )}

          {/* ACTIONS */}
          <div className="w-full flex flex-col items-center gap-2">
            <Button
              onClick={onClose}
              className="w-full rounded-xl py-3 text-sm font-extrabold uppercase tracking-[0.16em]"
            >
              {t('continue')}
            </Button>
            {tournamentId && (
              <button
                type="button"
                onClick={handleStandings}
                className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45"
              >
                {t('full standings')}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
