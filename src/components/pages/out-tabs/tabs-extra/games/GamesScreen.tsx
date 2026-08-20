'use client';

import { useState } from 'react';
import { Dices, Swords } from 'lucide-react';
import { useGetRouletteQuery } from '@/api/roulette.api';
import { FriendsRouletteCard } from '@/components/pages/out-tabs/drawer/invite-friends/roulette/FriendsRouletteCard';
import { DuelScreen } from '@/components/pages/out-tabs/tabs-extra/duel/DuelScreen';
import { GameTab } from '@/components/pages/out-tabs/tabs-extra/games/GameTab';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useFeature } from '@/hooks/useFeature';

type GameKey = 'duel' | 'roulette';

/**
 * Раздел «Игры»: дуэль и рулетка за друзей.
 *
 * Игры выбираются крупными плитками, а не строкой вкладок — это разные игры со
 * своими правилами, а не разделы одного экрана.
 *
 * Закрытой игры здесь нет вовсе: ни замка, ни «скоро». Стадия выката ничего не
 * обещает — сегодня тестерам, завтра всем, — а замок обещает срок. Открыта
 * одна игра — плиток нет совсем, экран сразу показывает её.
 */
export function GamesScreen() {
  const t = useAppTranslations();
  const duelOpen = useFeature('duel');
  // Рулетка отвечает одним словом на три разные причины «нельзя» (игра
  // выключена, подарок уже забран, нет сессии) — экрану хватает этого слова.
  const { data: roulette, isLoading } = useGetRouletteQuery();
  const rouletteOpen = roulette?.available === true;

  const [active, setActive] = useState<GameKey>('duel');
  const shown: GameKey = !duelOpen && rouletteOpen ? 'roulette' : active;

  if (isLoading) {
    return (
      <div className="flex-available flex-col-stretch gap-3 px-4 pt-2">
        <div className="h-24 w-full animate-pulse rounded-3xl bg-white/5" />
        <div className="h-56 w-full animate-pulse rounded-3xl bg-white/5" />
      </div>
    );
  }

  if (!duelOpen && !rouletteOpen) {
    return (
      <p className="flex-available flex-center text-disabled px-6 text-center text-sm">
        {t('games none open')}
      </p>
    );
  }

  return (
    <div className="flex-col-stretch flex-available gap-4 pt-2 pb-6">
      {duelOpen && rouletteOpen && (
        <div className="grid grid-cols-2 gap-3 px-4">
          <GameTab
            title={t('duel')}
            subtitle={t('games duel blurb')}
            icon={<Swords size={20} />}
            active={shown === 'duel'}
            onClick={() => setActive('duel')}
          />
          <GameTab
            title={t('roulette title')}
            subtitle={t('games roulette blurb')}
            icon={<Dices size={20} />}
            active={shown === 'roulette'}
            onClick={() => setActive('roulette')}
          />
        </div>
      )}

      {shown === 'duel' ? (
        <DuelScreen />
      ) : (
        <div className="px-4">
          <FriendsRouletteCard />
        </div>
      )}
    </div>
  );
}
