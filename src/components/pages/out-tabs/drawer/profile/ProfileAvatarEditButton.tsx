'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useGetMeQuery } from '@/api/me.api';
import { SettingsAvatarModal } from '@/components/pages/out-tabs/drawer/settings/SettingsAvatarModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export function ProfileAvatarEditButton() {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('change avatar')}
        className="bg-pink-gradient flex-center animate-fade-in border-background absolute -bottom-[5px] -right-[5px] z-10 h-9 w-9 rounded-full border-2 text-white shadow-lg transition-all active:scale-90"
      >
        <Pencil size={15} strokeWidth={2.5} />
      </button>

      <SettingsAvatarModal
        open={open}
        onClose={() => setOpen(false)}
        currentAvatarId={me?.avatarId}
      />
    </>
  );
}
