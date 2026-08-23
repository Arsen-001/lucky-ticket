'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface InviteFriendsPromoGrandPrizeProps {
  emoji: string;
  title: string;
  className?: string;
}

/**
 * Главный приз рулетки — первое, что видно в промо.
 *
 * Он стоит НАД текстом, а не среди плиток: приглашение работает картинкой
 * приза, а не абзацем условий, и слот, ради которого игрок зовёт друзей,
 * обязан быть крупнее любого другого элемента карточки.
 *
 * Название приходит с сервера уже готовой строкой — сервер один знает, что
 * лежит в таблице сегодня. @see pickGrandPrize
 */
export function InviteFriendsPromoGrandPrize({
  emoji,
  title,
  className,
}: InviteFriendsPromoGrandPrizeProps) {
  const t = useAppTranslations();

  return (
    <div
      className={twMerge(
        'border-gold/45 bg-gold/8 relative flex w-full flex-col items-center gap-1 rounded-2xl border px-4 py-3',
        className
      )}
    >
      <span className="text-gold/80 text-[10px] font-extrabold uppercase tracking-[0.22em]">
        {t('grand prize')}
      </span>
      <span aria-hidden className="text-4xl leading-none">
        {emoji}
      </span>
      {/* Две строки, дальше многоточие: в каталоге лежат названия вроде
          «Подарок Telegram · 50 ⭐», и обрезать их в одну строку значит унести
          из главного приза его цену. */}
      <span className="text-gold line-clamp-2 text-center text-sm font-extrabold leading-snug">
        {title}
      </span>
    </div>
  );
}
