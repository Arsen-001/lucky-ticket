import type { PreLaunchGiftState } from '@/types/interfaces/referral.interfaces';
import type { GiftPrizeState } from '@/components/shared/gift-ladder/GiftPrize';

export interface GiftPrizeStateInput {
  status: PreLaunchGiftState['status'];
  /** Сервер уже ответил, сработает ли нажатие прямо сейчас. */
  canClaim?: boolean;
  /** Лестница собрана, но мест на сегодня может не быть. */
  eligible?: boolean;
  /** Лестница собрана ПРЯМО СЕЙЧАС — живой счёт, а не тот, что был при заявке. */
  complete: boolean;
}

/**
 * В каком состоянии рисовать подарок под лестницей.
 *
 * Отдельной функцией, а не тернарником внутри компонента, ровно по одной
 * причине: здесь была ошибка, которую нашёл живой игрок. `REJECTED` попадал в
 * ветку «заявка подана», и у AK001KA под лестницей месяц висело «Запрошен —
 * ждёт подтверждения», хотя отказ был вынесен 04.08.2026 и лестница для него
 * давно открыта заново. Компонент отрисовать в этом наборе тестов нельзя (он
 * node-only), а вот это — можно.
 *
 * Порядок веток — это и есть правило, и он не произвольный:
 *
 *  1. `sent` — подарок у человека, дальше говорить не о чем;
 *  2. `paused` — заявка жива, но лестница с тех пор рассыпалась; идёт раньше
 *     «заявки», иначе экран показывал бы зелёную галочку там, где панель уже
 *     отказывает в отправке;
 *  3. `claimed` — заявка едет. 🔴 `REJECTED` сюда НЕ входит: решение принято,
 *     и для игрока это не «ждёт», а «можно заново»;
 *  4. дальше — обычная лестница: можно жать / собрал, но мест нет / рано.
 */
export function giftPrizeState({
  status,
  canClaim,
  eligible,
  complete,
}: GiftPrizeStateInput): GiftPrizeState {
  if (status === 'SENT') return 'sent';
  if (!complete && (status === 'PENDING' || status === 'FAILED')) return 'paused';
  if (status && status !== 'REJECTED') return 'claimed';
  if (canClaim) return 'ready';
  if (eligible) return 'closed';
  return 'locked';
}
