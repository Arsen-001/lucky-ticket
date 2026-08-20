'use client';

import { DuelScreen } from '@/components/pages/out-tabs/tabs-extra/duel/DuelScreen';

/**
 * Раздел «Игры».
 *
 * Игра сейчас одна — дуэль, поэтому раздел открывается прямо ею: выбор из
 * одного пункта был бы лишним экраном на пути к матчу. Когда игр станет
 * больше, выбор вернётся сюда — сам гейт и пункт меню уже написаны так, что
 * им всё равно, сколько игр внутри.
 */
export function GamesScreen() {
  return <DuelScreen />;
}
