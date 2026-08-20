'use client';

import { ChevronRight, Dices } from 'lucide-react';
import { useGetRouletteQuery } from '@/api/roulette.api';
import { Link } from '@/components/shared/links/Link';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';

/**
 * След рулетки на экране друзей: строка, а не второй барабан.
 *
 * Спин зарабатывается здесь — друзьями, — поэтому сказать о нём здесь нужно.
 * Но сам барабан живёт в разделе «Игры» в одном экземпляре: две живые копии
 * одной игры расходятся, и расходятся молча.
 */
export function FriendsRoulettePointerRow() {
  const t = useAppTranslations();
  const { data } = useGetRouletteQuery();

  if (!data?.available) return null;

  const ready = data.spinsAvailable > 0;

  return (
    <Link
      href={routes.games}
      style={{ backgroundColor: 'var(--color-background)' }}
      className="border-electric-pink/40 from-electric-pink/15 flex items-center gap-3 rounded-2xl border bg-gradient-to-r to-transparent p-3 transition-transform active:scale-[0.99]"
    >
      <span className="flex-center bg-electric-pink/20 h-9 w-9 shrink-0 rounded-xl text-white">
        <Dices size={18} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-extrabold leading-tight">
          {t('roulette title')}
        </span>
        <span className="text-pink-secondary truncate text-[11px] leading-tight">
          {ready
            ? t('roulette ready', { count: data.spinsAvailable })
            : t('roulette need friends', { count: data.friendsToNextSpin })}
        </span>
      </span>

      {ready && (
        <span className="bg-pink-gradient rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
          {t('games play')}
        </span>
      )}
      <ChevronRight size={18} className="text-pink-secondary shrink-0" />
    </Link>
  );
}
