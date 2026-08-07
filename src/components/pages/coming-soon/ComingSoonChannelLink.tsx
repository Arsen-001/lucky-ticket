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
        // The screen's primary action, so it is dressed as one: the app's own
        // pink gradient rather than the ghost outline it used to wear, at the
        // width of the headline above it. The glow is the same idiom a
        // completed gift step uses. @see GiftStepNode
        'bg-pink-gradient flex-center w-full max-w-[18rem] gap-2.5 rounded-2xl px-7 py-4 text-lg font-extrabold text-white',
        'shadow-[0_0_28px_-6px_var(--color-electric-pink)] transition-transform active:scale-98',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
        className
      )}
    >
      <Megaphone size={22} strokeWidth={2.4} />
      {t('follow channel')}
    </a>
  );
}
