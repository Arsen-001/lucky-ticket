import { ArrivalShine } from '@/components/shared/ArrivalShine';
import { TikkiContainer } from '@/components/pages/out-tabs/drawer/tikki/TikkiContainer';

export default function TikkiPage() {
  return (
    <ArrivalShine id="tikki" scroll={false}>
      <TikkiContainer />
    </ArrivalShine>
  );
}
