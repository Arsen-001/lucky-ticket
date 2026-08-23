'use client';

import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface InviteFriendsPromoLadderProps {
  /** Друзья, которые уже засчитаны бэкендом — не длина списка приглашённых. */
  counted: number;
  /** Порог, по которому бэкенд принимает заявку ПРЯМО СЕЙЧАС. */
  required: number;
  /** Что именно пришлёт бот, если порог собран. */
  giftEmoji: string;
  className?: string;
}

/**
 * Лестница «N друзей — подарок от бота», сжатая до одной строки бусин.
 *
 * Не `GiftLadder`: та карточка ведёт заявку целиком (кнопка, отказ сервера,
 * места на сегодня, правило зачёта словами) и занимает 240 пикселей. Здесь у
 * лестницы одна работа — сказать, сколько осталось; забирать подарок игрок
 * пойдёт на экран друзей, куда ведёт кнопка модалки. @see GiftLadder
 *
 * Бусины — `flex: 1 1 0` без минимальной ширины: порог правится в админке, и
 * лестница из десяти ступеней уже однажды не влезла в карточку.
 */
export function InviteFriendsPromoLadder({
  counted,
  required,
  giftEmoji,
  className,
}: InviteFriendsPromoLadderProps) {
  const t = useAppTranslations();

  const total = Math.max(1, required);
  // Ограничиваем: приведший двадцать друзей стоит на 10/10, а не на 20/10.
  const reached = Math.min(Math.max(counted, 0), total);
  const remaining = total - reached;

  return (
    <div className={twMerge('flex w-full flex-col items-center gap-1.5', className)}>
      <div aria-hidden className="flex w-full items-center gap-1">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={twMerge(
              'flex-center h-2.5 min-w-0 flex-1 rounded-full',
              index < reached ? 'bg-electric-pink' : 'bg-white/12'
            )}
          />
        ))}
        <span className="bg-electric-pink/15 ring-electric-pink/35 flex-center ml-1 h-7 w-7 flex-shrink-0 rounded-full text-sm ring-1">
          {remaining === 0 ? (
            <Check size={14} className="text-electric-pink" strokeWidth={3} />
          ) : (
            giftEmoji
          )}
        </span>
      </div>

      <div className="flex w-full items-center justify-between gap-2">
        <p className="text-white-secondary min-w-0 flex-1 text-[11px] leading-snug">
          {remaining > 0
            ? t('coming soon gift steps hint', { count: remaining })
            : t('coming soon gift steps done')}
        </p>
        {/* `whitespace-nowrap` обязателен: «7 / 10» — это три текстовых узла с
            пробелами, и на узком экране перенос рвёт счётчик пополам, оставляя
            «10 /» на одной строке и «10» на другой. */}
        <span className="flex-shrink-0 whitespace-nowrap text-[11px] font-extrabold tabular-nums text-white">
          {reached} / {total}
        </span>
      </div>
    </div>
  );
}
