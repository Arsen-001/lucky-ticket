'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMeQuery } from '@/api/me.api';
import { useGetPreLaunchGiftQuery } from '@/api/referral.api';
import { InviteFriendsPromoModal } from '@/components/pages/out-tabs/drawer/invite-friends/promo/InviteFriendsPromoModal';
import { routes } from '@/constants/routes';
import { useAutoSurfaceSlot } from '@/hooks/useAutoSurfaceSlot';
import { utcDay, utcDaysSince } from '@/utils/global/date.utils';

/** UTC-день последнего показа, `YYYY-MM-DD`. */
const SHOWN_KEY = 'lt-friends-promo-shown';

/** Сколько дней промо молчит после показа. Решение пользователя 23.08.2026. */
const QUIET_DAYS = 7;

/** Показывали недавно — значит на этой неделе промо молчит. */
const shownWithinWeek = (stamp: string | null): boolean => {
  const days = utcDaysSince(stamp);
  // `null` — метки нет или она испорчена: ограничение не действует.
  return days !== null && days < QUIET_DAYS;
};

/**
 * «Пока идёт тест — зови друзей»: раз в неделю, после всего остального.
 *
 * Стоит последним в очереди авто-попапов (@see AUTO_SURFACE_PRIORITY): это
 * единственный из них, который ничего не выдаёт и ничего не теряет от того, что
 * его отложили. Практически это и есть требуемый порядок — игрок, вернувшийся
 * после трёх турниров, сначала закрывает три карточки наград и только потом
 * получает приглашение позвать друзей.
 *
 * Три вещи, за которые тут отвечает именно клиент:
 *
 *  1. **Раз в неделю.** Промо не выдаёт награду, поэтому сервер о нём ничего не
 *     знает и знать не должен; счётчик локальный, и переустановка приложения
 *     даёт лишний показ — это дешевле, чем колонка в базе ради рекламы.
 *  2. **Не в первую сессию.** Новичок приходит в выбор языка, подарки и тур;
 *     четвёртым диалогом подряд промо не читают, его закрывают.
 *  3. **Нечего показать — не показываем.** `available: false` у подарка значит
 *     «выключено или уже получено»; тогда модалки не существует, а запрос
 *     вообще не уходит.
 */
export function FriendsPromoAutoSurface() {
  const router = useRouter();
  const { data: me } = useGetMeQuery();

  // null — ещё не читали: localStorage недоступен на сервере, а старт с «уже
  // показано» не даёт модалке мигнуть на гидрации.
  const [shownRecently, setShownRecently] = useState<boolean | null>(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    setShownRecently(shownWithinWeek(localStorage.getItem(SHOWN_KEY)));
  }, []);

  // Показывали на этой неделе — не спрашиваем сервер вовсе: лишний запрос на
  // каждый заход ради попапа, который до конца недели уже не выйдет.
  const skip = shownRecently !== false || !me?.hasSeenTour;
  const { data: gift } = useGetPreLaunchGiftQuery(undefined, { skip });

  // `available === false` — «выключено или у него уже есть»; undefined — бэкенд
  // слишком старый, чтобы сказать, и тогда блок рисуется, как рисовался всегда.
  const giftLive = gift && gift.available !== false ? gift : undefined;

  const wants = !skip && !closed && Boolean(giftLive);
  const canShow = useAutoSurfaceSlot('friends-promo', wants);

  // Неделю жжём в момент, когда промо РЕАЛЬНО на экране, а не когда его закрыли:
  // приложение, убитое с открытой модалкой, показ уже потратило, а ждать тапа
  // значит показать её второй раз тому, кто просто ушёл в другой чат.
  useEffect(() => {
    if (!canShow) return;
    localStorage.setItem(SHOWN_KEY, utcDay());
  }, [canShow]);

  const invite = () => {
    setClosed(true);
    router.push(routes.inviteFriends);
  };

  return (
    <InviteFriendsPromoModal
      open={canShow}
      onClose={() => setClosed(true)}
      onInvite={invite}
      gift={giftLive}
    />
  );
}
