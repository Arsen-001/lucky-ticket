import { ArrivalShine } from '@/components/shared/ArrivalShine';
import { JackpotContainer } from '@/components/pages/out-tabs/drawer/jackpot/JackpotContainer';

export default function JackpotPage() {
  return (
    <ArrivalShine id="jackpot" scroll={false}>
      <JackpotContainer />
    </ArrivalShine>
  );
}
