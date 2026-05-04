'use client';

import { Lock } from 'lucide-react';
import { Tabs } from '@/components/shared/Tabs';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';
import type { TierName } from '@/types/types/tier.types';

/** Tier-based sub-tabs (Tournaments / Tickets / Engines / Stakes). */
export type TierSubTab = 'general' | TierName;

/** Period-based sub-tabs (Leaderboard). */
export type PeriodSubTab = 'daily' | 'weekly' | 'monthly' | 'alltime';

/** Union of every sub-tab kind the component may receive. */
export type TournamentSubTab = TierSubTab | PeriodSubTab;

const TIER_NAMES = ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const;
/** Type guard — narrows a TournamentSubTab to a TierName when applicable. */
export const isTierSubTab = (tab: TournamentSubTab): tab is TierName =>
  (TIER_NAMES as readonly string[]).includes(tab);

const DEFAULT_TABS: TierSubTab[] = ['general', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];

const LABEL_KEY: Record<TournamentSubTab, MessageIds> = {
  general: 'general',
  bronze: 'bronze',
  silver: 'silver',
  gold: 'gold',
  platinum: 'platinum',
  diamond: 'diamond',
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  alltime: 'all time',
};

const TIER_DOT: Record<TournamentSubTab, string> = {
  general: 'bg-electric-pink',
  bronze: 'bg-bronze',
  silver: 'bg-silver',
  gold: 'bg-gold',
  platinum: 'bg-platinum',
  diamond: 'bg-diamond',
  daily: 'bg-electric-pink',
  weekly: 'bg-teal',
  monthly: 'bg-electric-purple',
  alltime: 'bg-gold',
};

export interface TournamentSubTabsProps<T extends TournamentSubTab = TournamentSubTab> {
  active: T;
  onChange: (next: T) => void;
  /** Tier-tab keys whose tasks are locked for the current user (renders a lock icon). */
  lockedTabs?: T[];
  /** Override the default tab set (e.g. omit 'bronze' for ticket sliders). */
  tabs?: T[];
  className?: string;
}

export function TournamentSubTabs<T extends TournamentSubTab>({
  active,
  onChange,
  lockedTabs = [],
  tabs = DEFAULT_TABS as T[],
  className,
}: TournamentSubTabsProps<T>) {
  const t = useAppTranslations();

  const renderTab = (tab: T) => {
    const isLocked = lockedTabs.includes(tab);
    return (
      <span className="inline-flex items-center justify-center gap-1.5 leading-none">
        {isLocked ? (
          <Lock size={11} className="text-white/40 shrink-0" />
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TIER_DOT[tab]}`} />
        )}
        <span className="capitalize leading-none mt-[2px]">{t(LABEL_KEY[tab])}</span>
      </span>
    );
  };

  return (
    <div className={className}>
      <Tabs
        activeKey={active}
        onTabChange={key => onChange(key as T)}
        hideMountAnimation
        items={tabs.map(tab => ({
          key: tab,
          title: renderTab(tab),
        }))}
        classNames={{
          container: 'mx-4 !w-auto',
          tab: 'flex-1 !w-auto !text-xs !px-3 !py-1',
          scrollButtons: '!hidden',
        }}
      />
    </div>
  );
}
