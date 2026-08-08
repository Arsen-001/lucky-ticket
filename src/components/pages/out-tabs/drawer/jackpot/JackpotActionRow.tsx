'use client';

import { Sparkles, Store, Swords } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import type { LucideIcon } from 'lucide-react';
import type { Route } from '@/constants/routes';

export interface JackpotActionRowProps {
  className?: string;
}

const CELL =
  'flex min-h-13 flex-1 items-center justify-center gap-1.5 px-1 text-[11px] font-extrabold uppercase tracking-wide transition-colors hover:bg-white/4 cursor-pointer';

/**
 * The card's footer: the three ways into the draw. Same construction as the LC
 * card's action row — they act on the number above them, so they are the card's
 * own footer rather than a block below it.
 */
export function JackpotActionRow({ className }: JackpotActionRowProps) {
  const t = useAppTranslations();

  const links: { href: Route; Icon: LucideIcon; label: string }[] = [
    { href: routes.tournaments.index, Icon: Swords, label: t('tournaments') },
    { href: routes.tasks, Icon: Sparkles, label: t('tasks') },
    { href: routes.market(), Icon: Store, label: t('market') },
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
          <link.Icon size={15} strokeWidth={2.5} className="text-gold flex-shrink-0" />
          <span className="truncate text-white/85">{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
