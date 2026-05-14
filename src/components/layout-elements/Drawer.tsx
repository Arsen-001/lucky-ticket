'use client';

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Bell,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  CircleQuestionMark,
  Globe,
  Layers,
  Package,
  Settings,
  UserRoundPlus,
  Wallet,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { useGetMeQuery } from '@/api/me.api';
import { useGetNotificationsQuery } from '@/api/notifications.api';
import { useGetStakesQuery } from '@/api/stakes.api';
import { isStakeReady } from '@/utils/global/stakes.utils';
import { Avatar } from '@/components/shared/user-elements/Avatar';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { DrawerItem } from '@/components/layout-elements/DrawerItem';
import { Link } from '@/components/shared/links/Link';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { type Route, routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useLocation } from '@/hooks/useLocation';
import { closeDrawer, selectDrawerOpen } from '@/lib/rtk/features/layout.slice';
import { useAppDispatch, useAppSelector } from '@/lib/rtk/hooks';
import '@/styles/components/drawer.css';

const SWIPE_CLOSE_THRESHOLD_PX = 80;

interface DrawerSectionItem {
  route: Route;
  title: string;
  icon: ReactNode;
  badge?: number;
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

  const asideRef = useRef<HTMLElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swipeAxis = useRef<'none' | 'horizontal' | 'vertical'>('none');
  const [swipeDelta, setSwipeDelta] = useState(0);

  const handlePointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    swipeStart.current = { x: e.clientX, y: e.clientY };
    swipeAxis.current = 'none';
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!swipeStart.current) return;
    const dx = e.clientX - swipeStart.current.x;
    const dy = e.clientY - swipeStart.current.y;

    if (swipeAxis.current === 'none') {
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (absX < 8 && absY < 8) return;
      swipeAxis.current = absX > absY ? 'horizontal' : 'vertical';
    }

    if (swipeAxis.current === 'vertical') return;
    setSwipeDelta(Math.max(0, dx));
  };

  const handlePointerEnd = (e: ReactPointerEvent<HTMLElement>) => {
    if (!swipeStart.current) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      return;
    }
    const shouldClose =
      swipeAxis.current === 'horizontal' && swipeDelta >= SWIPE_CLOSE_THRESHOLD_PX;
    swipeStart.current = null;
    swipeAxis.current = 'none';
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (shouldClose) {
      handleDrawerClose();
      // delta is reset by the [open] effect after redux flips, which keeps
      // the inline transform stable until then so the close animates from
      // the current swipe position rather than snapping back.
    } else {
      setSwipeDelta(0);
    }
  };

  useEffect(() => {
    if (!open) setSwipeDelta(0);
  }, [open]);

  // Lock body scroll while open; restore previous overflow on close.
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Close on Escape + focus-trap Tab cycling within the aside while open.
  useEffect(() => {
    if (!open) return;
    const aside = asideRef.current;
    if (!aside || typeof document === 'undefined') return;

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () => Array.from(aside.querySelectorAll<HTMLElement>(focusableSelector));

    const initial = getFocusable()[0];
    initial?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleDrawerClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (active && !aside.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Blur active element on close to release stale focus.
  useEffect(() => {
    if (!open && typeof document !== 'undefined') {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    }
  }, [open]);

  useEffect(
    () => () => {
      dispatch(closeDrawer());
    },
    [dispatch]
  );

  const items: DrawerSectionItem[] = [
    { route: routes.wallet, title: t('wallet'), icon: <Wallet size={18} /> },
    {
      route: routes.inventory,
      title: t('boost inventory'),
      icon: <Package size={18} />,
    },
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
    {
      route: routes.inviteFriends,
      title: t('friends'),
      icon: <UserRoundPlus size={18} />,
    },
    {
      route: routes.notifications,
      title: t('notifications'),
      icon: <Bell size={18} />,
      badge: unreadCount,
    },
    { route: routes.settings.index, title: t('settings'), icon: <Settings size={18} /> },
    {
      route: routes.support.index,
      title: t('support'),
      icon: <CircleQuestionMark size={18} />,
    },
    { route: routes.languages, title: t('languages'), icon: <Globe size={18} /> },
  ];

  const isItemActive = (route: Route) => {
    if (typeof route !== 'string') return false;
    return activePath === route;
  };

  const tabIndex = open ? 0 : -1;

  return (
    <ClientPortal>
      <div
        aria-hidden={!open}
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
          ref={asideRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          style={
            swipeDelta > 0
              ? ({
                  transform: `translateX(${swipeDelta}px)`,
                  transition: 'none',
                } satisfies CSSProperties)
              : undefined
          }
          className={twMerge(
            'bg-background-overlay fixed bottom-0 right-0 top-0 z-1 flex w-[78vw] max-w-[340px] flex-col rounded-l-3xl shadow-[-12px_0_40px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out touch-pan-y',
            open ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <Link
            href={routes.profile.index}
            tabIndex={tabIndex}
            onClick={handleDrawerClose}
            className="bg-background-overlay relative mx-3 mt-5 flex items-center gap-3 overflow-hidden rounded-2xl px-2.5 py-3 transition-transform active:scale-99"
          >
            <div className="relative h-14 w-14 flex-shrink-0">
              <Avatar shadow size={56} />
              {me?.isVIP && (
                <span
                  className="bg-pink-gradient border-background-overlay absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 text-[9px] font-extrabold text-white"
                  aria-label={t('vip level', { level: me.vipLevel })}
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
            <ChevronRight className="text-pink-secondary flex-shrink-0" size={16} />
          </Link>

          <div aria-hidden className="drawer-divider mx-3 mt-4" />

          <nav className="scrollbar-hidden mt-2 flex-1 overflow-y-auto px-3 pb-2">
            <ul className="flex flex-col">
              {items.map(item => (
                <DrawerItem
                  key={String(item.route)}
                  route={item.route}
                  title={item.title}
                  icon={item.icon}
                  badge={item.badge}
                  active={isItemActive(item.route)}
                  tabIndex={tabIndex}
                  onNavigate={handleDrawerClose}
                />
              ))}
            </ul>
          </nav>

          <div aria-hidden className="drawer-divider mx-3 mb-3" />

          <div className="bg-background-overlay relative mx-3 mb-5 flex flex-col items-center gap-0.5 overflow-hidden rounded-2xl px-4 py-3">
            <span className="text-sm font-extrabold tracking-wide text-white">LuckyTicket365</span>
            <span className="text-pink-secondary text-[10px] font-semibold tracking-wider uppercase">
              {t('daily luck awaits')}
            </span>
          </div>
        </aside>
      </div>
    </ClientPortal>
  );
}
