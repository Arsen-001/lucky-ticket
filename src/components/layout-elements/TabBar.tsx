'use client';
import { twMerge } from 'tailwind-merge';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { type ReactNode } from 'react';
import { TabBarItem } from '@/components/layout-elements/TabBarItem';
import { type Route, routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { ChartNoAxesColumnIncreasing, FileText, House, Trophy, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocation } from '@/hooks/useLocation';

export type Tab = {
  route: Route;
  icon: ReactNode;
  name: string;
};

export function TabBar({ className }: ClassNameProps) {
  const t = useAppTranslations();

  const location = useLocation();
  const router = useRouter();

  const activePath = location.getPathPart(1);

  const tabs: Tab[] = [
    {
      route: routes.leaderboard,
      icon: <ChartNoAxesColumnIncreasing />,
      name: t('leaderboard'),
    },
    {
      route: routes.tournaments,
      icon: <Trophy />,
      name: t('tournaments'),
    },
    {
      route: routes.home,
      icon: <House />,
      name: t('home'),
    },
    {
      route: routes.boosts,
      icon: <Zap />,
      name: t('boosts'),
    },
    {
      route: routes.tasks,
      icon: <FileText />,
      name: t('tasks'),
    },
  ] as const;

  const handleTabClick = (route: string) => {
    router.push(route);
  };
  return (
    <div
      className={twMerge('bg-tab-bar px-5 py-4 flex justify-between items-center gap-2', className)}
    >
      {tabs.map(({ route, icon, name }) => (
        <TabBarItem
          key={route}
          icon={icon}
          name={name}
          onClick={() => handleTabClick(route)}
          active={activePath === route}
        />
      ))}
    </div>
  );
}
