import type { ReactNode } from 'react';
import { projectName } from '@/constants/global.constants';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl text-center p-12 font-semibold">{projectName}</h1>
      <div className="bg-purple-gradient flex-1  rounded-t-[40px] p-7">
        {children}
      </div>
    </div>
  );
}
