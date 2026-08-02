'use client';

import { Check, User } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { CSSProperties } from 'react';

export interface ComingSoonFriendRowProps {
  username: string;
  /** Telegram photo or an in-app avatar path; empty for a friend with neither. */
  avatar?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * One person who joined through this player's link, on the countdown screen.
 *
 * Deliberately thinner than the in-app `InvitedFriendRow`: before launch every
 * friend has zero points, no status and nothing to claim, so showing those
 * fields would be showing zeroes. What is true and worth showing is that the
 * referral is recorded — hence the check.
 *
 * The avatar is a plain `<img>`, not `next/image`: it is a third-party URL
 * (Telegram's CDN, which moves hosts), and an image host missing from
 * `next.config.remotePatterns` throws at render. Everywhere else in the app
 * that would surface as one broken card inside an error boundary; here it would
 * take down the only screen a pre-launch visitor has.
 */
export function ComingSoonFriendRow({
  username,
  avatar,
  className,
  style,
}: ComingSoonFriendRowProps) {
  const t = useAppTranslations();

  return (
    <div
      style={style}
      className={twMerge(
        'flex items-center gap-2.5 rounded-xl border border-white/6 bg-white/4 px-2.5 py-2',
        className
      )}
    >
      <span className="flex-center h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-white/8">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <User size={15} className="text-white/50" strokeWidth={2.2} />
        )}
      </span>

      <span className="min-w-0 flex-1 truncate text-left text-[13px] font-bold text-white">
        {username}
      </span>

      <span className="text-success flex flex-shrink-0 items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
        <Check size={12} strokeWidth={3} />
        {t('invite counted')}
      </span>
    </div>
  );
}
