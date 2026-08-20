'use client';

import { useState } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useFeature } from '@/hooks/useFeature';
import { DuelLobbies } from './DuelLobbies';
import { DuelArena } from './DuelArena';

/**
 * Экран дуэли целиком.
 *
 * Пока фича на стадии «тестировщики», сюда не попадёт никто, кроме списка в
 * панели: гейт стоит и здесь, и на каждом эндпоинте — «его не видно» не
 * является проверкой прав.
 */
export function DuelScreen() {
  const t = useAppTranslations();
  const enabled = useFeature('duel');
  const [duelId, setDuelId] = useState<string | null>(null);

  if (!enabled) {
    return (
      <p className="flex-available flex-center px-6 text-center text-sm text-disabled">
        {t('duel unavailable')}
      </p>
    );
  }

  return (
    <div className="flex-col-stretch flex-available px-4 pt-2 pb-6">
      {duelId ? (
        <DuelArena duelId={duelId} onLeave={() => setDuelId(null)} />
      ) : (
        <DuelLobbies onEnter={setDuelId} />
      )}
    </div>
  );
}
