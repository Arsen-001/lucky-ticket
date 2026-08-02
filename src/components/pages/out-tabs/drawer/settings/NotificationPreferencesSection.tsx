'use client';

import { Bell, Flag, Gift, Layers, Mail, TrophyIcon, type LucideIcon } from 'lucide-react';
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '@/api/notification-preferences.api';
import { SettingsMenuItem } from '@/components/pages/out-tabs/drawer/settings/SettingsMenuItem';
import { Switch } from '@/components/shared/form-elements/Switch';
import { Tabs } from '@/components/shared/Tabs';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';
import type {
  NotificationChannel,
  NotificationPreferenceKey,
} from '@/types/interfaces/notifications.interfaces';
import type { SettingsMenuAccent } from '@/components/pages/out-tabs/drawer/settings/SettingsMenuItem';

interface CategoryDef {
  key: NotificationPreferenceKey;
  icon: LucideIcon;
  fg: string;
  accent: SettingsMenuAccent;
  labelKey: MessageIds;
  descriptionKey?: MessageIds;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'tournamentStart',
    icon: Flag,
    fg: 'text-gold',
    accent: 'gold',
    labelKey: 'tournament start',
    descriptionKey: 'tournament start description',
  },
  {
    key: 'tournamentEnd',
    icon: TrophyIcon,
    fg: 'text-gold',
    accent: 'gold',
    labelKey: 'tournament end',
    descriptionKey: 'tournament end description',
  },
  {
    key: 'stake',
    icon: Layers,
    fg: 'text-electric-purple',
    accent: 'purple',
    labelKey: 'staking ready',
    descriptionKey: 'staking ready description',
  },
  {
    key: 'gifts',
    icon: Gift,
    fg: 'text-pink',
    accent: 'pink',
    labelKey: 'gifts',
    descriptionKey: 'gifts description',
  },
  {
    key: 'system',
    icon: Bell,
    fg: 'text-white-secondary',
    accent: 'pink',
    labelKey: 'system',
  },
];

export function NotificationPreferencesSection() {
  const t = useAppTranslations();
  const { data, isLoading } = useGetNotificationPreferencesQuery();
  const [updatePreferences, { isLoading: isUpdating }] = useUpdateNotificationPreferencesMutation();

  const handleToggle = (
    channel: NotificationChannel,
    key: NotificationPreferenceKey,
    checked: boolean
  ) => {
    if (!data) return;
    updatePreferences({
      [channel]: {
        ...data[channel],
        [key]: checked,
      },
    });
  };

  const renderChannelList = (channel: NotificationChannel) => (
    <div className="flex flex-col gap-2">
      {CATEGORIES.map((category, index) => {
        const Icon = category.icon;
        const checked = data?.[channel][category.key] ?? false;
        return (
          <div
            key={category.key}
            className="animate-slide-in-bottom"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <SettingsMenuItem
              icon={<Icon size={18} className={category.fg} strokeWidth={2.4} />}
              title={t(category.labelKey)}
              description={category.descriptionKey ? t(category.descriptionKey) : undefined}
              accent={category.accent}
              onClick={() => handleToggle(channel, category.key, !checked)}
              rightElement={
                <Switch
                  aria-label={t(category.labelKey)}
                  checked={checked}
                  onChange={next => handleToggle(channel, category.key, next)}
                  loading={isLoading}
                  disabled={isUpdating}
                />
              }
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-gray-secondary text-sm font-bold uppercase tracking-wider px-1">
          {t('notification preferences')}
        </h2>
        <p className="text-[12px] text-gray-secondary leading-relaxed px-1">
          {t('notification preferences description')}
        </p>
      </div>

      <Tabs
        defaultActiveKey="email"
        items={[
          {
            key: 'email',
            title: (
              <span className="inline-flex items-center gap-1.5">
                <Mail size={14} strokeWidth={2.4} />
                {t('email')}
              </span>
            ),
            children: renderChannelList('email'),
          },
          {
            key: 'telegram',
            title: (
              <span className="inline-flex items-center gap-1.5">
                <TelegramStarIcon size={14} />
                {t('telegram bot')}
              </span>
            ),
            children: renderChannelList('telegram'),
          },
        ]}
      />
    </div>
  );
}
