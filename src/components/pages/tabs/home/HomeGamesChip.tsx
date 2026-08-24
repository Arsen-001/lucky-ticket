'use client';

import Image from 'next/image';
import { Link } from '@/components/shared/links/Link';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { useGetDuelLobbiesQuery } from '@/api/duel.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useFeature } from '@/hooks/useFeature';
import { routes } from '@/constants/routes';
import { openDuelTables } from '@/utils/global/duel.utils';

/**
 * Вход в раздел «Игры» с главной — третья плашка верхнего ряда.
 *
 * Ряд уже переполнен: оба текста в карточке тест-квеста стоят под `truncate`
 * именно поэтому. Поэтому здесь нет ни названия игры, ни подписи под ней —
 * только жетоны, по которым игра узнаётся раньше, чем прочитано слово, и одно
 * живое число: сколько столов ждёт соперника прямо сейчас. Ширина плашки
 * задана содержимым и не отбирает у соседей ничего лишнего.
 *
 * Появляется, только когда игра открыта игроку (`useFeature('duel')`): ни
 * замка, ни «скоро» — стадия выката ничего не обещает.
 *
 * Число рисуется, только когда ответ действительно приехал: плашка смотрит на
 * сами данные, а не на флаг отказа — ей важно «есть ли число», а не почему его
 * нет. Отказ сервера — тот самый `GET games/duel/lobbies`, который однажды
 * отвечал 500 на каждый запрос, — не должен выглядеть как честный «0 столов»:
 * плашка остаётся входом, но про столы молчит. Сам отказ показывает экран,
 * который запросом владеет; плашка в 56 px для этого не место.
 */
export function HomeGamesChip() {
  const t = useAppTranslations();
  const duelOpen = useFeature('duel');

  const { data, isLoading } = useGetDuelLobbiesQuery(undefined, {
    skip: !duelOpen,
    // 15 с, а не минута: стол, открытый другим игроком, — это приглашение,
    // которое протухает само. Минутного шага хватало, чтобы число на главной
    // отставало от того, что игрок уже видел в игре. Рядом, на тех же экранах,
    // вызовы на дуэль опрашиваются каждые 5 с (@see DuelInviteAutoSurface), так
    // что 15 с здесь — не новая нагрузка на прод, а её четверть.
    pollingInterval: 15_000,
    // Свёрнутое приложение сервер не опрашивает, но возврат в него — повод
    // спросить сразу: игрок вернулся именно за тем, что там изменилось.
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    // Возврат на главную — второй такой повод. Свой стол, открытый в игре,
    // иначе доезжает до плашки только следующим опросом.
    refetchOnMountOrArgChange: true,
  });

  if (!duelOpen) return null;

  const tables = openDuelTables(data);

  return (
    <Link
      href={routes.games.index}
      aria-label={tables > 0 ? t('duel tables open', { count: tables }) : t('games')}
      // Непрозрачная подложка под тинт — на атмосферном фоне градиент в 20%
      // превращает плашку в окно. Инлайном, а не `bg-background`: та утилита и
      // `bg-gradient-*` попадают в одну группу tailwind-merge, и одна из двух
      // молча пропадёт. @see HomeJackpotBanner
      style={{ backgroundColor: 'var(--color-background)' }}
      className="relative flex shrink-0 items-center justify-center overflow-visible rounded-3xl border border-electric-pink/50 bg-gradient-to-bl from-electric-purple/20 to-electric-pink/10 px-1.5 transition-transform active:scale-[0.98]"
    >
      <span aria-hidden className="flex items-center">
        <Image
          src="/assets/icons/duel/rock.webp"
          alt=""
          width={22}
          height={22}
          loading="eager"
          className="h-[22px] w-[22px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
        />
        <Image
          src="/assets/icons/duel/scissors.webp"
          alt=""
          width={22}
          height={22}
          loading="eager"
          className="-ms-3 h-[22px] w-[22px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
        />
      </span>

      {/* Число садится на угол, а не в строку: строкой оно стоило карточке
          тест-квеста весь заголовок (замер: −44 px на 390, −74 px на 360).
          Нуля на углу не бывает: бейдж — это «тебя ждут», а «ждут ноль» не
          сообщение, а шум. Столов нет — плашка остаётся входом молча. */}
      {isLoading ? (
        <Skeleton variant="line" className="absolute -end-1 -top-1 h-4 w-4 rounded-full" />
      ) : tables > 0 ? (
        <span className="bg-pink-gradient border-background absolute -end-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 px-1 text-[10px] font-black leading-none tabular-nums text-white">
          {tables}
        </span>
      ) : null}
    </Link>
  );
}
