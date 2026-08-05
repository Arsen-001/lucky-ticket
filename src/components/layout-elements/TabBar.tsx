'use client';
import { twMerge } from 'tailwind-merge';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { type ReactElement, type ReactNode, useEffect, useState, useTransition } from 'react';
import { TabBarItem } from '@/components/layout-elements/TabBarItem';
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
  return (
    <div
      className={twMerge(
        // The bar is a ticket strip: `tab-bar-ticket` punches the notched tear
        // edge along its top, and clips everything inside it to that shape.
        'bg-header tab-bar-ticket relative flex items-stretch justify-between overflow-hidden animate-fade-in',
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
      {/* The tear line printed across the strip, right under the notches. */}
      <span aria-hidden className="tab-bar-tear absolute top-1.5 right-0 left-0 h-px" />
      {tabs.map(({ route, icon, name }, index) => (
        <TabBarItem
          key={route}
          icon={icon as ReactElement<LucideProps>}
          name={name}
          onClick={() => handleTabClick(route)}
          active={activeRoute === route}
          perforated={index > 0}
          flightTarget={route === routes.tickets.index ? 'tickets' : undefined}
          className="relative z-1 animate-slide-in-bottom"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}
