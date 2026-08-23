'use client';

import { Button } from '@/components/shared/buttons/Button';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { pickGrandPrize, rouletteShowcase } from '@/utils/global/roulette.utils';
import type { PreLaunchGiftState } from '@/types/interfaces/referral.interfaces';
import type { RouletteState } from '@/types/interfaces/roulette.interfaces';
import { InviteFriendsPromoGrandPrize } from './InviteFriendsPromoGrandPrize';
import { InviteFriendsPromoLadder } from './InviteFriendsPromoLadder';
import { InviteFriendsPromoPrizes } from './InviteFriendsPromoPrizes';

/** Сколько призов помещается в ленту, прежде чем она перестаёт читаться. */
const SHOWCASE_LIMIT = 8;

/** Чем рисуем подарок, пока сервер не сказал свой. @see GiftLadder */
const FALLBACK_GIFT_EMOJI = '💝';

export interface InviteFriendsPromoModalProps {
  open: boolean;
  onClose: () => void;
  /** Увести на экран друзей — там и лестница, и барабан целиком. */
  onInvite: () => void;
  /** Живое состояние подарка за друзей; undefined — событие не показываем. */
  gift?: PreLaunchGiftState;
  /** Живое состояние рулетки; undefined — барабан не показываем. */
  roulette?: RouletteState;
}

/**
 * «Пока идёт тест — зови друзей»: что игрок получит за приглашения, одним
 * экраном.
 *
 * Всплывает сама, после очереди результатов турниров: человек, который только
 * что забрал награду, — единственный, кто в этот момент точно знает, чего стоит
 * турнир, и это лучшая секунда, чтобы позвать в него друзей.
 *
 * Три правила:
 *
 *  1. **Ничего не обещаем от себя.** Порог, число друзей, таблица призов и цена
 *     спина — всё это настройки панели, и модалка рисует ровно то, что пришло с
 *     сервера. Блок, которого сервер не дал, не рисуется вовсе.
 *  2. **Забрать отсюда нельзя.** Ни заявки, ни спина: обе кнопки ведут на экран
 *     друзей, где у каждой механики свой полный вид с отказами сервера словами.
 *     Промо, которое само подаёт заявку, обязано и объяснять отказ — а места на
 *     это здесь нет.
 *  3. **Главный приз — картинкой.** @see InviteFriendsPromoGrandPrize
 */
export function InviteFriendsPromoModal({
  open,
  onClose,
  onInvite,
  gift,
  roulette,
}: InviteFriendsPromoModalProps) {
  const t = useAppTranslations();

  const slots = roulette?.slots ?? [];
  const grand = pickGrandPrize(slots);
  const showcase = rouletteShowcase(slots, SHOWCASE_LIMIT);
  const giftEmoji = gift?.giftEmoji || FALLBACK_GIFT_EMOJI;

  // Рулетки нет — главным призом становится сам подарок бота: без него шапка
  // осталась бы пустой рамкой, а подарок Telegram и есть то, ради чего зовут.
  const hero = grand
    ? { emoji: grand.emoji, title: grand.title }
    : gift
      ? { emoji: giftEmoji, title: t('friends gift title') }
      : null;

  return (
    <Modal open={open} onClose={onClose} hideCloseButton label={t('invite promo title')}>
      <div className="bg-purple-gradient relative mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl">
        <div className="relative flex flex-col items-center gap-3 px-5 pb-5 pt-6">
          {hero && <InviteFriendsPromoGrandPrize emoji={hero.emoji} title={hero.title} />}

          <div className="flex flex-col items-center gap-1">
            <h2 className="text-center text-xl font-extrabold leading-tight">
              {t('invite promo title')}
            </h2>
            <p className="text-white-secondary max-w-[280px] text-center text-xs leading-snug">
              {t('invite promo subtitle')}
            </p>
          </div>

          {gift && (
            <InviteFriendsPromoLadder
              counted={gift.counted ?? 0}
              required={gift.required}
              giftEmoji={giftEmoji}
            />
          )}

          {roulette && (
            <InviteFriendsPromoPrizes
              slots={showcase}
              friendsPerSpin={roulette.friendsPerSpin}
              totalCount={slots.length}
            />
          )}

          <div className="flex w-full flex-col items-center gap-2">
            <Button
              onClick={onInvite}
              className="w-full rounded-xl py-3 text-sm font-extrabold uppercase tracking-[0.16em]"
            >
              {t('invite friends')}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45"
            >
              {t('later')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
