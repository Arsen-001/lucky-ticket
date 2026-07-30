'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/components/shared/links/Link';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useGetJackpotQuery } from '@/api/jackpot.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import { routes } from '@/constants/routes';
import '@/styles/components/jackpot.css';

/**
 * Compact jackpot chip at the top of Home — a sibling of the Test-Quest card in
 * the app's own card language (rounded-3xl, electric-purple→pink gradient,
 * electric-pink hairline border). The gold LC coin is the only gold accent, per
 * the design rule. A small JACKPOT caption sits over the live pot number, which
 * ticks up as the server value grows (with a "+X" pop). Shrink-to-content, so
 * it stays small beside the wider Test-Quest card, and links to the jackpot page.
 * The pot only grows when a tournament finishes (its 10% skim), so there is NO
 * fake creep: the query polls and the number moves only when the server value
 * actually increased. Never rolls backwards.
 */
export function HomeJackpotBanner() {
  const t = useAppTranslations();
  const { data: jackpot, isLoading } = useGetJackpotQuery(undefined, {
    pollingInterval: 60_000,
    // Don't keep polling a backgrounded Mini App — resumes on refocus.
    skipPollingIfUnfocused: true,
  });

  const [display, setDisplay] = useState(0);
  const [pop, setPop] = useState<{ amount: number; key: number } | null>(null);
  const targetRef = useRef(0);

  // Chase the real server pot: first load snaps into place, a later increase
  // ticks the number and pops the actual "+skim".
  useEffect(() => {
    const pot = jackpot?.pot ?? 0;
    if (pot <= targetRef.current) return;
    const wasLoaded = targetRef.current > 0;
    const gain = pot - targetRef.current;
    targetRef.current = pot;
    if (wasLoaded) setPop({ amount: gain, key: Date.now() });
    else setDisplay(pot);
  }, [jackpot?.pot]);

  // Discrete steps toward the target — each one visibly advances the counter.
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
      // Opaque base under the tint. The gradient alone is 20% opaque, so on the
      // atmospheric backdrop the plate became a window and took the sky's
      // brightness with it. Inline rather than `bg-background`: that utility and
      // `bg-gradient-*` land in the same tailwind-merge group, so the merge drops
      // one of the two.
      style={{ backgroundColor: 'var(--color-background)' }}
      className="relative flex shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-3xl border border-electric-pink/50 bg-gradient-to-br from-electric-purple/20 to-electric-pink/10 px-3.5 py-2 transition-transform active:scale-[0.98]"
    >
      <span className="text-[8px] font-black uppercase leading-none tracking-[0.16em] text-white/60">
        {t('jackpot')}
      </span>

      <SkeletonSuspense
        loading={isLoading}
        skeleton={<Skeleton variant="line" className="h-4 w-16" />}
      >
        <span className="relative flex items-center gap-1.5">
          <span className="flex-center h-5 w-5 shrink-0 rounded-full bg-white/10">
            <LcLabel size={12} />
          </span>
          <span className="text-[15px] font-extrabold leading-none tabular-nums text-white">
            {formatNumber(display)}
          </span>
          {pop && (
            <span
              key={pop.key}
              aria-hidden
              className="jackpot-pop text-electric-pink absolute -top-3 left-1/2 text-[11px] font-extrabold tabular-nums"
            >
              +{formatNumber(pop.amount)}
            </span>
          )}
        </span>
      </SkeletonSuspense>
    </Link>
  );
}
