'use client';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';
import { GlobalConstants } from '@/constants/global.constants';
import { usePathname } from 'next/navigation';

export default function AuthLayout({ children }: ChildrenProps) {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl text-center p-12 font-semibold animate-fade-in">
        {GlobalConstants.projectName}
      </h1>
      <div
        key={pathname}
        className="bg-purple-gradient flex-1  rounded-t-[40px] p-7 animate-slide-in-bottom"
      >
        {children}
      </div>
    </div>
  );
}
