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
 * Premium capsule jackpot counter at the top of Home — graphite metal ring,
 * gold neon hairline, glassmorphic inner with a purple-gold glow; JACKPOT
 * wordmark, slot-machine digit reels (JackpotOdometer) and the LC coin on the
 * right. Links to the jackpot page.
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
    <div className="flex justify-center px-4">
      <Link
        href={routes.jackpot}
        aria-label={t('jackpot')}
        className="jackpot-capsule relative flex w-full max-w-[360px] rounded-full p-[5px] transition-transform active:scale-[0.98]"
      >
        <span className="jackpot-capsule-glass relative flex min-w-0 flex-1 items-center gap-3 rounded-full py-2 pl-5 pr-3">
          <span aria-hidden className="jackpot-plaque-shine" />

          <span className="relative flex flex-shrink-0 flex-col items-start gap-1">
            <span className="jackpot-title text-[11px] font-black uppercase leading-none tracking-[0.3em]">
              {t('jackpot')}
            </span>
            <span aria-hidden className="jackpot-title-rule" />
          </span>

          <SkeletonSuspense
            loading={isLoading}
            skeleton={<Skeleton variant="line" textSize="lg" className="h-7 w-36" />}
          >
            <span className="relative flex min-w-0 flex-1 items-center justify-center">
              <JackpotOdometer
                value={display}
                className="jackpot-glow text-gold text-[22px] font-extrabold leading-none"
              />
              {pop && (
                <span
                  key={pop.key}
                  aria-hidden
                  className="jackpot-pop text-electric-pink absolute left-1/2 top-0 text-sm font-extrabold tabular-nums"
                >
                  +{formatNumber(pop.amount)}
                </span>
              )}
            </span>
          </SkeletonSuspense>

          <span className="jackpot-coin flex-center h-9 w-9 flex-shrink-0 rounded-full">
            <LcLabel size={22} />
          </span>
        </span>
      </Link>
    </div>
  );
}
