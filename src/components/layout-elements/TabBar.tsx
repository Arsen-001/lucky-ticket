'use client';
import { twMerge } from 'tailwind-merge';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { type ReactElement, type ReactNode, useEffect, useState, useTransition } from 'react';
import { TabBarItem } from '@/components/layout-elements/TabBarItem';
import { TabBarActiveDisc } from '@/components/layout-elements/TabBarActiveDisc';
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

  return (
    <div
      className={twMerge(
        // The active tab is a raised disc that travels along the row and
        // overhangs the top edge, so the bar must not clip its own children.
        'bg-header relative flex items-end justify-between gap-1 px-3 pt-3 animate-fade-in',
        className
      )}
      // Ease the bottom inset as Telegram settles it on open (see Header).
      style={{
        paddingBottom: 'calc(1rem + var(--tg-inset-bottom))',
        transition: 'padding-bottom 220ms ease-out',
        // Own compositor layer — see Header: fixed bars flicker in WKWebView
        // during heavy content relayouts without this.
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_100%,rgba(222,0,155,0.08),transparent_60%),radial-gradient(120%_80%_at_100%_0%,rgba(248,189,62,0.06),transparent_55%)]"
      />
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
      {activeIndex >= 0 && (
        <TabBarActiveDisc
          icon={tabs[activeIndex].icon as ReactElement<LucideProps>}
          iconKey={tabs[activeIndex].route}
          className="animate-fade-in"
          style={{
            // One column wide, stepped along the row by whole columns: the five
            // are `flex-1` inside `px-3` with `gap-1`, so a column is a fifth of
            // what is left of the bar and a step is that plus one gap.
            left: '0.75rem',
            width: 'calc((100% - 2.5rem) / 5)',
            transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))`,
            // Stands on the row's label line: the bar's bottom padding, the
            // label, and the gap above it.
            bottom: 'calc(1rem + var(--tg-inset-bottom) + 0.875rem)',
            transition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1), bottom 220ms ease-out',
          }}
        />
      )}
    </div>
  );
}
