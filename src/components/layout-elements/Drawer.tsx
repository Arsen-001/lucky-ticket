'use client';

import { type ReactNode, useEffect } from 'react';
import Image from 'next/image';
import {
  Bell,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  CircleQuestionMark,
  Globe,
  Layers,
  Menu,
  Settings,
  UserRound,
  UserRoundPlus,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { useGetMeQuery } from '@/api/me.api';
import { useGetNotificationsQuery } from '@/api/notifications.api';
import { useGetStakesQuery } from '@/api/stakes.api';
import { isStakeReady } from '@/utils/global/stakes.utils';
import { Avatar } from '@/components/shared/user-elements/Avatar';
import { Button } from '@/components/shared/buttons/Button';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { Link } from '@/components/shared/links/Link';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { GlobalConstants } from '@/constants/global.constants';
import { icons } from '@/constants/icons';
import { type Route, routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useLocation } from '@/hooks/useLocation';
import { closeDrawer, selectDrawerOpen } from '@/lib/rtk/features/layout.slice';
import { useAppDispatch, useAppSelector } from '@/lib/rtk/hooks';

interface DrawerItem {
  route: Route;
  title: string;
  icon: ReactNode;
  badge?: number;
}

interface DrawerSection {
  label: string;
  items: DrawerItem[];
}

export function Drawer() {
  const t = useAppTranslations();
  const open = useAppSelector(selectDrawerOpen);
  const dispatch = useAppDispatch();
  const { data: me, isLoading } = useGetMeQuery();
  const { data: notifications } = useGetNotificationsQuery();
  const { data: stakesData } = useGetStakesQuery();
  const location = useLocation();
  const activePath = location.getPathPart(1);

  const unreadCount = notifications?.filter(n => !n.read).length ?? 0;
  const claimableStakesCount =
    stakesData?.activeStakes.filter(s => !s.claimed && isStakeReady(s.endDate)).length ?? 0;

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

  useEffect(
    () => () => {
      handleDrawerClose();
    },
    []
  );

  const sections: DrawerSection[] = [
    {
      label: t('account'),
      items: [
        { route: routes.profile.index, title: t('profile'), icon: <UserRound size={18} /> },
        {
          route: routes.notifications,
          title: t('notifications'),
          icon: <Bell size={18} />,
          badge: unreadCount,
        },
        { route: routes.settings.index, title: t('settings'), icon: <Settings size={18} /> },
      ],
    },
    {
      label: t('activity'),
      items: [
        { route: routes.wallet, title: t('wallet'), icon: <Wallet size={18} /> },
        {
          route: routes.stakes.index,
          title: t('stakes'),
          icon: <Layers size={18} />,
          badge: claimableStakesCount,
        },
        {
          route: routes.leaderboard,
          title: t('leaderboard'),
          icon: <ChartNoAxesColumnIncreasing size={18} />,
        },
      ],
    },
    {
      label: t('earn'),
      items: [
        {
          route: routes.inviteFriends,
          title: t('friends'),
          icon: <UserRoundPlus size={18} />,
        },
      ],
    },
    {
      label: t('help'),
      items: [
        {
          route: routes.support.index,
          title: t('support'),
          icon: <CircleQuestionMark size={18} />,
        },
        { route: routes.languages, title: t('languages'), icon: <Globe size={18} /> },
      ],
    },
  ];

  const isItemActive = (route: Route) => {
    if (typeof route !== 'string') return false;
    if (route === '/') return activePath === '';
    const root = route.split('/')[1];
    return !!root && activePath === root;
  };

  const tabIndex = open ? 0 : -1;

  return (
    <ClientPortal>
      <div
        aria-hidden={open ? 'false' : 'true'}
        inert={!open ? true : undefined}
        className={twMerge('fixed inset-0 z-60', !open && 'pointer-events-none')}
      >
        <div
          className={twMerge(
            'bg-fade absolute inset-0 transition-opacity duration-300',
            open ? 'opacity-100' : 'pointer-events-none opacity-0'
          )}
          onClick={handleDrawerClose}
        />

        <aside
          className={twMerge(
            'bg-background-overlay fixed bottom-0 right-0 top-0 z-1 flex w-[78vw] max-w-[340px] flex-col rounded-l-3xl shadow-[-12px_0_40px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out',
            open ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <span className="text-pink-secondary inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
              <Menu size={14} strokeWidth={2.4} />
              {t('more')}
            </span>
            <Button
              tabIndex={tabIndex}
              onClick={handleDrawerClose}
              variant="transparent"
              aria-label={t('close')}
              className="p-1.5"
            >
              <X size={20} />
            </Button>
          </div>

          <Link
            href={routes.profile.index}
            tabIndex={tabIndex}
            onClick={handleDrawerClose}
            className="card-outlined bg-purple-gradient mx-5 flex items-center gap-3 rounded-2xl p-3 transition-transform active:scale-99"
          >
            <div className="relative h-14 w-14 flex-shrink-0">
              <Avatar shadow size={56} className="h-14 w-14" />
              {me?.isVIP && (
                <span
                  className="bg-pink-gradient border-background-overlay absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 text-[9px] font-extrabold text-white"
                  title={`VIP ${me.vipLevel}`}
                >
                  {me.vipLevel}
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <SkeletonSuspense
                loading={isLoading}
                skeleton={<Skeleton variant="line" className="h-4 w-28" />}
              >
                <span className="truncate text-sm font-bold text-white">{me?.username}</span>
                <span className="text-pink-secondary text-[11px] font-semibold">
                  {t('view profile')}
                </span>
              </SkeletonSuspense>
            </div>
            <ChevronRight className="text-pink-secondary flex-shrink-0" size={18} />
          </Link>

          <div className="mx-5 mt-3 grid grid-cols-3 gap-1.5">
            <BalancePill
              loading={isLoading}
              icon={<Zap className="fill-gold text-gold" size={11} strokeWidth={2.4} />}
              value={me?.activityPoints?.toLocaleString() ?? 0}
              label={t('ap')}
            />
            <BalancePill
              loading={isLoading}
              icon={<Image src={icons.coin} alt="" width={12} height={12} />}
              value={me?.coins?.toLocaleString() ?? 0}
              label={GlobalConstants.coinName}
            />
            <BalancePill
              loading={isLoading}
              icon={<Image src={icons.telegramStar} alt="" width={12} height={12} />}
              value={me?.telegramStars ?? 0}
              label={t('stars')}
            />
          </div>

          <nav className="scrollbar-hidden mt-4 flex-1 overflow-y-auto px-3 pb-6">
            {sections.map(section => (
              <div key={section.label} className="mb-3">
                <div className="text-pink-secondary px-2 pb-1 text-[10px] font-bold uppercase tracking-wider">
                  {section.label}
                </div>
                <ul className="flex flex-col">
                  {section.items.map(({ route, title, icon, badge }) => {
                    const active = isItemActive(route);
                    return (
                      <li key={route}>
                        <Link
                          href={route}
                          tabIndex={tabIndex}
                          onClick={handleDrawerClose}
                          className={twMerge(
                            'group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors',
                            active
                              ? 'bg-electric-pink/15 text-white'
                              : 'text-white-secondary hover:bg-white/5 hover:text-white'
                          )}
                        >
                          <span
                            className={twMerge(
                              'flex-center relative h-8 w-8 flex-shrink-0 rounded-lg transition-colors',
                              active
                                ? 'bg-electric-pink/30 text-white'
                                : 'bg-white/5 text-white-secondary group-hover:bg-white/10'
                            )}
                          >
                            {icon}
                            {!!badge && badge > 0 && (
                              <span
                                aria-hidden
                                className="bg-electric-pink absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full"
                                style={{ boxShadow: '0 0 6px rgba(222,0,155,0.85)' }}
                              />
                            )}
                          </span>
                          <span className="flex-1 truncate text-sm font-semibold">{title}</span>
                          {!!badge && badge > 0 && (
                            <span className="bg-electric-pink/20 text-electric-pink min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-extrabold tabular-nums">
                              {badge > 99 ? '99+' : badge}
                            </span>
                          )}
                          <ChevronRight
                            size={16}
                            className={twMerge(
                              'flex-shrink-0 transition-transform',
                              active ? 'text-electric-pink' : 'text-pink-secondary'
                            )}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="border-t border-white/5 px-5 py-3">
            <span className="text-pink-secondary text-[10px] font-semibold tracking-wider">
              {GlobalConstants.projectName}
            </span>
          </div>
        </aside>
      </div>
    </ClientPortal>
  );
}

interface BalancePillProps {
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
  loading?: boolean;
}

function BalancePill({ icon, value, label, loading }: BalancePillProps) {
  return (
    <div className="bg-electric-pink/12 flex flex-col items-center gap-0.5 rounded-xl border border-white/5 py-2">
      <div className="flex items-center gap-1">
        {icon}
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" className="h-3 w-6" />}
        >
          <span className="text-xs font-extrabold tabular-nums text-white">{value}</span>
        </SkeletonSuspense>
      </div>
      <span className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
