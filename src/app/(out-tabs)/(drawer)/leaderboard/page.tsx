import { ArrivalShine } from '@/components/shared/ArrivalShine';
import { LeaderboardContainer } from '@/components/pages/out-tabs/drawer/leaderboard/LeaderboardContainer';

export default function LeaderboardPage() {
  return (
    <ArrivalShine id="like" scroll={false}>
      <LeaderboardContainer />
    </ArrivalShine>
  );
}
