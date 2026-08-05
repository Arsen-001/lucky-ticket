'use client';
import { twMerge } from 'tailwind-merge';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { type ReactElement, type ReactNode, useEffect, useState, useTransition } from 'react';
import { TabBarItem } from '@/components/layout-elements/TabBarItem';
import { TabBarActiveDisc } from '@/components/layout-elements/TabBarActiveDisc';
import { TabBarCut } from '@/components/layout-elements/TabBarCut';
import { type Route, routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { FileText, House, type LucideProps, ShoppingBag, Ticket, Trophy } from 'lucide-react';
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
  const [, startTransition] = useTransition();

  // First path segment (e.g. "/market"). Drives the active tab once a
  // navigation has committed.
  const activePath = location.getPathPart(1);

  // Optimistic target: set the instant a tab is tapped so the chip moves
  // immediately, before the RSC navigation commits. Cleared as soon as the
  // real pathname catches up.
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  useEffect(() => {
    setPendingRoute(null);
  }, [activePath]);

  // The tab bar is always mounted, so warm the RSC payload of every tab up
  // front — a tap then commits from cache instead of a cold round-trip.
  // (router.prefetch is a no-op in dev; only effective in production builds.)
  useEffect(() => {
    const tabRoutes = [
      routes.tickets.index,
      routes.tournaments.index,
      routes.home,
      routes.market(),
      routes.tasks,
    ];
    tabRoutes.forEach(route => router.prefetch(route));
  }, [router]);

  const activeRoute = pendingRoute ?? activePath;

  const tabs: Tab[] = [
    {
      route: routes.tickets.index,
      icon: <Ticket />,
      name: t('tickets'),
    },
    {
      route: routes.tournaments.index,
      icon: <Trophy />,
      name: t('tournaments'),
    },
    {
      route: routes.home,
      icon: <House />,
      name: t('home'),
    },
    {
      route: routes.market(),
      icon: <ShoppingBag />,
      name: t('market'),
    },
    {
      route: routes.tasks,
      icon: <FileText />,
      name: t('tasks'),
    },
  ] as const;

  const handleTabClick = (route: string) => {
    if (route === activeRoute) return;
    // Move the chip immediately (optimistic), then run the actual navigation
    // as a transition so the current page stays interactive while it commits.
    setPendingRoute(route);
    startTransition(() => {
      router.push(route);
    });
  };
  // The column the disc stands on. -1 while a route outside the five is showing,
  // and then there is no disc to draw at all.
  const activeIndex = tabs.findIndex(({ route }) => route === activeRoute);

  // Centre of the active column. The five are equal fifths of the bar, which is
  // what lets the hole, the disc and the row agree on one number.
  const centre = activeIndex >= 0 ? (activeIndex + 0.5) * (100 / tabs.length) : null;

  return (
    <div
      className={twMerge(
        // The bar paints nothing itself: `TabBarCut` lays the surface with a
        // hole in it, and the disc hangs above the top edge, so nothing here
        // may clip its children.
        'relative flex items-end justify-between pt-3 animate-fade-in',
        className
      )}
      // Ease the bottom inset as Telegram settles it on open (see Header).
      style={{
        // Keeps the bar at its old 74px: the row sits high so the label stays
        // under the disc, and the height it gives back goes below the labels.
        paddingBottom: 'calc(23px + var(--tg-inset-bottom))',
        transition: 'padding-bottom 220ms ease-out',
        // Own compositor layer — see Header: fixed bars flicker in WKWebView
        // during heavy content relayouts without this.
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <TabBarCut centre={centre} />
      {tabs.map(({ route, icon, name }, index) => (
        <TabBarItem
          key={route}
          icon={icon as ReactElement<LucideProps>}
          name={name}
          onClick={() => handleTabClick(route)}
          active={activeRoute === route}
          flightTarget={route === routes.tickets.index ? 'tickets' : undefined}
          className="relative z-1 animate-slide-in-bottom"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        />
      ))}
      {centre !== null && (
        <TabBarActiveDisc
          icon={tabs[activeIndex].icon as ReactElement<LucideProps>}
          iconKey={tabs[activeIndex].route}
          className="animate-fade-in"
          style={{
            // Centred on the bar's own top edge: half of the disc stands above
            // the bar, half sits in the hole cut for it.
            left: `calc(${centre}% - 1.75rem)`,
            top: '-1.75rem',
            transition: 'left 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      )}
    </div>
  );
}
