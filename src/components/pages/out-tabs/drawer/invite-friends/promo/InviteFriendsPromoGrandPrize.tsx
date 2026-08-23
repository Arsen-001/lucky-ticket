'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface InviteFriendsPromoGrandPrizeProps {
  emoji: string;
  title: string;
  /**
   * Стикер подарка как `data:` URI, когда сервер его прислал. Предпочтительнее
   * эмодзи всегда: эмодзи подарок не опознаёт — мишка Telegram сообщает про
   * себя '🎂', — и промо тогда обещает не тот подарок, который придёт.
   */
  imageSrc?: string;
  className?: string;
}

/**
 * Приз, ради которого зовут, — первое, что видно в промо.
 *
 * Он стоит НАД текстом, а не под ним: приглашение работает картинкой приза, а
 * не абзацем условий, и подарок обязан быть крупнее любого другого элемента
 * карточки.
 */
export function InviteFriendsPromoGrandPrize({
  emoji,
  title,
  imageSrc,
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
      {imageSrc ? (
        // Обычный <img>, не next/image: это `data:` URI из ответа сервера —
        // оптимизатору Next его нечего оптимизировать, а `/_next/image` на
        // таком источнике отвечает 400.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageSrc} alt={title} className="h-12 w-12 object-contain" />
      ) : (
        <span aria-hidden className="text-4xl leading-none">
          {emoji}
        </span>
      )}
      {/* Две строки, дальше многоточие: название подарка приходит с сервера и
          бывает длинным, а обрезать его в одну строку значит унести из приза
          то, чем он отличается от соседнего. */}
      <span className="text-gold line-clamp-2 text-center text-sm font-extrabold leading-snug">
        {title}
      </span>
    </div>
  );
}
