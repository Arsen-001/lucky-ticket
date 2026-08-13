'use client';

import { Check, Loader2, Lock, TriangleAlert } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { comingSoonConfig } from '@/config/coming-soon.config';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import '@/styles/components/coming-soon-gift.css';

/**
 * `paused` is the state a filed claim falls back into when the ladder that
 * earned it comes apart — a friend leaves the channel after the press. It is
 * deliberately NOT `locked`: the claim row is unique per account and permanent,
 * so there is nothing to press again, and a padlock would invite a tap that can
 * only answer «Подарок уже запрошен». @see ComingSoonGiftSteps
 */
export type GiftPrizeState = 'locked' | 'ready' | 'closed' | 'claimed' | 'paused' | 'sent';

export interface GiftPrizeProps {
  /** What the bot hands out — the emoji, drawn large when there is no picture. */
  emoji: string;
  /**
   * The gift's own sticker, when the server knows it. Preferred over the emoji
   * because Telegram's emoji does not identify a gift: its teddy bear reports
   * '🎂', so a ladder drawn from the emoji would promise a cake and deliver a
   * bear. @see PreLaunchGiftState.giftImage
   */
  image?: string | null;
  state: GiftPrizeState;
  /** Files the claim. Only ever called in the `ready` state. */
  onClaim?: () => void;
  /** The claim request is in flight. */
  claiming?: boolean;
  className?: string;
}

/**
 * The gift itself, at the size a reward deserves — and the button that asks
 * for it.
 *
 * Nothing is filed until this is pressed. That is the point of drawing it big
 * and lighting it up: the promo now has an act in it («забрать»), which is both
 * what makes a player finish the ladder and what separates «попросил» from
 * «набрал, но не попросил» for whoever decides the payouts.
 *
 * A `button` only while it can actually be pressed — a disabled-looking control
 * that still takes taps is how a player concludes the screen is broken.
 */
export function GiftPrize({ emoji, image, state, onClaim, claiming, className }: GiftPrizeProps) {
  const t = useAppTranslations();

  const ready = state === 'ready';
  const settled = state === 'claimed' || state === 'sent';

  const label = (() => {
    if (state === 'ready') return t('coming soon gift claim');
    if (state === 'closed') return t('coming soon gift places gone');
    if (state === 'claimed') return t('coming soon gift requested');
    if (state === 'paused') return t('coming soon gift paused');
    if (state === 'sent') return t('coming soon gift in chat');
    // Число берётся из конфига, а не из текста: планка уже менялась (5 → 7),
    // и подпись, которая живёт своей жизнью, обещает не ту лестницу.
    return t('coming soon gift locked', {
      count: comingSoonConfig.giftFriendsRequired,
    });
  })();

  const face = (
    <span
      className={twMerge(
        'flex-center relative h-28 w-28 rounded-3xl border text-[3.5rem] leading-none transition-all duration-300',
        ready && 'gift-glow border-electric-pink/70 bg-electric-pink/15',
        settled && 'border-success/50 bg-success/10',
        state === 'locked' && 'border-white/10 bg-white/5 opacity-45 grayscale',
        state === 'closed' && 'border-warning/40 bg-warning/10 opacity-70',
        // Dimmed but NOT greyed out: the gift is still theirs to finish, and
        // draining the colour out of it reads as «отобрали».
        state === 'paused' && 'border-warning/50 bg-warning/10 opacity-80'
      )}
    >
      {image ? (
        // A data: URI from our own backend — `next/image` has nothing to
        // optimise here and its loader rejects the scheme.
        // eslint-disable-next-line @next/next/no-img-element
        <img aria-hidden alt="" src={image} className="h-20 w-20 object-contain" />
      ) : (
        <span aria-hidden>{emoji}</span>
      )}

      {state === 'locked' && (
        <span className="flex-center absolute -bottom-2 -right-2 h-8 w-8 rounded-full border border-white/12 bg-[var(--color-background)] text-white/60">
          <Lock size={15} strokeWidth={2.4} />
        </span>
      )}
      {state === 'paused' && (
        <span className="flex-center text-warning absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-[var(--color-background)] bg-[var(--color-background)]">
          <TriangleAlert size={16} strokeWidth={2.6} />
        </span>
      )}
      {settled && (
        <span className="flex-center bg-success absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-2 border-[var(--color-background)] text-white">
          <Check size={16} strokeWidth={3} />
        </span>
      )}
      {claiming && (
        <span className="flex-center absolute inset-0 rounded-3xl bg-black/40">
          <Loader2 size={26} className="animate-spin text-white" />
        </span>
      )}
    </span>
  );

  const caption = (
    <span
      className={twMerge(
        'text-[13px] font-extrabold',
        ready
          ? 'text-electric-pink'
          : settled
            ? 'text-success'
            : state === 'paused'
              ? 'text-warning'
              : 'text-white/55'
      )}
    >
      {label}
    </span>
  );

  if (!ready) {
    return (
      <div className={twMerge('flex flex-col items-center gap-2.5', className)}>
        {face}
        {caption}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClaim}
      disabled={claiming}
      className={twMerge(
        'flex flex-col items-center gap-2.5 rounded-3xl outline-none transition-transform active:scale-95',
        className
      )}
    >
      {face}
      {caption}
    </button>
  );
}
