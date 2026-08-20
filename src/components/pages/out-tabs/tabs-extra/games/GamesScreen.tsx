'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useFeature } from '@/hooks/useFeature';
import { GameCard } from '@/components/pages/out-tabs/tabs-extra/games/GameCard';
import { routes } from '@/constants/routes';

/**
 * Раздел «Игры» — витрина, и только она.
 *
 * Здесь не играют: карточка ведёт в игру, а игра живёт своим адресом. Так
 * «назад» возвращает к выбору, а не выбрасывает из раздела, и ссылка на дуэль
 * из приглашения открывает сразу её.
 *
 * Вторая карточка — заглушка следующей игры. Она стоит намеренно: пустая
 * витрина из одного пункта выглядит недоделанной, а «скоро» здесь честное —
 * сетку мы действительно строим следующей.
 */
export function GamesScreen() {
  const t = useAppTranslations();
  const duelOpen = useFeature('duel');

  return (
    <div className="flex min-h-full flex-col gap-3 pt-1 pb-4">
      {duelOpen && (
        <GameCard
          href={routes.games.duel}
          title={t('duel')}
          subtitle={t('games duel blurb')}
          tokens={[
            '/assets/icons/duel/rock.webp',
            '/assets/icons/tickets/bronze-ticket.webp',
            '/assets/icons/duel/scissors.webp',
          ]}
        />
      )}

      <GameCard soon title={t('games next title')} subtitle={t('games next blurb')} />
    </div>
  );
}
