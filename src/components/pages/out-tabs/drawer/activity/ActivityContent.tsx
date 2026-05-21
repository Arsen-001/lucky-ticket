'use client';

import { useGetMeQuery } from '@/api/me.api';
import { ActivityHeroCard } from '@/components/pages/out-tabs/drawer/activity/ActivityHeroCard';
import { ActivityDecayCard } from '@/components/pages/out-tabs/drawer/activity/ActivityDecayCard';
import { ActivitySourcesList } from '@/components/pages/out-tabs/drawer/activity/ActivitySourcesList';
import { ActivityTierPerks } from '@/components/pages/out-tabs/drawer/activity/ActivityTierPerks';

export function ActivityContent() {
  const { data: me, isLoading } = useGetMeQuery();

  return (
    <div className="flex flex-col gap-4 pb-10">
      <ActivityHeroCard activityPoints={me?.activityPoints} loading={isLoading} />
      <ActivityDecayCard lastActivityAt={me?.lastActivityAt} activityPoints={me?.activityPoints} />
      <ActivitySourcesList activityPoints={me?.activityPoints} />
      <ActivityTierPerks activityPoints={me?.activityPoints} />
    </div>
  );
}
