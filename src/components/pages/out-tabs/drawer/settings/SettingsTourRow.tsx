'use client';

import { PlayCircle, RotateCcw } from 'lucide-react';
import { useUpdateMeMutation } from '@/api/me.api';
import { SettingsMenuItem } from '@/components/pages/out-tabs/drawer/settings/SettingsMenuItem';
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
  const [updateMe] = useUpdateMeMutation();

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
        onClick={() => updateMe({ hasSeenTour: false })}
        icon={<RotateCcw size={18} className="text-gold" />}
        title={t('reset onboarding')}
        description={t('show the tour again for a new account')}
        accent="gold"
        rightElement={<div />}
      />
    </div>
  );
}
