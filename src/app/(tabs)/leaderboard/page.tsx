import { LeaderboardList } from '@/components/pages/tabs/leaderboard/LeaderboardList';
import { LeaderboardTop3 } from '@/components/pages/tabs/leaderboard/LeaderboardTop';

export default function LeaderboardPage() {
  return (
    <>
      <LeaderboardTop3 className="mt-5" />
      <LeaderboardList className=" flex-1" />
    </>
  );
}
