import { HomeEnginesSlider } from '@/components/pages/tabs/home/HomeEnginesSlider';
import { HomeUpcomingTournaments } from '@/components/pages/tabs/home/HomeUpcomingTournaments';
import { HomeJackpotButton } from '@/components/pages/tabs/home/HomeJackpotButton';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-5 pt-3 pb-6">
      <HomeJackpotButton />
      <HomeUpcomingTournaments />

      <section className="flex flex-col gap-2">
        <HomeEnginesSlider />
      </section>
    </div>
  );
}
