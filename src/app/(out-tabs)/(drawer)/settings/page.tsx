'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import { SettingsMenuItem } from '@/components/pages/out-tabs/drawer/settings/SettingsMenuItem';
import { Bell, Globe, Lock, LogOut, Mail, Phone, UserPen } from 'lucide-react';
import { useGetMeQuery } from '@/api/me.api';

export default function SettingsPage() {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();

  const handleSignOut = () => {
    console.log('Sign Out');
  };

  const sections = [
    {
      title: t('account'),
      items: [
        {
          href: routes.settings.username,
          icon: <UserPen size={20} />,
          title: t('change username'),
          description: me?.username || t('manage your account details'),
        },
        {
          href: routes.settings.email,
          icon: <Mail size={20} />,
          title: t('change email'),
          description: me?.email || t('confirm or change your email address'),
        },
        {
          href: routes.settings.phone,
          icon: <Phone size={20} />,
          title: t('change phone'),
          description: me?.phoneNumber || t('confirm or change your phone number'),
        },
      ],
    },
    {
      title: t('security'),
      items: [
        {
          href: routes.settings.security,
          icon: <Lock size={20} />,
          title: t('security'),
          description: t('manage your security settings'),
        },
      ],
    },
    {
      title: t('preferences'),
      items: [
        {
          href: routes.notifications,
          icon: <Bell size={20} />,
          title: t('notifications'),
          description: t('notifications settings'),
        },
        {
          href: routes.languages,
          icon: <Globe size={20} />,
          title: t('languages'),
          description: t('language settings'),
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {sections.map(section => (
        <div key={section.title} className="flex flex-col gap-2">
          <h2 className="text-gray-secondary text-sm font-bold uppercase">{section.title}</h2>
          {section.items.map(item => (
            <SettingsMenuItem key={item.title} {...item} />
          ))}
        </div>
      ))}

      <div className="mt-4">
        <SettingsMenuItem
          onClick={handleSignOut}
          icon={<LogOut size={20} />}
          title={t('sign out')}
          className="bg-red-500/10 active:bg-red-500/20"
          rightElement={<div />} // Hide chevron
        />
      </div>
    </div>
  );
}
