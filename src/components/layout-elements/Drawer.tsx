'use client';
import { twMerge } from 'tailwind-merge';
import { useAppDispatch, useAppSelector } from '@/lib/rtk/hooks';
import { closeDrawer, selectDrawerOpen } from '@/lib/rtk/features/layout.slice';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { type Route, routes } from '@/constants/routes';
import {
  ArrowLeftRight,
  Bell,
  CircleQuestionMark,
  Globe,
  Settings,
  UserRound,
  UserRoundPlus,
  X,
} from 'lucide-react';
import { type ReactNode, useEffect } from 'react';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Avatar } from '@/components/shared/user-elements/Avatar';
import { Button } from '@/components/shared/buttons/Button';

export interface DrawerItem {
  route: Route;
  title: string;
  icon: ReactNode;
}

export function Drawer() {
  const t = useAppTranslations();
  const open = useAppSelector(selectDrawerOpen);
  const dispatch = useAppDispatch();

  const handleDrawerClose = () => {
    dispatch(closeDrawer());
  };

  useEffect(() => {
    if (!open && typeof document !== 'undefined') {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    }
  }, [open]);

  useEffect(() => {
    return () => {
      handleDrawerClose();
    };
  }, []);

  const drawerItems: DrawerItem[] = [
    {
      route: routes.profile,
      title: t('profile'),
      icon: <UserRound />,
    },
    {
      route: routes.inviteFriends,
      title: t('invite friends'),
      icon: <UserRoundPlus />,
    },
    {
      route: routes.notifications,
      title: t('notifications'),
      icon: <Bell />,
    },
    {
      route: routes.exchange,
      title: t('exchange'),
      icon: <ArrowLeftRight />,
    },
    {
      route: routes.support.index,
      title: t('support'),
      icon: <CircleQuestionMark />,
    },
    {
      route: routes.settings.index,
      title: t('settings'),
      icon: <Settings />,
    },
    {
      route: routes.languages,
      title: t('languages'),
      icon: <Globe />,
    },
  ] as const;

  const tabIndex = open ? 100 : -1;
  return (
    <ClientPortal>
      <div
        aria-hidden={open ? 'false' : 'true'}
        inert={!open ? true : undefined}
        className={twMerge('fixed inset-0 z-60', !open && 'pointer-events-none')}
      >
        {/*Overlay*/}
        <div
          className={twMerge(
            'absolute inset-0 transition-opacity duration-300 bg-fade',
            open ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={handleDrawerClose}
        />

        {/*Drawer*/}
        <div
          className={twMerge(
            'flex-col-stretch fixed top-0 bottom-0 right-0 px-6 pt-30 pb-7.5 w-[50vw] bg-background-overlay transition-all duration-300 rounded-l-4xl z-1]',
            open ? 'right-0' : '-right-[50vw]'
          )}
        >
          <Button
            tabIndex={tabIndex}
            onClick={handleDrawerClose}
            variant="transparent"
            className="absolute p-1 top-5 right-5"
          >
            <X />
          </Button>
          <Avatar shadow />
          <div className="flex flex-col mt-20 overflow-y-auto">
            {drawerItems.map(({ route, title, icon }) => (
              <Link
                tabIndex={tabIndex}
                className="flex items-center gap-2 py-2.5 m-px px-2"
                key={route}
                href={route}
              >
                <span>{icon}</span>
                <span className="font-normal truncate">{title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ClientPortal>
  );
}
