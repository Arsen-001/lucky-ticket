'use client';

import { Sparkles, Swords, UserPlus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
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

  const links: { href: Route; Icon: LucideIcon; label: string }[] = [
    { href: routes.tasks, Icon: Sparkles, label: t('tasks') },
    { href: routes.tournaments.index, Icon: Swords, label: t('tournaments') },
    { href: routes.inviteFriends, Icon: UserPlus, label: t('friends') },
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
        </Link>
      ))}
    </div>
  );
}
