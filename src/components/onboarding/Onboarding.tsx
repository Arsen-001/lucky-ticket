'use client';

import { useEffect, useRef, useState } from 'react';
import { useGetMeQuery } from '@/api/me.api';
import { useGrantWelcomePackMutation } from '@/api/engines.api';
import { appConfig } from '@/config/app.config';
import { useAppDispatch } from '@/lib/rtk/hooks';
import { useBotWriteAccess } from '@/hooks/useBotWriteAccess';
import { startTour } from '@/lib/rtk/features/onboarding-tour.slice';
import { OnboardingLanguageStep } from '@/components/onboarding/OnboardingLanguageStep';
import { OnboardingGiftsStep } from '@/components/onboarding/OnboardingGiftsStep';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';

type OnboardingPhase = 'idle' | 'language' | 'gifts' | 'done';

/**
 * First-run onboarding orchestrator, mounted once at the app root. For a
 * brand-new level-zero account (0 AP, hasn't seen the tour) it runs: language
 * picker → welcome-gifts screen → guided tour. Claiming the gifts grants the
 * starter pack (engine + tickets + AP) and starts the tour, which renders in
 * the chosen language. The tour itself is always mounted and simply reacts to
 * its Redux `running` state, so the Settings "replay" entry keeps working.
 */
export function Onboarding() {
  const dispatch = useAppDispatch();
  const { data: me } = useGetMeQuery();
  const [grantWelcomePack] = useGrantWelcomePackMutation();
  const botWriteAccess = useBotWriteAccess();
  const [phase, setPhase] = useState<OnboardingPhase>('idle');
  const decidedRef = useRef(false);

  // Decide once (per session) whether this is a first run needing the language step.
  useEffect(() => {
    if (decidedRef.current || !me) return;
    decidedRef.current = true;
    // "Never saw the tour" is the whole test. It used to also require
    // `activityPoints === 0` as a proxy for "brand-new account", and that proxy
    // broke on launch day: every pre-launch account was reset to AP = invited
    // friends × 10 + the welcome pack, so players who had never once seen the
    // app past the countdown were counted as veterans and dropped straight into
    // an untoured game. The pack itself is granted idempotently below, so a
    // player who already owns it simply claims a screen they already have.
    const isFirstRun = !me.hasSeenTour;
    setPhase(appConfig.onboardingTour.autoStart && isFirstRun ? 'language' : 'done');
  }, [me]);

  const handleLanguageConfirm = () => {
    setPhase('gifts');
  };

  const handleClaimGifts = () => {
    // Ask Telegram for permission to message this player, here and nowhere
    // earlier: this is a real tap (the client ignores the request outside a user
    // interaction), and it lands the moment they have been handed an engine —
    // so "let me tell you when it is full" is a promise about something they
    // now own rather than an abstract permission prompt on a cold start.
    //
    // Without it the bot cannot write first, and every notification the game
    // offers is undeliverable: production measured ZERO of ~1000 engine-ready
    // reminders arriving on 19.08.2026. @see useBotWriteAccess
    //
    // Deliberately not awaited. The popup is the client's, the answer changes
    // nothing about the gifts, and a player who dismisses it must still land in
    // the tour rather than on a frozen screen.
    if (botWriteAccess.canAsk) void botWriteAccess.ask();

    setPhase('done');
    // Grant the welcome pack (engine + tickets + AP), then start the tour (whose
    // engine step now has something to highlight). The grant patches the cache
    // instantly, so the engine is present by the time the tour navigates home.
    grantWelcomePack();
    dispatch(startTour());
  };

  return (
    <>
      {phase === 'language' && <OnboardingLanguageStep onConfirm={handleLanguageConfirm} />}
      {phase === 'gifts' && <OnboardingGiftsStep onClaim={handleClaimGifts} />}
      <OnboardingTour />
    </>
  );
}
