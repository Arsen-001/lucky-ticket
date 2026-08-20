'use client';

import { DuelToken } from '@/components/pages/out-tabs/tabs-extra/duel/DuelToken';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface DuelStageProps {
  /** Побед в матче — сервер, а не константа: число правит панель. */
  winsNeeded: number;
  stakeMin: number;
  stakeMax: number;
  moveSeconds: number;
}

/**
 * Лицо дуэли над списком лобби.
 *
 * Стоит здесь, а не в бою, по одной причине: до этой правки игрок узнавал, чем
 * играет, только когда матч уже шёл — экран открывался списком чужих ников.
 * Три фигуры и одна строка правила отвечают на «во что это» раньше, чем он
 * решит, ставить ли билеты.
 *
 * Числа под фигурами приезжают с сервера вместе со списком: их правит панель,
 * и обещать здесь вшитую пятёрку секунд нельзя.
 */
export function DuelStage({ winsNeeded, stakeMin, stakeMax, moveSeconds }: DuelStageProps) {
  const t = useAppTranslations();

  const facts: { label: string; value: string }[] = [
    { label: t('duel fact match'), value: t('duel fact wins', { count: winsNeeded }) },
    { label: t('duel fact stake'), value: `${stakeMin}–${stakeMax}` },
    { label: t('duel fact move'), value: t('duel fact seconds', { count: moveSeconds }) },
  ];

  return (
    <div className="border-electric-purple/50 from-electric-purple/25 flex flex-col gap-2 rounded-3xl border bg-gradient-to-b to-transparent p-3">
      <div className="flex items-center justify-center gap-1">
        <DuelToken move="ROCK" size={74} className="-rotate-[11deg]" />
        <DuelToken move="TICKET" size={104} />
        <DuelToken move="SCISSORS" size={74} className="rotate-[11deg]" />
      </div>

      <p className="text-center text-[11px] leading-snug text-white-secondary">
        {t('duel rule line')}
      </p>

      <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-2">
        {facts.map(fact => (
          <span key={fact.label} className="flex items-baseline gap-1.5">
            <span className="text-pink-secondary text-[10px]">{fact.label}</span>
            <span className="text-xs font-extrabold tabular-nums">{fact.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
