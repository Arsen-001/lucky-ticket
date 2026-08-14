'use client';

import { Header } from '@/components/layout-elements/Header';
import { TabBar } from '@/components/layout-elements/TabBar';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';
import { Drawer } from '@/components/layout-elements/Drawer';
import { NotificationAutoSurface } from '@/components/layout-elements/NotificationAutoSurface';
import { DailyGiftAutoSurface } from '@/components/layout-elements/DailyGiftAutoSurface';
import { usePathname } from 'next/navigation';

export default function TabsLayout({ children }: ChildrenProps) {
  const pathname = usePathname();

  return (
    <>
      <Header className="fixed top-0 start-[var(--app-gutter)] end-[var(--app-gutter)] z-50 shadow-xs" />
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
        <div className="h-full overflow-hidden scroll-fade-top-background">
          <div
            key={pathname}
            className="h-full overflow-auto scrollbar-hidden flex-col-stretch animate-fade-in animate-slide-in-bottom"
          >
            {children}
          </div>
        </div>
      </main>
      <TabBar className="fixed bottom-0 start-[var(--app-gutter)] end-[var(--app-gutter)] z-50" />
      <Drawer />
      <NotificationAutoSurface />
      <DailyGiftAutoSurface />
    </>
  );
}
