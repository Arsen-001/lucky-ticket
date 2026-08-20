'use client';

import { useGetPublicConfigQuery } from '@/api/config.api';
import { appConfig } from '@/config/app.config';
import type { StarPackage } from '@/types/interfaces/config.interfaces';

export interface StarPackages {
  /** Ascending by price — the order the buy sheet draws them in. */
  packages: StarPackage[];
  /**
   * Bonus Lucky Stars a top-up of `stars` ⭐ earns, by the same rule the
   * backend credits by: the biggest package at or below what is paid.
   */
  bonusFor: (stars: number) => number;
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

  return {
    packages,
    bonusFor: (stars: number) =>
      packages.reduce((bonus, pkg) => (stars >= pkg.stars ? Math.max(bonus, pkg.bonus) : bonus), 0),
  };
}
