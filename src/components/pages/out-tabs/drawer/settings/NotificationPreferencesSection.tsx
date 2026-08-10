'use client';

import {
  Award,
  Flag,
  Gift,
  Layers,
  Mail,
  Megaphone,
  Swords,
  TrophyIcon,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
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
  NotificationPreferences,
} from '@/types/interfaces/notifications.interfaces';
import type { SettingsMenuAccent } from '@/components/pages/out-tabs/drawer/settings/SettingsMenuItem';
import { staggerMs } from '@/utils/global/animation.utils';

interface CategoryDef {
  key: NotificationPreferenceKey;
  icon: LucideIcon;
  fg: string;
  accent: SettingsMenuAccent;
  labelKey: MessageIds;
  descriptionKey?: MessageIds;
}

/**
 * Every category the game writes to a player, in the order they matter.
 *
 * The list is the backend's `DEFAULT_PREFS` one for one — a row here without a
 * key there is a switch that saves nothing, and a key there without a row here
 * is a message the player cannot turn off.
 */
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
    key: 'invites',
    icon: Swords,
    fg: 'text-gold',
    accent: 'gold',
    labelKey: 'tournament invites',
    descriptionKey: 'tournament invites description',
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
    key: 'friends',
    icon: UserPlus,
    fg: 'text-teal',
    accent: 'teal',
    labelKey: 'friends joined',
    descriptionKey: 'friends joined description',
  },
  {
    key: 'achievements',
    icon: Award,
    fg: 'text-teal',
    accent: 'teal',
    labelKey: 'achievements',
    descriptionKey: 'achievements notification description',
  },
  {
    key: 'system',
    icon: Megaphone,
    fg: 'text-white-secondary',
    accent: 'pink',
    labelKey: 'news and announcements',
    descriptionKey: 'news and announcements description',
  },
];

/** How many of this channel's categories are on — shown on the channel tab. */
const enabledCount = (
  preferences: NotificationPreferences | undefined,
  channel: NotificationChannel
) => (preferences ? CATEGORIES.filter(category => preferences[channel][category.key]).length : 0);

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
            style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
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

  const channelTitle = (channel: NotificationChannel, icon: React.ReactNode, label: string) => (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {label}
      {!isLoading && (
        <span className="text-[11px] font-bold opacity-60">
          {enabledCount(data, channel)}/{CATEGORIES.length}
        </span>
      )}
    </span>
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

      {/* Telegram leads: it is the channel the game actually writes to — the
          bot DM is what a player reads outside the app. */}
      <Tabs
        defaultActiveKey="telegram"
        items={[
          {
            key: 'telegram',
            title: channelTitle('telegram', <TelegramStarIcon size={14} />, t('telegram bot')),
            children: renderChannelList('telegram'),
          },
          {
            key: 'email',
            // Its own key, not `email`: the full Russian «Электронная почта»
            // plus a counter overflows the tab bar into a scroller.
            title: channelTitle('email', <Mail size={14} strokeWidth={2.4} />, t('email channel')),
            children: renderChannelList('email'),
          },
        ]}
      />
    </div>
  );
}
