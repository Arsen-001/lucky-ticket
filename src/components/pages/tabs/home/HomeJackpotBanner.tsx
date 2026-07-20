'use client';

import { useEffect, useRef, useState } from 'react';
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
 * Compact jackpot chip at the top of Home — a small brushed-platinum ring over
 * a glassmorphic inner with a cool electric-pink bloom; tiny JACKPOT wordmark
 * stacked over the slot-machine digit reels (JackpotOdometer) and a small gold
 * LC coin beside them (the only gold accent). Sits shrink-to-content next to
 * the wider Test-Quest card and links to the jackpot page.
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

  return (
    <Link
      href={routes.jackpot}
      aria-label={t('jackpot')}
      className="jackpot-capsule relative flex shrink-0 rounded-2xl p-[3px] transition-transform active:scale-[0.98]"
    >
      <span className="jackpot-capsule-glass relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[13px] px-2.5 py-1.5">
        <span aria-hidden className="jackpot-plaque-shine" />

        <span className="jackpot-title text-[7px] font-black uppercase leading-none tracking-[0.14em]">
          {t('jackpot')}
        </span>

        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" className="h-4 w-16" />}
        >
          <span className="relative flex items-center justify-center gap-1">
            <JackpotOdometer
              value={display}
              className="jackpot-glow text-[15px] font-extrabold leading-none text-white"
            />
            <span className="jackpot-coin flex-center h-[18px] w-[18px] shrink-0 rounded-full">
              <LcLabel size={11} />
            </span>
            {pop && (
              <span
                key={pop.key}
                aria-hidden
                className="jackpot-pop text-electric-pink absolute -top-1 left-1/2 text-[11px] font-extrabold tabular-nums"
              >
                +{formatNumber(pop.amount)}
              </span>
            )}
          </span>
        </SkeletonSuspense>
      </span>
    </Link>
  );
}
