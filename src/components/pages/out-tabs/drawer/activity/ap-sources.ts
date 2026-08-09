import {
  CalendarCheck,
  CalendarDays,
  Clapperboard,
  Coins,
  Flame,
  Heart,
  ListChecks,
  type LucideIcon,
  MailCheck,
  Send,
  ShoppingBag,
  Swords,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import {
  GlobalConstants,
  activityTierOrder,
  type ActivityTier,
} from '@/constants/global.constants';
import { routes, type Route } from '@/constants/routes';
import type { MessageIds } from '@/types/types/i18n.types';

export type ApCategory = 'base' | 'social' | 'tournament' | 'spend';

export interface ApSource {
  id: string;
  category: ApCategory;
  Icon: LucideIcon;
  labelKey: MessageIds;
  /** AP display (e.g. "+3", "+1–5"); empty when shown via `apFallbackKey`. */
  ap: string;
  apFallbackKey?: MessageIds;
  hintKey: MessageIds;
  hintParams?: Record<string, number | string>;
  /** Screen where the player performs this action to earn the AP. */
  route: Route;
  /** Extra query appended after `?highlight=` (e.g. `frequency=weekly`). */
  query?: string;
}

const { apRewards, inviteActivityPoints } = GlobalConstants;

/** Renders a tiered rate as a "+min–max" range across Bronze→Diamond. */
const tierRange = (byTier: Record<ActivityTier, number>): string => {
  const first = byTier[activityTierOrder[0]];
  const last = byTier[activityTierOrder[activityTierOrder.length - 1]];
  return `+${first}–${last}`;
};

/**
 * Every way a player earns AP, in one place — the list screen, the variants
 * that show only the best few, and the grid all read from here so a rate can
 * never say one thing in one shape and another in the next.
 */
export const AP_SOURCES: ApSource[] = [
  {
    id: 'streak',
    category: 'base',
    Icon: Flame,
    labelKey: 'ap source streak',
    ap: `+${apRewards.dailyStreak}`,
    hintKey: 'once per day',
    route: routes.tasks,
  },
  {
    id: 'dailyTask',
    category: 'base',
    Icon: CalendarCheck,
    labelKey: 'ap source daily task',
    ap: tierRange(apRewards.dailyTaskByTier),
    hintKey: 'by task tier',
    route: routes.tasks,
    query: 'frequency=daily',
  },
  {
    id: 'weeklyTask',
    category: 'base',
    Icon: CalendarDays,
    labelKey: 'ap source weekly task',
    ap: tierRange(apRewards.weeklyTaskByTier),
    hintKey: 'by task tier',
    route: routes.tasks,
    query: 'frequency=weekly',
  },
  {
    id: 'oneTimeTask',
    category: 'base',
    Icon: ListChecks,
    labelKey: 'ap source one-time task',
    ap: '',
    apFallbackKey: 'varies',
    hintKey: 'once per task',
    route: routes.tasks,
    query: 'frequency=once',
  },
  {
    id: 'verifyEmail',
    category: 'base',
    Icon: MailCheck,
    labelKey: 'ap source verify email',
    ap: `+${apRewards.verifyEmail}`,
    hintKey: 'one-time',
    route: routes.settings.email,
  },
  {
    id: 'watchVideo',
    category: 'base',
    Icon: Clapperboard,
    labelKey: 'ap source watch video',
    ap: `+${apRewards.watchVideo}`,
    hintKey: 'up to {n} per day',
    hintParams: { n: apRewards.watchVideoDailyLimit },
    route: routes.tasks,
  },
  {
    id: 'sendTicket',
    category: 'social',
    Icon: Send,
    labelKey: 'ap source send ticket',
    ap: `+${apRewards.sendTicket}`,
    hintKey: 'up to {n} per day',
    hintParams: { n: apRewards.sendTicketDailyLimit },
    route: routes.inviteFriends,
  },
  {
    id: 'like',
    category: 'social',
    Icon: Heart,
    labelKey: 'ap source like',
    ap: `+${apRewards.likeProfile}`,
    hintKey: 'up to {n} per day',
    hintParams: { n: apRewards.likeProfileDailyLimit },
    route: routes.leaderboard,
  },
  {
    id: 'invite',
    category: 'social',
    Icon: UserPlus,
    labelKey: 'ap source invite',
    ap: `+${inviteActivityPoints}`,
    hintKey: 'per friend invited',
    route: routes.inviteFriends,
  },
  {
    id: 'tournamentEntry',
    category: 'tournament',
    Icon: Swords,
    labelKey: 'ap source tournament entry',
    ap: tierRange(apRewards.tournamentJoinByTier),
    hintKey: 'by tournament tier',
    route: routes.tournaments.index,
  },
  {
    id: 'purchase',
    category: 'spend',
    Icon: ShoppingBag,
    labelKey: 'ap source purchase',
    ap: '+1',
    hintKey: 'per {n} ls no cap',
    hintParams: { n: apRewards.purchaseLsPerAp },
    route: routes.market(),
  },
  {
    id: 'spendLc',
    category: 'spend',
    Icon: Coins,
    labelKey: 'ap source spend lc',
    ap: '+1',
    hintKey: 'per {n} lc no cap',
    hintParams: { n: apRewards.spendLcPerAp.toLocaleString() },
    route: routes.market(),
  },
  {
    id: 'stake',
    category: 'spend',
    Icon: TrendingUp,
    labelKey: 'ap source stake',
    ap: '',
    apFallbackKey: 'by amount staked',
    hintKey: 'on stake completion',
    route: routes.stakes.index,
  },
];

export const AP_CATEGORY_ORDER: ApCategory[] = ['base', 'social', 'tournament', 'spend'];

export const AP_CATEGORY_LABEL: Record<ApCategory, MessageIds> = {
  base: 'ap category everyday',
  social: 'ap category social',
  tournament: 'ap category tournaments',
  spend: 'ap category spending',
};

/**
 * How much AP each capped recurring source can still pay in a day at this tier
 * — the same terms `dailyBaselineApByTier` is summed from, so "fastest today"
 * and the "~47 AP/day" caption can never disagree. Uncapped sources (purchases,
 * stakes) have no daily ceiling and are absent by design.
 */
export const apDailyCeilings = (
  tier: ActivityTier,
  watchVideoLimit: number
): Record<string, number> => ({
  watchVideo: apRewards.watchVideo * watchVideoLimit,
  dailyTask: apRewards.dailyTaskByTier[tier] * apRewards.dailyTasksCountByTier[tier],
  weeklyTask: (apRewards.weeklyTaskByTier[tier] * apRewards.weeklyTasksCountByTier[tier]) / 7,
  sendTicket: apRewards.sendTicket * apRewards.sendTicketDailyLimit,
  like: apRewards.likeProfile * apRewards.likeProfileDailyLimit,
  streak: apRewards.dailyStreak,
});

/** The catalogue ordered by what pays fastest today; unranked sources keep their order, last. */
export const apSourcesByPace = (tier: ActivityTier, watchVideoLimit: number): ApSource[] => {
  const ceilings = apDailyCeilings(tier, watchVideoLimit);
  return [...AP_SOURCES].sort((a, b) => (ceilings[b.id] ?? -1) - (ceilings[a.id] ?? -1));
};

/** Where a source row sends the player, with the highlight the target screen reads. */
export const apSourceHref = (source: ApSource): Route =>
  `${source.route}?highlight=${source.id}${source.query ? `&${source.query}` : ''}` as Route;
