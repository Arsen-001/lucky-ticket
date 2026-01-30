import { LeaderboardList } from '@/components/pages/tabs/leaderboard/LeaderboardList';
import { LeaderboardTop3 } from '@/components/pages/tabs/leaderboard/LeaderboardTop';
import { LeaderboardMyPlace } from '@/components/pages/tabs/leaderboard/LeaderboardMyPlace';

export default function LeaderboardPage() {
  return (
    <div className="h-full overflow-hidden inset-container-background flex flex-col">
      <div className="flex-1 overflow-auto scrollbar-hidden flex-col-stretch">
        <LeaderboardTop3 className="mt-5" />
        <LeaderboardList className=" flex-1" />
      </div>
      <LeaderboardMyPlace />
    </div>
  );
}
