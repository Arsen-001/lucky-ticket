'use client';

import '@/styles/components/onboarding-tour.css';
import type { CSSProperties } from 'react';
import { Pointer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TourStep } from '@/constants/onboarding-tour.constants';
import type { TourTargetPhase } from '@/hooks/useTourTarget';

/** Padding added around the highlighted element when punching the spotlight hole. */
const HOLE_PADDING = 8;

export interface OnboardingTourOverlayProps {
  step: TourStep;
  stepIndex: number;
  total: number;
  rect: DOMRect | null;
  phase: TourTargetPhase;
  isLast: boolean;
  /** Advance the tour (or fire the real action + finish on the final step). */
  onAdvance: () => void;
  onSkip: () => void;
}

export function OnboardingTourOverlay({
  step,
  stepIndex,
  total,
  rect,
  phase,
  isLast,
  onAdvance,
  onSkip,
}: OnboardingTourOverlayProps) {
  const t = useAppTranslations();

  const holeStyle = rect
    ? {
        top: rect.top - HOLE_PADDING,
        left: rect.left - HOLE_PADDING,
        width: rect.width + HOLE_PADDING * 2,
        height: rect.height + HOLE_PADDING * 2,
      }
    : null;

  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const targetCenterY = rect ? rect.top + rect.height / 2 : viewportHeight / 2;
  // Pin the explanatory card to the side opposite the target so it never covers it.
  const bubbleAtBottom = rect ? targetCenterY < viewportHeight * 0.52 : false;

  // Keep the card (and its always-visible advance button) inside the safe area —
  // in Telegram fullscreen a flat top-6 / bottom-6 would slip under Telegram's
  // floating chrome or into the home-indicator gesture zone.
  const cardPosition: CSSProperties =
    phase === 'fallback'
      ? { top: '50%', transform: 'translateY(-50%)' }
      : bubbleAtBottom
        ? { bottom: 'calc(1.5rem + var(--tg-inset-bottom))' }
        : { top: 'calc(1.5rem + var(--tg-inset-top))' };

  return (
    <ClientPortal>
      <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true">
        {phase === 'targeted' && holeStyle ? (
          <>
            {/* Catches taps outside the hole so the rest of the app stays inert. */}
            <div className="absolute inset-0" onClick={e => e.stopPropagation()} />
            <div className="tour-overlay-dim" style={holeStyle} />
            <div className="tour-overlay-ring" style={holeStyle} />
            {/* Transparent hit target over the highlighted element. */}
            <button
              type="button"
              aria-label={t('tour advance')}
              onClick={onAdvance}
              style={holeStyle}
              className="absolute cursor-pointer rounded-[18px]"
            />
            {/* Animated hand that points at the target and mimics a tap — shows
                exactly where to press. Ignores pointer events so the real tap
                still lands on the hit target above. */}
            <span
              aria-hidden
              className="tour-tap-hand"
              style={{
                top: holeStyle.top + holeStyle.height / 2,
                left: holeStyle.left + holeStyle.width / 2,
              }}
            >
              <Pointer size={42} strokeWidth={2.4} />
            </span>
          </>
        ) : (
          <div
            className="absolute inset-0 bg-[rgba(9,7,18,0.6)]"
            onClick={e => e.stopPropagation()}
          />
        )}

        {phase !== 'searching' && (
          <div className="absolute inset-x-0 flex justify-center px-4" style={cardPosition}>
            <div className="border-electric-pink/30 bg-background-overlay/95 animate-slide-in-bottom w-full max-w-[420px] rounded-2xl border p-5 shadow-[0_18px_60px_-12px_rgba(0,0,0,0.7)] backdrop-blur-md">
              <div className="mb-3 flex items-center justify-center gap-1.5">
                {Array.from({ length: total }).map((_, i) => (
                  <span
                    key={i}
                    className={twMerge(
                      'h-1.5 rounded-full transition-all',
                      i === stepIndex ? 'bg-electric-pink w-5' : 'w-1.5 bg-white/20'
                    )}
                  />
                ))}
              </div>

              <h3 className="text-center text-lg font-extrabold text-white">{t(step.titleKey)}</h3>
              <p className="text-white-secondary mt-1.5 text-center text-sm leading-relaxed">
                {t(step.bodyKey)}
              </p>

              {phase === 'targeted' && (
                <p className="text-electric-pink animation-blink mt-3 text-center text-[11px] font-bold uppercase tracking-wider">
                  {t(step.actionHintKey ?? 'tap the highlighted element')}
                </p>
              )}

              {/* Always-visible advance control — the guaranteed on-screen way to
                  proceed even when the highlighted target is off-screen or hard to
                  tap. On realAction steps onAdvance fires the target's real click
                  programmatically, so the action still happens. */}
              <Button onClick={onAdvance} className="mt-4 w-full">
                {isLast ? t('finish') : t('got it')}
              </Button>

              <button
                type="button"
                onClick={onSkip}
                className="mx-auto mt-3 block text-[12px] font-semibold text-white/50 transition-colors hover:text-white/80"
              >
                {t('skip tour')}
              </button>
            </div>
          </div>
        )}
      </div>
    </ClientPortal>
  );
}
