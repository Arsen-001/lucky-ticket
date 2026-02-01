import type { ReactNode } from 'react';

export default function Layout({ children, header }: { children: ReactNode; header: ReactNode }) {
  return (
    <div className="h-full w-full flex-col-stretch overflow-hidden">
      {header}
      <div className="flex-available inset-container-background overflow-hidden flex-col-stretch">
        <div className="pt-3 px-5 pb-10 flex-available overflow-auto scrollbar-hidden animate-slide-in-bottom">
          {children}
        </div>
      </div>
    </div>
  );
}
