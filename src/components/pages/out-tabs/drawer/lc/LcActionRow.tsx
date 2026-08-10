'use client';

import { ArrowLeftRight, Sparkles, Store } from 'lucide-react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useWalletLimits } from '@/hooks/useWalletLimits';
import { useClaimableTasks } from '@/hooks/useClaimableTasks';
import { routes } from '@/constants/routes';
import { ClaimableDot } from '@/components/shared/badges/ClaimableDot';
import { LcActionCell } from './LcActionCell';
import type { LucideIcon } from 'lucide-react';
import type { Route } from '@/constants/routes';

export interface LcActionRowProps {
  onConvertTon: () => void;
  className?: string;
}

const CELL =
  'flex min-h-13 flex-1 items-center justify-center gap-1.5 px-1 text-[11px] font-extrabold uppercase tracking-wide transition-colors hover:bg-white/4 cursor-pointer';

/**
 * The three actions as a footer inside the balance card rather than a separate
 * block below it: they act on the number above them, and as their own card they
 * cost a 16px gap plus a border to say so.
 */
export function LcActionRow({ onConvertTon, className }: LcActionRowProps) {
  const t = useAppTranslations();
  const { withdrawalsEnabled } = useWalletLimits();
  // "Where do I get more LC" is what this footer answers — so it says when the
  // answer is already sitting there, unclaimed.
  const { hasAny: hasClaimableTasks, route: claimRoute } = useClaimableTasks();

  // `claimable` rather than re-comparing the href: it now carries the frequency
  // the reward is on, so it is no longer equal to `routes.tasks`.
  const links: { href: Route; Icon: LucideIcon; label: string; claimable?: boolean }[] = [
    { href: claimRoute, Icon: Sparkles, label: t('tasks'), claimable: hasClaimableTasks },
    { href: routes.market(), Icon: Store, label: t('market') },
  ];

  return (
    <div
      className={twMerge(
        'relative flex divide-x divide-white/8 border-t border-white/8',
        className
      )}
    >
      <button type="button" onClick={onConvertTon} className={CELL}>
        <LcActionCell Icon={ArrowLeftRight} label={t('convert')} locked={!withdrawalsEnabled} />
      </button>

      {links.map(link => (
        <Link key={link.href} href={link.href} className={CELL}>
          <LcActionCell Icon={link.Icon} label={link.label} />
          {link.claimable && <ClaimableDot label={t('something to claim')} size="sm" />}
        </Link>
      ))}
    </div>
  );
}
