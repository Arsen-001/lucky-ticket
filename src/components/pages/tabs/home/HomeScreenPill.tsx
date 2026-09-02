'use client';

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import type { Route } from '@/constants/routes';

export interface HomeScreenPillProps {
  label: string;
  icon: ReactNode;
  /** Ссылка — для перехода в другой раздел; иначе переключаем экран на месте. */
  href?: Route;
  onClick?: () => void;
  className?: string;
}

/**
 * Пилюля перехода на главной: слева «Игры», справа «Движки».
 *
 * Без обводки и без подложки-карточки — они стоят прямо на сцене, у самого
 * таб-бара, и любая рамка здесь читалась бы как ещё один ряд вкладок.
 */
export function HomeScreenPill({ label, icon, href, onClick, className }: HomeScreenPillProps) {
  const shape = twMerge(
    'flex h-[34px] items-center gap-1.5 rounded-full bg-white/8 px-3 text-[12px] font-bold',
    'backdrop-blur-sm focus-visible:outline-teal focus-visible:outline focus-visible:outline-2',
    className
  );

  if (href) {
    return (
      <Link href={href} className={shape}>
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={shape}>
      {icon}
      {label}
    </button>
  );
}
