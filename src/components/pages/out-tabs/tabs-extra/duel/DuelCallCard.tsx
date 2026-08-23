'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';
import { DuelPlayerAvatar } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPlayerAvatar';
import { DUEL_MOVES, duelTokenSrc } from '@/components/pages/out-tabs/tabs-extra/duel/duel.tokens';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { DuelInvite } from '@/types/interfaces/duel.interfaces';

export interface DuelCallCardProps {
  invite: DuelInvite;
  /** Счёт серии, если зовут на реванш: ради него реванш и берут. */
  series?: { mine: number; theirs: number } | null;
  className?: string;
}

/**
 * Карточка вызова: кто зовёт, во что и сколько это стоит.
 *
 * Это единственное окно игры, которое всплывает ВНЕ игры — на главной, в
 * маркете, в заданиях. Поэтому оно отвечает на три вопроса за секунду:
 *
 * - **во что** — веером из самих фигур, ещё до имени: камень, билет и ножницы
 *   узнаются раньше, чем прочитано слово;
 * - **кто** — аватар и имя;
 * - **сколько** — жетоном с билетом ТОЙ ЛИГИ, в которой открыт стол.
 *
 * И отдельной строкой сказано, что билеты спишутся на старте, а не сейчас:
 * это единственное, что снимает страх нажать, и прятать его нельзя.
 */
export function DuelCallCard({ invite, series, className }: DuelCallCardProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('flex flex-col items-center gap-2.5 text-center', className)}>
      <span aria-hidden className="flex items-center">
        {DUEL_MOVES.map((move, index) => (
          <Image
            key={move}
            src={duelTokenSrc(move)}
            alt=""
            width={52}
            height={52}
            style={{ marginInlineStart: index === 0 ? 0 : -10 }}
            className={twMerge(
              'h-[52px] w-[52px] object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.6)]',
              // Билет вдвое шире, чем выше: плашмя он читается полосой, а не
              // предметом. Под −45° он встаёт в один рост с соседями.
              move === 'TICKET' && '-rotate-45'
            )}
          />
        ))}
      </span>

      <DuelPlayerAvatar
        name={invite.fromName}
        avatarUrl={invite.fromAvatarUrl || undefined}
        size={46}
      />

      <span className="text-[18px] font-extrabold">
        {invite.rematch
          ? t('duel invite rematch title', { name: invite.fromName })
          : t('duel invite title', { name: invite.fromName })}
      </span>

      <span className="text-pink-secondary text-[12.5px] leading-snug">
        {invite.rematch ? t('duel rematch same table') : t('games duel blurb')}
      </span>

      <span className="duel-chip flex items-center gap-1.5 rounded-lg px-3 py-1 text-[10px] font-black tracking-[0.14em] text-white/90 uppercase">
        <Ticket
          type={invite.tier}
          width={20}
          height={20}
          className="h-[13px] w-[20px] object-contain"
        />
        {t(invite.tier)} · {t('duel stake short')}{' '}
        <b className="text-gold text-[12px] tabular-nums">{invite.stake}</b>
      </span>

      {series && (
        <span className="duel-chip text-gold rounded-lg px-3 py-1 text-[11px] font-black tracking-[0.14em] uppercase tabular-nums">
          {t('duel series', { mine: series.mine, theirs: series.theirs })}
        </span>
      )}

      <span className="text-disabled text-[12px] leading-snug">{t('duel charged at start')}</span>
    </div>
  );
}
