'use client';

import { useGetTopTournamentsQuery } from '@/api/tournaments.api';
import { HomeUpcomingTournaments } from '@/components/pages/tabs/home/HomeUpcomingTournaments';
import { LabSection } from './LabSection';
import { LabTournamentBoard } from './LabTournamentBoard';
import { LabTournamentHeroBlock } from './LabTournamentHeroBlock';
import { LabTournamentPosterStrip } from './LabTournamentPosterStrip';
import { LabTournamentTicketStrip } from './LabTournamentTicketStrip';
import { LabVariant } from './LabVariant';

/**
 * Home's tournament strip — the accepted design and the four options it beat.
 *
 * The data is the real `getTopTournaments` query, so every option stands in
 * front of the same upcoming tournaments the player sees on Home, with live
 * countdowns. The rejected four stay here on purpose: the decision was made by
 * comparing them side by side, and it can be revisited the same way.
 */
export function LabTournamentsSliderSection() {
  const { data: tournaments } = useGetTopTournamentsQuery();
  const items = tournaments ?? [];

  if (!items.length) return null;

  return (
    <LabSection
      title="Слайдер турниров на главной"
      bleed
      note="Было: одна карточка 256×64 в кадре, автопрокрутка каждые 2 секунды, соседи срезаны маской, порядок случайный, заголовка нет — чтобы увидеть все семь турниров, надо было простоять у экрана 14 секунд. Выбран гибрид A+C, он стоит на главной. Во всех вариантах: ближайший старт первым, автопрокрутки нет, над лентой заголовок со счётчиком и выходом в каталог."
    >
      <LabVariant
        bleed
        label="A+C · афиша-билет · ПРИНЯТ, стоит на главной"
        bet="Гибрид: пропорции A (вертикальная карточка, приз крупнейшим кеглем, медаль 60px) и форма C (низ карточки — оторванный корешок с отсчётом: два прокола по краям, пунктир между ними, тир заливает карточку сверху вниз вместо рамки). Это настоящий компонент главной, а не копия."
      >
        <HomeUpcomingTournaments />
      </LabVariant>

      <LabVariant
        bleed
        label="A · афиша"
        bet="Карточка встаёт вертикально: приз получает самый крупный кегль на ленте, медаль вырастает до 62px и читается как тир, а не как значок. В кадре 2,3 карточки — можно сравнивать, а не ждать. Внизу каждой — полоса обратного отсчёта во всю ширину."
      >
        <LabTournamentPosterStrip tournaments={items} />
      </LabVariant>

      <LabVariant
        bleed
        label="B · ближайший крупно + расписание"
        bet="Один турнир — тот, что стартует первым — занимает всю ширину и получает кнопку «Участвовать»: с главной наконец можно войти, а не только посмотреть. Остальные шесть стоят под ним фишками «медаль + приз»; нажатие меняет героя. Ничего не уезжает по таймеру."
      >
        <LabTournamentHeroBlock tournaments={items} />
      </LabVariant>

      <LabVariant
        bleed
        label="C · билет"
        bet="Та же строка, но вырезанная билетом: оторванный корешок с медалью, пунктир отрыва и два прокола, через которые видно фон. Тир красит корешок целиком, а не светится ниткой в 1px. В кадре полтора билета — и половинка читаемая: у соседа видно тир и название, а не срезанный отсчёт."
      >
        <LabTournamentTicketStrip tournaments={items} />
      </LabVariant>

      <LabVariant
        bleed
        label="D · табло вылетов · не карусель"
        bet="Ближайшие вылеты списком, сгруппированные по времени старта: турниры спавнятся пачками по часам, поэтому «18:00» и отсчёт стоят один раз на группу, а строки отданы тиру, названию и призу. Ничего не движется, все три читаются одновременно, остальные — по «Все 7» в заголовке. Цена: медали уменьшаются до 26px и витринность уходит почти совсем."
      >
        <LabTournamentBoard tournaments={items} />
      </LabVariant>
    </LabSection>
  );
}
