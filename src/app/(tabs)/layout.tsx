'use client';

import { Header } from '@/components/layout-elements/Header';
import { TabBar } from '@/components/layout-elements/TabBar';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';
import { Drawer } from '@/components/layout-elements/Drawer';
import { NotificationAutoSurface } from '@/components/layout-elements/NotificationAutoSurface';
import { AtmosphericBackground } from '@/components/shared/AtmosphericBackground';
import { routes } from '@/constants/routes';
import { usePathname } from 'next/navigation';

/** Tabs that get the key-art sky behind their content. */
const ATMOSPHERE_ROUTES: readonly string[] = [routes.home, routes.tickets.index];

export default function TabsLayout({ children }: ChildrenProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Lives here, outside the animated page wrapper: that wrapper keeps a
          transform after its entry animation, which would re-anchor a `fixed`
          child to it and make the backdrop scroll with the content. */}
      {ATMOSPHERE_ROUTES.includes(pathname) && (
        <AtmosphericBackground className="left-[var(--app-gutter)] right-[var(--app-gutter)]" />
      )}
      <Header className="fixed top-0 left-[var(--app-gutter)] right-[var(--app-gutter)] z-50 shadow-xs" />
      <main
        className="h-full"
        style={{
          // Match the header/tab-bar heights, both grown by the Telegram insets.
          paddingTop: 'calc(5rem + var(--tg-inset-top))',
          paddingBottom: 'calc(5rem + var(--tg-inset-bottom))',
          // Ease the padding as Telegram's insets settle on open — snapping in
          // lockstep with the header made the whole page appear to blink.
          transition: 'padding 220ms ease-out',
        }}
      >
        <div className="h-full overflow-hidden inset-container-background">
          <div
            key={pathname}
            className="h-full overflow-auto scrollbar-hidden flex-col-stretch animate-fade-in animate-slide-in-bottom"
          >
            {children}
          </div>
        </div>
      </main>
      <TabBar className="fixed bottom-0 left-[var(--app-gutter)] right-[var(--app-gutter)] z-50 shadow-xs" />
      <Drawer />
      <NotificationAutoSurface />
    </>
  );
}
