import { ArrivalShine } from '@/components/shared/ArrivalShine';
import { TestQuestContainer } from '@/components/pages/out-tabs/drawer/test-quest/TestQuestContainer';

export default function TestQuestPage() {
  return (
    <ArrivalShine id="test-quest" scroll={false}>
      <TestQuestContainer />
    </ArrivalShine>
  );
}
