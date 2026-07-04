'use client';

import { Header } from '@/components/layout-elements/Header';
import { TabBar } from '@/components/layout-elements/TabBar';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';
import { Drawer } from '@/components/layout-elements/Drawer';
import { NotificationAutoSurface } from '@/components/layout-elements/NotificationAutoSurface';
import { usePathname } from 'next/navigation';

export default function TabsLayout({ children }: ChildrenProps) {
  const pathname = usePathname();

  return (
    <>
      <Header className="fixed top-0 left-0 right-0 z-50 shadow-xs" />
      <main
        className="h-full"
        style={{
          // Match the header/tab-bar heights, both grown by the Telegram insets.
          paddingTop: 'calc(5rem + var(--tg-inset-top))',
          paddingBottom: 'calc(5rem + var(--tg-inset-bottom))',
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
      <TabBar className="fixed bottom-0 left-0 right-0 z-50  shadow-xs" />
      <Drawer />
      <NotificationAutoSurface />
    </>
  );
}
