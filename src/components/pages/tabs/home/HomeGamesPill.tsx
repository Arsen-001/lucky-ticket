'use client';

import { Gamepad2 } from 'lucide-react';
import { HomeScreenPill } from '@/components/pages/tabs/home/HomeScreenPill';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface HomeGamesPillProps {
  className?: string;
}

/**
 * «Игры» — левая пилюля нижнего ряда, одна на оба экрана главной.
 *
 * До 05.09.2026 второй экран (движки) вёл в игры отдельной плашкой в верхнем
 * ряду, справа от карточки тест-квеста, а первый — этой пилюлей слева внизу:
 * один и тот же вход в двух разных углах. Теперь вход один, и он в одном
 * месте на обоих экранах; плашка снята вместе со счётчиком открытых столов.
 */
export function HomeGamesPill({ className }: HomeGamesPillProps) {
  const t = useAppTranslations();

  return (
    <HomeScreenPill
      label={t('games')}
      href={routes.games.index}
      icon={<Gamepad2 size={17} aria-hidden />}
      className={className}
    />
  );
}
