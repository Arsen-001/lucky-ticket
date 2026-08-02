'use client';

import type { MouseEvent } from 'react';
import { Megaphone } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { getTelegramWebApp } from '@/lib/telegram/telegram';

export interface ComingSoonChannelLinkProps {
  className?: string;
}

/**
 * The one thing a visitor can actually do before launch: follow the channel.
 *
 * Inside Telegram a `t.me` link is handed to `openTelegramLink` so it opens in
 * the client itself — `target="_blank"` there spawns an external browser tab
 * that then bounces back into Telegram. Outside Telegram the plain `href` does
 * the work, so this stays a real link (middle-click, copy link address).
 */
export function ComingSoonChannelLink({ className }: ComingSoonChannelLinkProps) {
  const t = useAppTranslations();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const openTelegramLink = getTelegramWebApp()?.openTelegramLink;
    if (!openTelegramLink) return;
    event.preventDefault();
    openTelegramLink(GlobalConstants.telegramChannelUrl);
  };

  return (
    <a
      href={GlobalConstants.telegramChannelUrl}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className={twMerge(
        'flex-center gap-2 rounded-xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-bold text-white transition-colors active:scale-99',
        'hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white',
        className
      )}
    >
      <Megaphone size={18} className="text-electric-pink" strokeWidth={2.2} />
      {t('follow channel')}
    </a>
  );
}
