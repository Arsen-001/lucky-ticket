'use client';

import { Lock } from 'lucide-react';
import { Tabs } from '@/components/shared/Tabs';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';
import type { TierName } from '@/types/types/tier.types';

export type TournamentSubTab = 'general' | TierName | 'daily' | 'weekly' | 'monthly' | 'alltime';

const DEFAULT_TABS: TournamentSubTab[] = [
  'general',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
];

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

export interface TournamentSubTabsProps {
  active: TournamentSubTab;
  onChange: (next: TournamentSubTab) => void;
  /** Tier-tab keys whose tasks are locked for the current user (renders a lock icon). */
  lockedTabs?: TournamentSubTab[];
  /** Override the default tab set (e.g. omit 'bronze' for ticket sliders). */
  tabs?: TournamentSubTab[];
  className?: string;
}

export function TournamentSubTabs({
  active,
  onChange,
  lockedTabs = [],
  tabs = DEFAULT_TABS,
  className,
}: TournamentSubTabsProps) {
  const t = useAppTranslations();

  const renderTab = (tab: TournamentSubTab) => {
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
        onTabChange={key => onChange(key as TournamentSubTab)}
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
