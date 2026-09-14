'use client';

import { CalendarClock } from 'lucide-react';
import { useLocale } from 'next-intl';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { useWalletLimits } from '@/hooks/useWalletLimits';

export interface WalletWithdrawWindowNoteProps {
  className?: string;
}

/**
 * When the exit closes — the one line on this screen that carries a promise.
 *
 * The window is announced in a channel post («open for 24 hours»), and until
 * this existed the only place that knew the deadline was whoever wrote the
 * post. A date the server publishes is the same date the server enforces:
 * `withdrawalsEnabled` arrives already ANDed with it, so the moment the window
 * shuts the buttons lock, this note disappears and nothing on screen is still
 * advertising it.
 *
 * Drawn only while there IS a deadline: no date is the normal state (the exit
 * is either open with no end or closed outright), and a permanent «open until
 * …» line would be noise on every other day of the year.
 */
export function WalletWithdrawWindowNote({ className }: WalletWithdrawWindowNoteProps) {
  const t = useAppTranslations();
  const locale = useLocale();
  const { withdrawalsEnabled, withdrawalsUntil } = useWalletLimits();
  const { days, hours, minutes, seconds, expired } = useCountDown(withdrawalsUntil ?? undefined);

  const endsAt = withdrawalsUntil ? new Date(withdrawalsUntil) : null;
  const readable = endsAt !== null && !Number.isNaN(endsAt.getTime());

  // `expired` is the DEVICE clock's verdict, and it is allowed to hide the note
  // early on a fast phone — never to keep it up: whether money can actually
  // leave is `withdrawalsEnabled`, which the server already decided.
  if (!withdrawalsEnabled || !readable || expired) return null;

  // Day and month in the reader's own order, wall-clock time on their own
  // phone: the deadline is one instant, and quoting it in Yerevan time would
  // be a different hour for almost everyone reading it. Latin digits for the
  // same reason the number formatter pins them — the rest of the app's figures
  // are Latin, and one Arabic-Indic timestamp beside them reads as a glitch.
  const when = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    numberingSystem: 'latn',
  }).format(endsAt);

  // Two units, largest first — same rule as the Stars promo clock. Seconds only
  // appear under an hour, which is when they are the part that moves.
  const left =
    days > 0
      ? `${days}${t('day short')} ${hours}${t('hour short')}`
      : hours > 0
        ? `${hours}${t('hour short')} ${minutes}${t('minute short')}`
        : `${minutes}${t('minute short')} ${seconds}${t('second short')}`;

  return (
    <div
      className={twMerge(
        'border-gold/30 bg-gold/10 flex items-center gap-3 rounded-2xl border px-3.5 py-3',
        className
      )}
    >
      <span className="flex-center bg-gold/15 text-gold size-9 shrink-0 rounded-full">
        <CalendarClock size={18} strokeWidth={2.5} />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-[13px] leading-tight font-bold text-white">
          {t('withdrawals open until {date}', { date: when })}
        </p>
        <p className="text-gold text-[11px] font-extrabold tabular-nums">
          {t('closes in {time}', { time: left })}
        </p>
      </div>
    </div>
  );
}
