'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Gift } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { tikkiImages } from '@/components/shared/tikki/tikki.images';
import { DailyGiftDrop } from '@/components/pages/tabs/home/DailyGiftDrop';
import { DailyGiftPath } from '@/components/pages/tabs/home/DailyGiftPath';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import { routes } from '@/constants/routes';
import type { DailyGiftState } from '@/types/interfaces/status-gift.interfaces';

export interface DailyGiftModalProps {
  open: boolean;
  gift: DailyGiftState;
  claiming?: boolean;
  onClaim: () => void;
  onClose: () => void;
}

/**
 * Ежедневный подарок — серия (DOCS §7.2a).
 *
 * Вручает Тикки: он и так стоит на главной, и он единственное лицо игры, а
 * подарок из абстрактной модалки становится чем-то, что кто-то принёс.
 *
 * Один компонент на обе аудитории нарочно: тот, кому подарок положен, видит
 * ступень и «Забрать», остальные — ту же ступень и кнопку статуса. Развести их
 * по двум модалкам значит гарантировать, что предложение разойдётся с подарком
 * в первый же раз, когда админ подвинет лестницу.
 *
 * 🔴 Все числа приезжают с сервера уже умноженными под этого игрока. Клиент не
 * знает ни про множители подписки, ни про длину цикла — иначе на экране жила бы
 * вторая копия экономики.
 */
export function DailyGiftModal({
  open,
  gift,
  claiming = false,
  onClaim,
  onClose,
}: DailyGiftModalProps) {
  const t = useAppTranslations();
  const router = useRouter();

  // Забрать нельзя и подарок закрыт подпиской ⇒ это предложение, а не подарок.
  const isPromo = !gift.canClaim && !gift.openToAll && !gift.isLuckyPlayer;
  const title = isPromo ? t('lucky player daily gift') : t('your daily gift');

  const steps = gift.steps.length ? gift.steps : gift.lpSteps;
  const today = steps[gift.day - 1];
  // Промо показывает цифры подписки — их и обещает кнопка.
  const drop = isPromo ? (gift.lpSteps[gift.day - 1] ?? today) : today;
  const tomorrow = steps[gift.day] ?? null;
  const lpToday = gift.lpSteps[gift.day - 1] ?? null;

  return (
    <Modal open={open} onClose={onClose} label={title}>
      <div
        className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-white/10 px-5 pt-0 pb-5 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        style={{
          background:
            'radial-gradient(circle at 50% 4%, rgba(240, 185, 90, 0.18) 0%, transparent 46%),' +
            'var(--gradient-purple-reverse)',
        }}
      >
        {/* Тикки заходит на верхний край карточки — он вручает подарок, а не
            лежит внутри него. Свечение отдельным пятном, чтобы заголовок под
            ним остался на фиолетовом. */}
        <span className="relative -mt-7 mb-1">
          <span
            aria-hidden
            className="bg-gold/25 pointer-events-none absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          />
          <Image
            src={tikkiImages[gift.ticketTier].jump}
            alt=""
            width={150}
            height={154}
            loading="eager"
            fetchPriority="high"
            className="relative mx-auto h-auto w-[150px] object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.55)]"
          />
        </span>

        {gift.isLuckyPlayer && (
          <span className="border-gold/45 bg-gold/12 relative flex items-center gap-1.5 rounded-full border py-1 pr-2.5 pl-1">
            <LuckyPlayerIcon size={16} state="active" />
            <span className="text-gold text-[9px] font-extrabold tracking-[0.12em] uppercase">
              {t('lucky player')}
            </span>
          </span>
        )}

        <div className="relative flex flex-col items-center gap-1">
          <h2 className="text-[19px] leading-tight font-extrabold text-white">
            {t('day {count} in a row', { count: gift.day })}
          </h2>
          <p className="text-white-secondary max-w-[260px] text-[12px] leading-snug">
            {isPromo
              ? t('this is what lucky player brings every day')
              : tomorrow
                ? t('tomorrow {count} tickets', { count: formatNumber(tomorrow.tickets) })
                : t('tomorrow the streak starts over')}
          </p>
        </div>

        <DailyGiftDrop
          tickets={drop.tickets}
          lc={drop.lc}
          tier={gift.ticketTier}
          className="relative"
        />

        <DailyGiftPath steps={steps} day={gift.day} className="relative" />

        <div className="relative flex w-full flex-col items-center gap-1.5">
          {isPromo ? (
            <Button
              className="w-full"
              onClick={() => {
                onClose();
                router.push(routes.settings.luckyPlayer);
              }}
            >
              {t('get lucky player')}
            </Button>
          ) : (
            <Button
              className="flex-center w-full gap-2"
              loading={claiming}
              disabled={!gift.canClaim || claiming}
              onClick={onClaim}
            >
              <Gift className="size-4" />
              {t('collect')}
            </Button>
          )}

          {/* Что даёт статус — на глазах у того, у кого его нет. Без этой строки
              подписка остаётся числом в маркете, которое не с чем сравнить. */}
          {!gift.isLuckyPlayer && !isPromo && lpToday ? (
            <p className="text-muted text-[10px] leading-snug">
              {t('with lucky player {tickets} and {amount}', {
                tickets: formatNumber(lpToday.tickets),
                amount: formatNumber(lpToday.lc),
              })}
            </p>
          ) : (
            <p className="text-muted text-[10px] leading-snug">
              {t('miss a day and the streak restarts')}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
