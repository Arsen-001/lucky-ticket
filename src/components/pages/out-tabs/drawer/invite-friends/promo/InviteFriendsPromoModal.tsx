'use client';

import { Button } from '@/components/shared/buttons/Button';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { PreLaunchGiftState } from '@/types/interfaces/referral.interfaces';
import { InviteFriendsPromoGrandPrize } from './InviteFriendsPromoGrandPrize';
import { InviteFriendsPromoLadder } from './InviteFriendsPromoLadder';

/** Чем рисуем подарок, пока сервер не сказал свой. @see GiftLadder */
const FALLBACK_GIFT_EMOJI = '💝';

export interface InviteFriendsPromoModalProps {
  open: boolean;
  onClose: () => void;
  /** Увести на экран друзей — там лестница целиком и кнопка заявки. */
  onInvite: () => void;
  /** Живое состояние подарка за друзей; undefined — промо не показываем. */
  gift?: PreLaunchGiftState;
}

/**
 * «Пока идёт тест — зови друзей»: что игрок получит за приглашения.
 *
 * Всплывает сама, после очереди результатов турниров: человек, который только
 * что забрал награду, — единственный, кто в этот момент точно знает, чего стоит
 * турнир, и это лучшая секунда, чтобы позвать в него друзей.
 *
 * Три правила:
 *
 *  1. **Одно обещание на модалку.** Подарок бота за собранную лестницу — и всё.
 *     Рулетка отсюда убрана 23.08.2026 (решение пользователя): барабан живёт на
 *     экране друзей, а промо с двумя механиками сразу заставляет выбирать там,
 *     где надо просто позвать друга. @see FriendsRouletteCard
 *  2. **Ничего не обещаем от себя.** Порог и число засчитанных друзей — с
 *     сервера, оба правятся в панели. Подарка нет — модалки не существует.
 *  3. **Забрать отсюда нельзя.** Кнопка ведёт на экран друзей, где у заявки
 *     свой полный вид с отказами сервера словами. Промо, которое само подаёт
 *     заявку, обязано и объяснять отказ — а места на это здесь нет.
 */
export function InviteFriendsPromoModal({
  open,
  onClose,
  onInvite,
  gift,
}: InviteFriendsPromoModalProps) {
  const t = useAppTranslations();

  const giftEmoji = gift?.giftEmoji || FALLBACK_GIFT_EMOJI;

  return (
    <Modal open={open} onClose={onClose} hideCloseButton label={t('invite promo title')}>
      <div className="bg-purple-gradient relative mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl">
        <div className="relative flex flex-col items-center gap-3 px-5 pb-5 pt-6">
          {gift && (
            <InviteFriendsPromoGrandPrize
              emoji={giftEmoji}
              // Стикер подарка, когда он пришёл: `sticker.emoji` подарок НЕ
              // опознаёт (мишка Telegram сообщает про себя '🎂'), поэтому
              // картинка всегда честнее эмодзи. @see PreLaunchGiftState
              imageSrc={gift.giftImage ?? undefined}
              title={t('friends gift title')}
            />
          )}

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
