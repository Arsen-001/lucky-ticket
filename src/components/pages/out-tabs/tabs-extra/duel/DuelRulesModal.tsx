'use client';

import Image from 'next/image';
import { Button } from '@/components/shared/buttons/Button';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { duelTokenSrc } from '@/components/pages/out-tabs/tabs-extra/duel/duel.tokens';
import { duelCycle } from '@/utils/global/duel.utils';

export interface DuelRulesModalProps {
  open: boolean;
  /** Правила приходят с сервера: их правит панель, вшивать в сборку нельзя. */
  winsNeeded: number;
  moveSeconds: number;
  readySeconds: number;
  onClose: () => void;
}

/**
 * Правила стола — под кнопкой «i», а не строкой в списке.
 *
 * До этого всё здесь написанное игрок узнавал на первом же таймере: сколько
 * длится матч, сколько дано на ход, что делает ничья и когда спишутся билеты.
 * Читают это один раз — поэтому оно лежит под кнопкой, а не занимает место
 * в списке, которое нужно всегда.
 *
 * И это единственное место, где вслух сказано, кто кого бьёт: круг из трёх
 * правил словами приходится держать в голове, а картинкой он читается сразу.
 */
export function DuelRulesModal({
  open,
  winsNeeded,
  moveSeconds,
  readySeconds,
  onClose,
}: DuelRulesModalProps) {
  const t = useAppTranslations();

  const rows: { label: string; value: string; gold?: boolean }[] = [
    { label: t('duel rule match'), value: t('duel rule match value', { count: winsNeeded }) },
    { label: t('duel rule move'), value: t('duel rule seconds', { count: moveSeconds }) },
    { label: t('duel rule ready'), value: t('duel rule seconds', { count: readySeconds }) },
    { label: t('duel draw short'), value: t('duel rule draw value') },
    { label: t('duel rule charge'), value: t('duel rule charge value') },
    { label: t('duel rule winner'), value: t('duel rule winner value'), gold: true },
  ];

  // Круг «кто кого бьёт» — из той же таблицы, что судит раунды.
  const cycle = duelCycle();

  return (
    <Modal open={open} onClose={onClose} label={t('duel table rules')}>
      <div className="bg-background flex w-full flex-col gap-3 rounded-2xl border border-white/10 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
        <span className="text-[17px] font-extrabold">{t('duel table rules')}</span>

        <div className="duel-rim flex flex-col gap-2 rounded-[14px] px-3 py-2.5">
          {rows.map((row, index) => (
            <div key={row.label} className="flex flex-col gap-2">
              {index > 0 && <span className="bg-electric-purple/30 h-px" />}
              <div className="flex items-center justify-between gap-3 text-[12.5px]">
                <span className="text-pink-secondary">{row.label}</span>
                <b className={row.gold ? 'text-gold font-extrabold' : 'font-extrabold'}>
                  {row.value}
                </b>
              </div>
            </div>
          ))}
        </div>

        {/* Сеткой, а не рядами по центру: у трёх пар разная ширина, и по центру
            жетоны разъезжались лесенкой вместо трёх ровных столбцов. */}
        <div className="flex flex-col gap-1.5">
          {cycle.map(pair => (
            <span
              key={pair.winner}
              className="text-pink-secondary grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 text-[11.5px]"
            >
              <Image
                src={duelTokenSrc(pair.winner)}
                alt=""
                width={30}
                height={30}
                className="h-[30px] w-[30px] justify-self-end object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.55)]"
              />
              {t('duel beats')}
              <Image
                src={duelTokenSrc(pair.loser)}
                alt=""
                width={30}
                height={30}
                className="h-[30px] w-[30px] justify-self-start object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.55)]"
              />
            </span>
          ))}
        </div>

        <Button className="h-13" onClick={onClose}>
          {t('duel rules got it')}
        </Button>
      </div>
    </Modal>
  );
}
