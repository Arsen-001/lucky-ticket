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
import { staggerMs } from '@/utils/global/animation.utils';
import { useClaimableTasks } from '@/hooks/useClaimableTasks';

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

  // The one thing the bar says beyond "where am I": there is a reward waiting
  // behind the Tasks tab. Without it the daily rewards are only ever found by
  // players who go looking for them. `claimRoute` is the same mark's other
  // half — it lands on the frequency tab the reward is actually on.
  const { hasAny: hasClaimableTasks, route: claimRoute } = useClaimableTasks();

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
      // Its own key, not `tournaments`: the English word does not fit a fifth
      // of the bar at this size, while the page heading still wants it in full.
      name: t('tournaments tab'),
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

  // `href` may carry a query the tab identity must not: the disc is placed by
  // matching `route` against the five, and `/tasks?frequency=once` matches none
  // of them — the chip would vanish for the whole navigation.
  const handleTabClick = (route: string, href: string = route) => {
    if (route === activeRoute) return;
    // Move the chip immediately (optimistic), then run the actual navigation
    // as a transition so the current page stays interactive while it commits.
    setPendingRoute(route);
    startTransition(() => {
      router.push(href);
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
          onClick={() => handleTabClick(route, route === routes.tasks ? claimRoute : route)}
          active={activeRoute === route}
          claimable={route === routes.tasks && hasClaimableTasks}
          claimableLabel={t('something to claim')}
          flightTarget={route === routes.tickets.index ? 'tickets' : undefined}
          className="relative z-1 animate-slide-in-bottom"
          style={{
            animationDelay: `${staggerMs(index, 100)}ms`,
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
            //
            // Offset from the INLINE start, not from the left: `centre` counts
            // columns in tab order, and Arabic and Persian lay that row out from
            // the right. As a plain `left` the disc parked over the mirror image
            // of the active tab — the fifth tab lit up while the first was open.
            insetInlineStart: `calc(${centre}% - 1.75rem)`,
            top: '-1.75rem',
            transition: 'inset-inline-start 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      )}
    </div>
  );
}
