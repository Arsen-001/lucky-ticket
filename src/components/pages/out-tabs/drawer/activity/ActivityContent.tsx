'use client';

import { useGetMeQuery } from '@/api/me.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { ActivityHeroCard } from '@/components/pages/out-tabs/drawer/activity/ActivityHeroCard';
import { ActivityDecayCard } from '@/components/pages/out-tabs/drawer/activity/ActivityDecayCard';
import { ActivitySourcesList } from '@/components/pages/out-tabs/drawer/activity/ActivitySourcesList';
import { ActivityTierPerks } from '@/components/pages/out-tabs/drawer/activity/ActivityTierPerks';

export function ActivityContent() {
  const { data: me, isLoading, isError, refetch } = useGetMeQuery();

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex flex-col gap-4 pb-10">
      <ActivityHeroCard
        activityPoints={me?.activityPoints}
        referralsCount={me?.referralsCount}
        loading={isLoading}
      />
      <ActivityDecayCard
        lastActivityAt={me?.lastActivityAt}
        activityPoints={me?.activityPoints}
        referralsCount={me?.referralsCount}
      />
      <ActivitySourcesList activityPoints={me?.activityPoints} />
      <ActivityTierPerks activityPoints={me?.activityPoints} referralsCount={me?.referralsCount} />
    </div>
  );
}
