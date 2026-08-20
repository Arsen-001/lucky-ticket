'use client';

import { Sparkles, Swords, UserPlus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useClaimableFriends } from '@/hooks/useClaimableFriends';
import { useClaimableTasks } from '@/hooks/useClaimableTasks';
import { ClaimableDot } from '@/components/shared/badges/ClaimableDot';
import { routes } from '@/constants/routes';
import type { LucideIcon } from 'lucide-react';
import type { Route } from '@/constants/routes';

export interface ActivityActionRowProps {
  /** Colour of the cell glyphs — the player's tier accent. */
  accent: string;
  className?: string;
}

const CELL =
  'flex min-h-13 flex-1 items-center justify-center gap-1.5 px-1 text-[12px] font-extrabold uppercase tracking-wide transition-colors hover:bg-white/4 cursor-pointer';

/**
 * The card's footer: the three screens where AP is actually earned. Same
 * construction as the LC and jackpot cards — they act on the number above them,
 * so they are the card's own footer rather than a block below it.
 */
export function ActivityActionRow({ accent, className }: ActivityActionRowProps) {
  const t = useAppTranslations();
  const { hasAny: hasClaimableTasks, route: claimRoute } = useClaimableTasks();
  // Friends pay out here too, and the row is the shortcut to that screen — so
  // it carries the same mark when a reward is sitting on it.
  const { hasAny: hasClaimableFriends } = useClaimableFriends();

  // `claimable` rather than re-comparing the href: it now carries the frequency
  // the reward is on, so it is no longer equal to `routes.tasks`.
  const links: { href: Route; Icon: LucideIcon; label: string; claimable?: boolean }[] = [
    { href: claimRoute, Icon: Sparkles, label: t('tasks'), claimable: hasClaimableTasks },
    { href: routes.tournaments.index, Icon: Swords, label: t('tournaments') },
    {
      href: routes.inviteFriends,
      Icon: UserPlus,
      label: t('friends'),
      claimable: hasClaimableFriends,
    },
  ];

  return (
    <div
      className={twMerge(
        'relative flex divide-x divide-white/8 border-t border-white/8',
        className
      )}
    >
      {links.map(link => (
        <Link key={link.href} href={link.href} className={CELL}>
          <link.Icon
            size={16}
            strokeWidth={2.5}
            className="flex-shrink-0"
            style={{ color: accent }}
          />
          <span className="truncate text-white/85">{link.label}</span>
          {link.claimable && <ClaimableDot label={t('something to claim')} size="sm" />}
        </Link>
      ))}
    </div>
  );
}
