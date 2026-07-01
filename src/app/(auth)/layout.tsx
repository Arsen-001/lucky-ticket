'use client';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';
import { GlobalConstants } from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import { isTelegramEnv } from '@/lib/telegram/telegram';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({ children }: ChildrenProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Inside Telegram the session is authenticated on boot — the email-auth
  // screens don't apply, so bounce any stray navigation back to the app.
  useEffect(() => {
    if (isTelegramEnv()) router.replace(routes.home);
  }, [router]);

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
