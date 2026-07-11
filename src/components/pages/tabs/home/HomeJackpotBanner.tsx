'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { Link } from '@/components/shared/links/Link';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { JackpotOdometer } from '@/components/pages/tabs/home/JackpotOdometer';
import { useGetJackpotQuery } from '@/api/jackpot.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import { routes } from '@/constants/routes';
import '@/styles/components/jackpot.css';
import '@/styles/components/jackpot-odometer.css';

/**
 * Centered casino-style jackpot plaque at the top of Home — the pot on rolling
 * digit reels (JackpotOdometer), breathing glow, linking to the jackpot page.
 * The pot only grows when a tournament finishes (its 10% skim), so there is NO
 * fake creep: the query polls and the reels roll (with a "+X" pop) only when
 * the server value actually increased. Never rolls backwards.
 */
export function HomeJackpotBanner() {
  const t = useAppTranslations();
  const { data: jackpot, isLoading } = useGetJackpotQuery(undefined, {
    pollingInterval: 60_000,
  });

  const [display, setDisplay] = useState(0);
  const [pop, setPop] = useState<{ amount: number; key: number } | null>(null);
  const targetRef = useRef(0);

  // Chase the real server pot: first load snaps into place, a later increase
  // rolls the reels and pops the actual "+skim".
  useEffect(() => {
    const pot = jackpot?.pot ?? 0;
    if (pot <= targetRef.current) return;
    const wasLoaded = targetRef.current > 0;
    const gain = pot - targetRef.current;
    targetRef.current = pot;
    if (wasLoaded) setPop({ amount: gain, key: Date.now() });
    else setDisplay(pot);
  }, [jackpot?.pot]);

  // Discrete steps toward the target — each one visibly rolls the reels.
  useEffect(() => {
    const id = window.setInterval(() => {
      setDisplay(prev => {
        const diff = targetRef.current - prev;
        if (diff <= 0) return prev;
        return diff <= 2 ? targetRef.current : prev + Math.max(1, Math.round(diff * 0.35));
      });
    }, 450);
    return () => window.clearInterval(id);
  }, []);

  const record = jackpot?.record ?? 0;

  return (
    <div className="flex justify-center px-4">
      <Link
        href={routes.jackpot}
        aria-label={t('jackpot')}
        className="jackpot-plaque relative flex w-full max-w-[340px] flex-col items-center gap-1.5 rounded-2xl px-5 pb-2.5 pt-3 transition-transform active:scale-[0.98]"
      >
        <span aria-hidden className="jackpot-plaque-shine" />

        <span className="relative flex items-center gap-2">
          <Sparkles size={12} className="text-gold/70" aria-hidden />
          <span className="jackpot-title text-[11px] font-black uppercase leading-none tracking-[0.34em]">
            {t('jackpot')}
          </span>
          <Sparkles size={12} className="text-gold/70" aria-hidden />
        </span>

        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" textSize="lg" className="h-8 w-48" />}
        >
          <span className="relative inline-flex items-center gap-2">
            <JackpotOdometer
              value={display}
              className="jackpot-glow text-gold text-[27px] font-extrabold leading-none"
            />
            <LcLabel size={20} />
            {pop && (
              <span
                key={pop.key}
                aria-hidden
                className="jackpot-pop text-electric-pink absolute left-full top-1 ml-5 text-sm font-extrabold tabular-nums"
              >
                +{formatNumber(pop.amount)}
              </span>
            )}
          </span>
        </SkeletonSuspense>

        {record > 0 && (
          <span className="relative flex items-center gap-1.5 text-[11px] font-semibold text-white/45">
            <Trophy size={11} className="text-gold/60" aria-hidden />
            {t('record')} {formatNumber(record)}
            <LcLabel size={12} />
          </span>
        )}
      </Link>
    </div>
  );
}
