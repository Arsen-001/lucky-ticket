'use client';

import { Swords } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '@/api/notification-preferences.api';
import { Switch } from '@/components/shared/form-elements/Switch';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import type { DuelInvitePolicy } from '@/types/interfaces/notifications.interfaces';

/**
 * Кто может звать игрока на дуэль.
 *
 * Тумблер отвечает на «звать вообще можно?», а два варианта под ним — на «кому
 * можно». Отдельного «и друзья, и все» нет: «все» включает друзей по смыслу,
 * и показывать это двумя галочками значило бы предлагать невозможное
 * состояние — «все, кроме друзей».
 */
export function DuelInvitePolicyRow() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: prefs } = useGetNotificationPreferencesQuery();
  const [update, { isLoading }] = useUpdateNotificationPreferencesMutation();

  const policy = prefs?.duelInvitesFrom ?? 'friends';
  const enabled = policy !== 'nobody';

  const save = async (next: DuelInvitePolicy) => {
    try {
      await update({ duelInvitesFrom: next }).unwrap();
    } catch {
      toast.error(t('duel action failed'));
    }
  };

  const options: { key: Exclude<DuelInvitePolicy, 'nobody'>; label: string }[] = [
    { key: 'friends', label: t('duel policy friends') },
    { key: 'everyone', label: t('duel policy everyone') },
  ];

  return (
    <div className="bg-background-overlay flex flex-col gap-3 rounded-2xl border border-white/8 p-3">
      <div className="flex items-center gap-3">
        <span className="flex-center bg-electric-purple/15 text-electric-purple h-9 w-9 shrink-0 rounded-xl">
          <Swords size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">{t('duel policy title')}</span>
          <span className="text-pink-secondary block text-[11px] leading-snug">
            {enabled ? t('duel policy on note') : t('duel policy off note')}
          </span>
        </span>
        <Switch
          aria-label={t('duel policy title')}
          checked={enabled}
          disabled={isLoading}
          // Выключение помнит только «никто»: возвращаясь, игрок получает
          // дружеский вариант, а не тот, что был до выключения, — это самый
          // безопасный из двух.
          onChange={next => save(next ? 'friends' : 'nobody')}
        />
      </div>

      {enabled && (
        <div className="grid grid-cols-2 gap-2">
          {options.map(option => (
            <button
              key={option.key}
              type="button"
              aria-pressed={policy === option.key}
              disabled={isLoading}
              onClick={() => save(option.key)}
              className={twMerge(
                'rounded-xl border px-3 py-2 text-[13px] font-bold transition',
                policy === option.key
                  ? 'border-electric-purple bg-electric-purple/15'
                  : 'text-pink-secondary border-white/10'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
