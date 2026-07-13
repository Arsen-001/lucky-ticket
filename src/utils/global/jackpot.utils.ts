import { appConfig } from '@/config/app.config';

/**
 * The jackpot pot split expressed as percentages of the WHOLE pot (DOCS §20).
 * By default the podium takes the whole pot (participants share 0) →
 * participants 0%, 1st 50%, 2nd 30%, 3rd 20%. Raising the participants share
 * (admin-tunable) carves out an equal consolation slice for every player.
 */
export const getJackpotWholePotSplit = () => {
  const { participantsSharePercent, podiumSharePercent, podiumSplitPercent } = appConfig.jackpot;
  return {
    participants: participantsSharePercent,
    first: (podiumSharePercent * podiumSplitPercent.first) / 100,
    second: (podiumSharePercent * podiumSplitPercent.second) / 100,
    third: (podiumSharePercent * podiumSplitPercent.third) / 100,
  };
};

export type TimeAgoKey = 'just now' | '{n}m ago' | '{n}h ago' | '{n}d ago';

/**
 * Relative "time ago" parts for the winners feed. The `Date.now()` math lives
 * here (a util) rather than in component render scope, so it doesn't trip the
 * React Compiler purity rule — the same pattern the rest of the app uses. The
 * caller maps `key`/`n` to a translation.
 */
export const getTimeAgo = (iso: string): { key: TimeAgoKey; n: number } => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return { key: 'just now', n: 0 };
  if (minutes < 60) return { key: '{n}m ago', n: minutes };
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { key: '{n}h ago', n: hours };
  return { key: '{n}d ago', n: Math.floor(hours / 24) };
};
