'use client';

import { useGetPublicConfigQuery } from '@/api/config.api';
import { useCountDown } from '@/hooks/useCountDown';
import { appConfig } from '@/config/app.config';
import type { StarPackage } from '@/types/interfaces/config.interfaces';

export interface StarPackages {
  /** Ascending by price — the order the buy sheet draws them in. */
  packages: StarPackage[];
  /**
   * Bonus Lucky Stars a top-up of `stars` ⭐ earns, by the same rule the
   * backend credits by: the biggest package at or below what is paid — and
   * zero once the promo has ended.
   */
  bonusFor: (stars: number) => number;
  /** What the bonus is worth as a share of the payment («+25 %»), rounded. */
  bonusPercent: (pkg: StarPackage) => number;
  /** When the ladder stops paying, or undefined when it has no deadline. */
  promoEndsAt?: string;
  /** Is the bonus still being granted right now? */
  promoActive: boolean;
}

/**
 * The Telegram-Stars top-up packages and their bonus, read from `GET /config`.
 *
 * The bundled table is a fallback while the query is in flight (or against a
 * backend that predates the packages) — the webhook pays the bonus from the
 * server's own copy, so the screen has to quote that one or it promises a
 * number nobody honours.
 *
 * `bonusFor` mirrors `starsPurchaseBonus` on the backend: the bonus is decided
 * by the amount PAID, not by which button was tapped, so a free-typed 210⭐
 * earns the 200⭐ package's bonus instead of nothing.
 */
export function useStarPackages(): StarPackages {
  const { data } = useGetPublicConfigQuery();
  // An EMPTY list is an answer — the admin turned packages off, and the sheet
  // then offers the plain 1:1 top-up. Only an ABSENT one (query in flight, or a
  // backend that predates the field) falls back to the bundled table; treating
  // the two the same would resurrect four packages nobody is paying a bonus on.
  const served = data?.wallet?.xtrPackages;
  const packages = served
    ? [...served].sort((a, b) => a.stars - b.stars)
    : appConfig.wallet.xtrPackages;

  // The promo deadline, mirroring `starsPromoActive` on the backend: no date —
  // and any date that will not parse — means no deadline. A typo must fail
  // towards "the bonus still pays", never towards a screen that quietly stops
  // promising what the webhook still grants.
  const endsAtRaw = data?.wallet?.xtrPackagesPromoEndsAt ?? null;
  const hasDeadline = !!endsAtRaw && !Number.isNaN(new Date(endsAtRaw).getTime());
  // The clock decides, not `Date.now()` read during render: this way the bonus
  // disappears from the screen the second it stops being granted, without a
  // reload — and the render stays pure (`react-hooks/purity` rejects the
  // direct read, and it is right to: a value that changes with the wall clock
  // makes a render non-repeatable).
  const { expired } = useCountDown(hasDeadline ? endsAtRaw! : undefined);
  const promoActive = !hasDeadline || !expired;

  return {
    packages,
    promoEndsAt: hasDeadline ? endsAtRaw! : undefined,
    promoActive,
    bonusFor: (stars: number) =>
      promoActive
        ? packages.reduce(
            (bonus, pkg) => (stars >= pkg.stars ? Math.max(bonus, pkg.bonus) : bonus),
            0
          )
        : 0,
    bonusPercent: (pkg: StarPackage) =>
      pkg.stars > 0 ? Math.round((pkg.bonus / pkg.stars) * 100) : 0,
  };
}
