'use client';

import { useState } from 'react';
import { Gift } from 'lucide-react';
import { useClaimPreLaunchGiftMutation, useGetPreLaunchGiftQuery } from '@/api/referral.api';
import { GiftLadder } from '@/components/shared/gift-ladder/GiftLadder';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';

/**
 * «Приведи друзей — подарок от бота» на экране приглашений.
 *
 * Та же механика, что жила на экране «скоро»: лестница из N приглашённых
 * друзей, каждый — подписан на канал, в конце настоящий подарок Telegram,
 * который админ подтверждает вручную. Гейт сняли 18.08.2026, и промо ушло
 * вместе с экраном; сюда оно вернулось событием 20.08.2026.
 *
 * Три правила, ради которых карточка сделана именно так:
 *
 *  1. **`available: false` — не рисуем ничего.** Промо выключено (`dailyLimit`
 *     = 0 в панели) или у игрока подарок уже есть: для экрана это один и тот
 *     же ответ, и блока просто не существует. Ровно как у рулетки рядом.
 *     @see FriendsRouletteCard
 *  2. **Все числа — с сервера.** Порог, места на сегодня, кто из друзей
 *     засчитан: всё это правится в админке, и экран, который решает любое из
 *     них сам, обещает промо, которое уже закрыто.
 *  3. **Отказ показываем словами бэкенда.** «Подарки на сегодня разобраны» и
 *     «друг вышел из канала» — разные вещи, и только сервер знает, какая из
 *     них случилась.
 */
export function FriendsGiftEventCard() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: gift, isLoading } = useGetPreLaunchGiftQuery();
  const [claimGift, { isLoading: claiming }] = useClaimPreLaunchGiftMutation();

  // Причина последнего отказа — под лестницей, а не тостом: она объясняет
  // именно эту кнопку и должна остаться на экране, пока игрок с ней не
  // разобрался. Тост живёт три секунды и уносит объяснение с собой.
  const [refusal, setRefusal] = useState<string | null>(null);

  if (isLoading) {
    return <Skeleton variant="rounded-rectangle" className="h-60 w-full rounded-2xl" />;
  }
  // Undefined — бэкенд не ответил (или он старше промо): молчим, а не рисуем
  // лестницу, которую некому оплатить.
  if (!gift || gift.available === false) return null;

  const claim = async () => {
    if (claiming) return;
    setRefusal(null);
    try {
      await claimGift().unwrap();
    } catch (error) {
      // Слова сервера, если они есть: он один знает, кончились ли места,
      // вышел ли друг из канала или промо закрыли минуту назад.
      const message = (error as { data?: { message?: string } })?.data?.message;
      setRefusal(message ?? t('friends gift claim failed'));
      if (!message) toast.error(t('friends gift claim failed'));
    }
  };

  return (
    <section
      className="shine-card relative overflow-hidden rounded-2xl p-3"
      style={{ ['--shine-card-accent' as string]: 'var(--color-electric-pink)' }}
      data-tour="friends-gift"
    >
      <div className="relative mb-2.5 flex items-center gap-2">
        <div className="bg-electric-pink/15 ring-electric-pink/30 flex-center h-9 w-9 flex-shrink-0 rounded-xl ring-1">
          <Gift size={18} className="text-electric-pink" strokeWidth={2.2} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-sm font-extrabold leading-tight text-white">
            {t('friends gift title')}
          </h2>
          {/* Не `truncate`, как у соседних карточек: там подзаголовок в три
              слова, а здесь он несёт условие целиком — на 320px оно обрывалось
              на «10 друзей в канале — и…», то есть ровно перед тем, что игрок
              за это получит. */}
          <p className="text-pink-secondary line-clamp-2 text-[11px] leading-snug">
            {t('friends gift subtitle', { count: gift.required })}
          </p>
        </div>
      </div>

      {/* Считаем засчитанных друзей, а не длину списка: лестница обязана
          показывать ровно то, по чему бэкенд принимает заявку. */}
      <GiftLadder
        invitedCount={gift.counted ?? 0}
        gift={gift}
        onClaim={claim}
        claiming={claiming}
        error={refusal}
        // Про долю с турниров рядом уже написано в «Как это работает» —
        // второй раз на том же экране это не обещание, а шум.
        showProfitNote={false}
      />
    </section>
  );
}
