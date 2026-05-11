'use client';

import { Mail, UserPen } from 'lucide-react';
import { useGetMeQuery } from '@/api/me.api';
import { NotificationPreferencesSection } from '@/components/pages/out-tabs/drawer/settings/NotificationPreferencesSection';
import { SettingsAvatarRow } from '@/components/pages/out-tabs/drawer/settings/SettingsAvatarRow';
import { SettingsMenuItem } from '@/components/pages/out-tabs/drawer/settings/SettingsMenuItem';
import type { SettingsMenuAccent } from '@/components/pages/out-tabs/drawer/settings/SettingsMenuItem';
import { SettingsSignOut } from '@/components/pages/out-tabs/drawer/settings/SettingsSignOut';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export default function SettingsPage() {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();

  const sections: {
    title: string;
    items: Array<{
      href: string;
      icon: React.ReactNode;
      title: string;
      description?: string;
      accent?: SettingsMenuAccent;
    }>;
  }[] = [
    {
      title: t('account'),
      items: [
        {
          href: routes.settings.username,
          icon: <UserPen size={18} className="text-electric-purple" />,
          title: t('change username'),
          description: me?.username || t('manage your account details'),
          accent: 'purple',
        },
        {
          href: routes.settings.email,
          icon: <Mail size={18} className="text-electric-purple" />,
          title: t('change email'),
          description: me?.email || t('confirm or change your email address'),
          accent: 'purple',
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {sections.map((section, sectionIndex) => (
        <div
          key={section.title}
          className="animate-slide-in-bottom flex flex-col gap-2"
          style={{ animationDelay: `${sectionIndex * 80}ms` }}
        >
          <h2 className="text-gray-secondary text-sm font-bold uppercase tracking-wider px-1">
            {section.title}
          </h2>
          <div className="flex flex-col gap-2">
            {sectionIndex === 0 && <SettingsAvatarRow />}
            {section.items.map(item => (
              <SettingsMenuItem key={item.title} {...item} />
            ))}
          </div>
        </div>
      ))}

      <div
        className="animate-slide-in-bottom"
        style={{ animationDelay: `${sections.length * 80}ms` }}
      >
        <NotificationPreferencesSection />
      </div>

      <div
        className="animate-slide-in-bottom mt-4"
        style={{ animationDelay: `${(sections.length + 1) * 80}ms` }}
      >
        <SettingsSignOut />
      </div>
    </div>
  );
}
