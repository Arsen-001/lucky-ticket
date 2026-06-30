'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { SettingsMenuItem } from '@/components/pages/out-tabs/drawer/settings/SettingsMenuItem';
import { Switch } from '@/components/shared/form-elements/Switch';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useGetMeQuery, useUpdateMeMutation } from '@/api/me.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

export default function SecurityPage() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: me, isLoading: isMeLoading, isError, refetch } = useGetMeQuery();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();

  const is2FAEnabled = me?.twoFactorAuth ?? false;

  const handleToggle2FA = async (checked: boolean) => {
    try {
      await updateMe({ twoFactorAuth: checked }).unwrap();
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
      toast.error(t('action failed'));
    }
  };

  if (isError && !me) {
    return <QueryErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-gray-secondary text-sm font-bold uppercase px-4">
          {t('two factor auth')}
        </h2>
        <SettingsMenuItem
          icon={
            is2FAEnabled ? (
              <ShieldCheck className="text-green-500" size={18} />
            ) : (
              <ShieldAlert className="text-gray-secondary" size={18} />
            )
          }
          accent="teal"
          title={t('2fa status')}
          description={is2FAEnabled ? t('enabled') : t('disabled')}
          rightElement={
            <Switch
              checked={is2FAEnabled || isUpdating}
              onChange={handleToggle2FA}
              loading={isMeLoading}
              disabled={isMeLoading || isUpdating}
            />
          }
        />
      </div>

      <div className="px-4">
        <p className="text-sm text-gray-secondary leading-relaxed">{t('2fa description')}</p>
      </div>
    </div>
  );
}
