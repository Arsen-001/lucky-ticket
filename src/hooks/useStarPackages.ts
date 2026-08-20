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
  const packages = data?.wallet?.xtrPackages?.length
    ? [...data.wallet.xtrPackages].sort((a, b) => a.stars - b.stars)
    : appConfig.wallet.xtrPackages;

  return {
    packages,
    bonusFor: (stars: number) =>
      packages.reduce((bonus, pkg) => (stars >= pkg.stars ? Math.max(bonus, pkg.bonus) : bonus), 0),
  };
}
