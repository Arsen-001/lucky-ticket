'use client';

import {
  CalendarCheck,
  CalendarDays,
  ChevronRight,
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
  Ticket,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  GlobalConstants,
  activityTierOrder,
  computeDailyBaselineAp,
  type ActivityTier,
} from '@/constants/global.constants';
import { routes, type Route } from '@/constants/routes';
import type { MessageIds } from '@/types/types/i18n.types';

type ApCategory = 'base' | 'social' | 'tournament' | 'spend';

interface ApSource {
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

const SOURCES: ApSource[] = [
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
    id: 'claim',
    category: 'base',
    Icon: Ticket,
    labelKey: 'ap source claim',
    ap: tierRange(apRewards.claimByTier),
    hintKey: 'up to {n} per day',
    hintParams: { n: apRewards.claimDailyLimit },
    route: routes.tickets.index,
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

const CATEGORY_ORDER: ApCategory[] = ['base', 'social', 'tournament', 'spend'];

const CATEGORY_LABEL: Record<ApCategory, MessageIds> = {
  base: 'ap category everyday',
  social: 'ap category social',
  tournament: 'ap category tournaments',
  spend: 'ap category spending',
};

export interface ActivitySourcesListProps {
  activityPoints?: number;
}

export function ActivitySourcesList({ activityPoints = 0 }: ActivitySourcesListProps) {
  const t = useAppTranslations();
  const dailyBaseline = computeDailyBaselineAp(activityPoints);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <h2 className="text-base font-extrabold text-white">{t('how to earn ap')}</h2>
        <span className="text-pink-secondary text-[11px] font-bold">
          {t('~{n} AP per day without donation', { n: dailyBaseline })}
        </span>
      </div>

      {CATEGORY_ORDER.map(category => (
        <div key={category} className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            {t(CATEGORY_LABEL[category])}
          </span>
          {SOURCES.filter(s => s.category === category).map(source => (
            <Link
              key={source.id}
              href={`${source.route}?highlight=${source.id}${source.query ? `&${source.query}` : ''}`}
              className="bg-background-overlay flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-white/8 active:scale-99"
            >
              <div className="flex-center text-electric-pink h-9 w-9 shrink-0 rounded-lg bg-white/5">
                <source.Icon size={17} strokeWidth={2.2} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13px] font-bold text-white">
                  {t(source.labelKey)}
                </span>
                <span className="text-white-secondary text-[11px]">
                  {t(source.hintKey, source.hintParams)}
                </span>
              </div>
              <span className="text-success shrink-0 text-[13px] font-extrabold tabular-nums">
                {source.ap ? `${source.ap} AP` : t(source.apFallbackKey ?? 'varies')}
              </span>
              <ChevronRight size={15} className="shrink-0 text-white/25" />
            </Link>
          ))}
        </div>
      ))}
    </section>
  );
}
