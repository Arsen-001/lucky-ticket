'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { SettingsMenuItem } from '@/components/pages/out-tabs/drawer/settings/SettingsMenuItem';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';

export function SettingsSignOut() {
  const t = useAppTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      router.push(routes.login);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <SettingsMenuItem
        onClick={() => setOpen(true)}
        icon={<LogOut size={18} className="text-error-text" />}
        title={t('sign out')}
        accent="error"
        rightElement={<div />}
      />

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        title={t('sign out confirm title')}
        content={<p className="text-sm text-white/80">{t('sign out confirm description')}</p>}
        confirmText={t('sign out')}
      />
    </>
  );
}
