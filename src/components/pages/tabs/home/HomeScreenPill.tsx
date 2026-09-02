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
  /** Слева иконка мельче, поэтому и поле слева больше — как в макете. */
  side?: 'left' | 'right';
  className?: string;
}

/**
 * Пилюля перехода на главной: слева «Игры», справа «Движки». 34 px ростом —
 * ровно как карточка коллекции над ней, чтобы низ экрана читался одной линией.
 *
 * Без обводки: она стоит прямо на сцене, у самого таб-бара, и любая рамка здесь
 * читалась бы как ещё один ряд вкладок. Держит её только тень под низом.
 */
export function HomeScreenPill({
  label,
  icon,
  href,
  onClick,
  side = 'right',
  className,
}: HomeScreenPillProps) {
  const shape = twMerge(
    'flex h-[34px] items-center gap-1.5 rounded-full',
    side === 'left' ? 'ps-2.5 pe-3' : 'ps-1.5 pe-3',
    'bg-[linear-gradient(150deg,#3a2350,#1c1a30)] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.9)]',
    'text-[11.5px] font-extrabold whitespace-nowrap text-white',
    'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2',
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
