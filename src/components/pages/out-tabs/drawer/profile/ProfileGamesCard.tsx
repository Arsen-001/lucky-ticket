'use client';

import { Swords } from 'lucide-react';
import { DuelToken } from '@/components/pages/out-tabs/tabs-extra/duel/DuelToken';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useFeature } from '@/hooks/useFeature';
import type { ProfilePublicStats } from '@/types/interfaces/profile.interfaces';

export interface ProfileGamesCardProps {
  stats?: ProfilePublicStats;
  loading?: boolean;
}

/**
 * Игровая статистика в профиле — пока это дуэль.
 *
 * Показывается, только когда игра открыта игроку: пустая карточка «сыграно 0»
 * у того, кто дуэль даже не видит, — это обещание, которого никто не давал.
 *
 * Процент побед считается здесь, а не на сервере: он производный, и сервер,
 * отдающий два числа вместо трёх, не может разойтись сам с собой.
 */
export function ProfileGamesCard({ stats, loading }: ProfileGamesCardProps) {
  const t = useAppTranslations();
  const duelOpen = useFeature('duel');

  if (!duelOpen) return null;

  const matches = stats?.duelMatches ?? 0;
  const wins = stats?.duelWins ?? 0;
  const rate = matches > 0 ? Math.round((wins / matches) * 100) : 0;

  const cells: { label: string; value: string }[] = [
    { label: t('duel stat matches'), value: String(matches) },
    { label: t('duel stat wins'), value: String(wins) },
    { label: t('duel stat rate'), value: `${rate}%` },
  ];

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="px-1 text-base font-extrabold text-white">{t('games')}</h3>

      <div className="bg-background-overlay border-electric-purple/35 flex flex-col gap-3 rounded-2xl border p-3">
        <div className="flex items-center gap-3">
          <span className="flex-center bg-electric-purple/15 text-electric-purple h-10 w-10 shrink-0 rounded-xl">
            <Swords size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-extrabold">{t('duel')}</span>
            <span className="text-pink-secondary block text-[11px]">{t('games duel blurb')}</span>
          </span>
          <DuelToken move="TICKET" size={46} className="shrink-0" />
        </div>

        <div className="grid grid-cols-3 divide-x divide-white/6">
          {cells.map(cell => (
            <span key={cell.label} className="flex flex-col items-center gap-0.5 px-1">
              <span className="text-lg font-extrabold tabular-nums">
                {loading ? '—' : cell.value}
              </span>
              <span className="text-pink-secondary text-center text-[10px] leading-tight">
                {cell.label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
