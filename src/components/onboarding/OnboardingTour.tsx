'use client';

import { useEffect, useRef } from 'react';
import { useGetMeQuery, useUpdateMeMutation } from '@/api/me.api';
import { TOUR_STEPS } from '@/constants/onboarding-tour.constants';
import { useFeature } from '@/hooks/useFeature';
import { useTourTarget } from '@/hooks/useTourTarget';
import { useAppDispatch, useAppSelector } from '@/lib/rtk/hooks';
import {
  endTour,
  nextStep,
  selectTourRunning,
  selectTourStepIndex,
} from '@/lib/rtk/features/onboarding-tour.slice';
import { OnboardingTourOverlay } from '@/components/onboarding/OnboardingTourOverlay';

/**
 * Drives the guided tour overlay. Reacts to the Redux `running` state — the
 * first-run start is triggered by the `Onboarding` orchestrator (after the
 * language step), and the manual replay lives in Settings. Persists
 * `hasSeenTour` when the tour finishes or is skipped. Renders nothing while idle.
 */
export function OnboardingTour() {
  const dispatch = useAppDispatch();
  const running = useAppSelector(selectTourRunning);
  const stepIndex = useAppSelector(selectTourStepIndex);
  // Шаг про экран, закрытый стадией выката, из тура выпадает: цели на экране
  // нет, и он показал бы карточку без подсветки. Флаг один, поэтому и проверка
  // одна — новая фича добавляет сюда строку, а не ветку в движок.
  const tikkiOpen = useFeature('tikkiClicker');
  const steps = TOUR_STEPS.filter(s => s.feature !== 'tikkiClicker' || tikkiOpen);
  const { data: me } = useGetMeQuery();
  const [updateMe] = useUpdateMeMutation();

  const wasRunningRef = useRef(false);
  const advanceLockRef = useRef(false);

  // Persist "seen" when the tour ends (finished or skipped).
  useEffect(() => {
    if (wasRunningRef.current && !running && me && !me.hasSeenTour) {
      updateMe({ hasSeenTour: true });
    }
    wasRunningRef.current = running;
  }, [running, me, updateMe]);

  // Re-arm advancing whenever the active step changes (or the tour restarts).
  useEffect(() => {
    advanceLockRef.current = false;
  }, [stepIndex, running]);

  // Escape always exits the tour.
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(endTour());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, dispatch]);

  const step = running ? (steps[stepIndex] ?? null) : null;
  const { rect, targetEl, phase } = useTourTarget(step, running);

  if (!running || !step) return null;

  const isLast = stepIndex === steps.length - 1;

  const advance = () => {
    if (advanceLockRef.current) return;
    advanceLockRef.current = true;
    if (step.realAction && targetEl) targetEl.click();
    if (isLast) {
      dispatch(endTour());
      return;
    }
    if (step.advanceAfterMs) {
      // Keep the current step on screen while its real action settles, then move on.
      window.setTimeout(() => dispatch(nextStep()), step.advanceAfterMs);
    } else {
      dispatch(nextStep());
    }
  };

  return (
    <OnboardingTourOverlay
      step={step}
      stepIndex={stepIndex}
      total={steps.length}
      rect={rect}
      phase={phase}
      isLast={isLast}
      onAdvance={advance}
      onSkip={() => dispatch(endTour())}
    />
  );
}
