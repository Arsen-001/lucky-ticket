'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export default function Layout({ children, header }: { children: ReactNode; header: ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      className="h-full w-full flex-col-stretch overflow-hidden"
      // Push the page header below Telegram's floating buttons in fullscreen.
      style={{ paddingTop: 'var(--tg-inset-top)' }}
    >
      {header}
      <div className="flex-available inset-container-background overflow-hidden flex-col-stretch">
        <div
          key={pathname}
          className="pt-3 px-5 flex-available overflow-auto scrollbar-hidden animate-slide-in-bottom"
          style={{ paddingBottom: 'calc(2.5rem + var(--tg-inset-bottom))' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
