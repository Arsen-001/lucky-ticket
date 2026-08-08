'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { SettingsUsernameModal } from '@/components/pages/out-tabs/drawer/settings/SettingsUsernameModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export function ProfileUsernameEditButton() {
  const t = useAppTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('change username')}
        className="tap-target flex-center animate-fade-in relative h-7 w-7 shrink-0 rounded-full border border-white/15 bg-white/10 text-white/80 transition-all active:scale-90"
      >
        <Pencil size={13} strokeWidth={2.5} />
      </button>

      <SettingsUsernameModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
