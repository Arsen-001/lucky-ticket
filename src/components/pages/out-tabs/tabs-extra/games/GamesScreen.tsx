'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useFeature } from '@/hooks/useFeature';
import { GameCard } from '@/components/pages/out-tabs/tabs-extra/games/GameCard';
import { useGetDuelLobbiesQuery } from '@/api/duel.api';
import { tikkiImages } from '@/components/shared/tikki/tikki.images';
import { routes } from '@/constants/routes';
import { openDuelTables } from '@/utils/global/duel.utils';

/**
 * Раздел «Игры» — витрина, и только она.
 *
 * Здесь не играют: карточка ведёт в игру, а игра живёт своим адресом. Так
 * «назад» возвращает к выбору, а не выбрасывает из раздела, и ссылка на дуэль
 * из приглашения открывает сразу её.
 *
 * Последняя карточка — заглушка следующей игры. Она стоит намеренно: пустая
 * витрина из одного пункта выглядит недоделанной, а «скоро» здесь честное —
 * сетку мы действительно строим следующей.
 *
 * 🔴 Тикки обязан быть здесь, хотя он же стоит на главной. С его экрана левая
 * пилюля ведёт ровно сюда, и до 05.09.2026 она приводила в комнату, где при
 * закрытой дуэли не было ничего, кроме «скоро»: раздел «Игры» не знал самой
 * живой игры платформы.
 */
export function GamesScreen() {
  const t = useAppTranslations();
  const duelOpen = useFeature('duel');
  const tikkiOpen = useFeature('tikkiClicker');
  // Сколько столов ждёт соперника прямо сейчас. Тот же запрос, что у самой
  // игры, — переход в дуэль отдаётся из кеша, лишнего похода нет.
  const { data: duel } = useGetDuelLobbiesQuery(undefined, { skip: !duelOpen });
  const tables = openDuelTables(duel);

  return (
    <div className="flex min-h-full flex-col gap-3 pt-1 pb-4">
      {tikkiOpen && (
        <GameCard
          eager
          href={routes.tikki}
          title={t('tikki')}
          subtitle={t('games tikki blurb')}
          tokens={[
            tikkiImages.bronze.idle.src,
            tikkiImages.gold.idle.src,
            tikkiImages.diamond.idle.src,
          ]}
        />
      )}

      {duelOpen && (
        <GameCard
          eager={!tikkiOpen}
          href={routes.games.duel}
          title={t('duel')}
          subtitle={t('games duel blurb')}
          badge={tables > 0 ? t('duel tables open', { count: tables }) : undefined}
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
