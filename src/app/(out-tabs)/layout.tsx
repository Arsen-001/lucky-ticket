import React from 'react';

export default function Layout({
  children,
  header,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
}) {
  return (
    <div className="h-full w-full flex-col-stretch overflow-hidden">
      {header}
      <div className="flex-available inset-container-background overflow-hidden flex-col-stretch">
        <div className="pt-3 px-5 pb-10 flex-available overflow-auto scrollbar-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
