'use client';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  Bell,
  ChevronRight,
  HelpCircle,
  type LucideIcon,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { type Route, routes } from '@/constants/routes';

export function ProfileActions() {
  const t = useAppTranslations();

  const actions: { icon: LucideIcon; label: string; href: Route; color: string }[] = [
    {
      icon: UserPlus,
      label: t('invite friends'),
      href: routes.inviteFriends,
      color: 'text-blue-400',
    },
    {
      icon: Bell,
      label: t('notifications'),
      href: routes.notifications,
      color: 'text-yellow-400',
    },
    {
      icon: ShieldCheck,
      label: t('security'),
      href: routes.settings.security,
      color: 'text-purple-400',
    },
    {
      icon: HelpCircle,
      label: t('support'),
      href: routes.support.index,
      color: 'text-orange-400',
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-white/5 rounded-2xl border border-white/10 divide-y divide-white/5">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/5 ${action.color}`}>
                <action.icon size={20} />
              </div>
              <span className="text-white/80 font-medium group-hover:text-white transition-colors">
                {action.label}
              </span>
            </div>
            <ChevronRight
              size={18}
              className="text-white/20 group-hover:text-white/40 transition-colors"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
