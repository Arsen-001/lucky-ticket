import { LeaderboardList } from '@/components/pages/tabs/leaderboard/LeaderboardList';
import { LeaderboardTop3 } from '@/components/pages/tabs/leaderboard/LeaderboardTop';

export default function LeaderboardPage() {
  return (
    <div className="-mx-5 -mb-10">
      <LeaderboardTop3 className="animate-slide-in-bottom" style={{ animationDelay: '0ms' }} />
      <LeaderboardList
        className=" flex-1 animate-slide-in-bottom"
        style={{ animationDelay: '100ms' }}
      />
    </div>
  );
}
