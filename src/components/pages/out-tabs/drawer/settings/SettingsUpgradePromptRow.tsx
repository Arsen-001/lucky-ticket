'use client';

import { Zap } from 'lucide-react';
import { SettingsMenuItem } from '@/components/pages/out-tabs/drawer/settings/SettingsMenuItem';
import { Switch } from '@/components/shared/form-elements/Switch';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useSkipUpgradePrompt } from '@/hooks/useSkipUpgradePrompt';

/**
 * Settings row controlling the engine-boost confirm modal. The modal's own
 * "don't ask again" toggle hides the question — this row is the way back:
 * switch ON = ask before every paid boost upgrade (default), OFF = upgrade
 * instantly on tap.
 */
export function SettingsUpgradePromptRow() {
  const t = useAppTranslations();
  const [skip, setSkip] = useSkipUpgradePrompt();

  return (
    <SettingsMenuItem
      onClick={() => setSkip(!skip)}
      icon={<Zap size={18} className="text-pink" />}
      title={t('ask before boost upgrade')}
      description={t('confirm every paid engine upgrade')}
      accent="pink"
      rightElement={<Switch checked={!skip} onChange={next => setSkip(!next)} />}
    />
  );
}
