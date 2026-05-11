'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useGetMeQuery } from '@/api/me.api';
import { SettingsAvatarModal } from '@/components/pages/out-tabs/drawer/settings/SettingsAvatarModal';
import { UserAvatar } from '@/components/shared/user-elements/UserAvatar';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import '@/styles/components/settings-card.css';

export function SettingsAvatarRow() {
  const t = useAppTranslations();
  const { data: me, isLoading } = useGetMeQuery();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="settings-card settings-card--purple flex w-full items-center justify-between gap-4 rounded-xl px-3.5 py-3 text-left transition-all active:scale-99 active:opacity-90"
      >
        <div className="flex flex-1 items-center gap-3.5 overflow-hidden">
          <UserAvatar src={me?.avatar} size={40} loading={isLoading} />
          <div className="flex flex-col overflow-hidden">
            <span className="text-white-secondary text-[15px] font-bold leading-tight truncate">
              {t('change avatar')}
            </span>
            <span className="text-[12px] text-gray-secondary font-semibold truncate mt-0.5">
              {t('tap to pick an avatar')}
            </span>
          </div>
        </div>
        <ChevronRight size={18} className="text-white/35 shrink-0" />
      </button>

      <SettingsAvatarModal
        open={open}
        onClose={() => setOpen(false)}
        currentAvatarId={me?.avatarId}
      />
    </>
  );
}
