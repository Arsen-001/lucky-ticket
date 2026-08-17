'use client';

import { Check, PlayCircle, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useUpdateMeMutation } from '@/api/me.api';
import { SettingsMenuItem } from '@/components/pages/out-tabs/drawer/settings/SettingsMenuItem';
import { ButtonSpinner } from '@/components/shared/loaders/ButtonSpinner';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch } from '@/lib/rtk/hooks';
import { startTour } from '@/lib/rtk/features/onboarding-tour.slice';
import { useAppTranslations } from '@/hooks/useAppTranslations';

/**
 * Settings entry for the onboarding tour: run it on demand (ignores the
 * "seen" flag) or reset the flag so it auto-shows again for a level-zero
 * account. Lets the tour be tested any time without blocking the rest of the app.
 */
export function SettingsTourRow() {
  const t = useAppTranslations();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [updateMe, { isLoading: resetting }] = useUpdateMeMutation();
  // The reset changes nothing visible on this screen, so the row itself has to
  // say the tap landed: a spinner for the round trip, a check once it did.
  const [resetDone, setResetDone] = useState(false);

  const handleReset = async () => {
    if (resetting) return;
    try {
      await updateMe({ hasSeenTour: false }).unwrap();
      setResetDone(true);
    } catch {
      toast.error(t('action failed'));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <SettingsMenuItem
        onClick={() => dispatch(startTour())}
        icon={<PlayCircle size={18} className="text-teal" />}
        title={t('take the tour')}
        description={t('replay the app walkthrough')}
        accent="teal"
        rightElement={<div />}
      />
      <SettingsMenuItem
        onClick={handleReset}
        icon={<RotateCcw size={18} className="text-gold" />}
        title={t('reset onboarding')}
        description={t('show the tour again for a new account')}
        accent="gold"
        rightElement={
          resetting ? (
            <ButtonSpinner size={16} className="text-white/60" />
          ) : resetDone ? (
            <Check size={16} className="text-success" strokeWidth={2.6} />
          ) : (
            <div />
          )
        }
      />
    </div>
  );
}
