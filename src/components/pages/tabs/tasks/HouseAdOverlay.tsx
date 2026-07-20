'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { registerHousePresenter } from '@/lib/ads/house.provider';
import { houseAdDurationSeconds, houseAdPromos } from '@/constants/house-ads.constants';

/**
 * Renders the house ad — the app's own promo shown when no ad network had fill.
 *
 * Mounting this component is what makes the `house` provider available: it
 * registers a presenter that `showRewardedAd()` awaits (see
 * `src/lib/ads/house.provider.ts`). Without it mounted, the waterfall simply
 * ends at the last network and the "no ads" modal appears as before.
 *
 * The reward unlocks only after the full countdown; closing early resolves as
 * `skipped` and grants nothing — same contract as a network rewarded video.
 */
export function HouseAdOverlay() {
  const t = useAppTranslations();
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(houseAdDurationSeconds);
  const [promoIndex, setPromoIndex] = useState(0);
  const resolveRef = useRef<((outcome: 'completed' | 'skipped') => void) | null>(null);
  const shownCountRef = useRef(0);

  useEffect(
    () =>
      registerHousePresenter(
        () =>
          new Promise<'completed' | 'skipped'>(resolve => {
            resolveRef.current = resolve;
            // Rotate so a player working through the daily quota doesn't see
            // the same promo every time.
            setPromoIndex(shownCountRef.current++ % houseAdPromos.length);
            setSecondsLeft(houseAdDurationSeconds);
            setOpen(true);
          })
      ),
    []
  );

  useEffect(() => {
    if (!open || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft(current => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [open, secondsLeft]);

  const finish = (outcome: 'completed' | 'skipped') => {
    setOpen(false);
    resolveRef.current?.(outcome);
    resolveRef.current = null;
  };

  const promo = houseAdPromos[promoIndex];
  const Icon = promo.icon;
  const unlocked = secondsLeft <= 0;

  const handleCta = () => {
    if (!promo.href) return;
    // Opened in Telegram without closing the promo, so the player can still
    // claim the reward after subscribing.
    window.Telegram?.WebApp?.openTelegramLink?.(promo.href);
  };

  return (
    <Modal open={open} closeOnOverlayClick={false} hideOnEscape={false} hideCloseButton>
      <div className="relative bg-purple-gradient rounded-2xl overflow-hidden w-full max-w-[360px] mx-auto">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl"
        />

        <button
          type="button"
          onClick={() => finish('skipped')}
          aria-label={t('close')}
          className="absolute right-3 top-3 z-10 flex-center h-8 w-8 rounded-full bg-black/25 text-white-secondary"
        >
          <X size={16} />
        </button>

        <div className="relative flex flex-col items-center gap-4 px-6 pt-8 pb-6 text-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white-secondary">
            {t('house ad badge')}
          </span>

          <div className="flex-center h-24 w-24 rounded-full bg-white/5 border border-white/10">
            <Icon size={40} className="text-pink-secondary" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-extrabold leading-tight">{t(promo.titleKey)}</h2>
            <p className="text-sm text-white-secondary max-w-[260px]">{t(promo.descriptionKey)}</p>
          </div>

          {promo.href && promo.ctaKey && (
            <Button
              variant="transparent"
              onClick={handleCta}
              className="w-full rounded-xl py-3 text-sm border border-white/15"
            >
              {t(promo.ctaKey)}
            </Button>
          )}

          <Button
            onClick={() => finish('completed')}
            disabled={!unlocked}
            className="w-full rounded-xl py-3 text-sm disabled:opacity-60"
          >
            {unlocked ? t('claim reward') : t('reward in seconds', { sec: secondsLeft })}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
