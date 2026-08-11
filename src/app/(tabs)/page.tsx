import { HomeEnginesSlider } from '@/components/pages/tabs/home/HomeEnginesSlider';
import { HomeUpcomingTournaments } from '@/components/pages/tabs/home/HomeUpcomingTournaments';
import { HomeJackpotBanner } from '@/components/pages/tabs/home/HomeJackpotBanner';
import { HomeTestQuestCard } from '@/components/pages/tabs/home/HomeTestQuestCard';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-5 pt-3 pb-6">
      <section className="flex items-stretch gap-3 px-4">
        <HomeJackpotBanner />
        <HomeTestQuestCard />
      </section>

      {/* Pulled tight against its neighbours: the strip is 88px of card and the
          page's 20px rhythm around it read as two gaps rather than one block. */}
      <HomeUpcomingTournaments className="-my-2.5" />

      <section className="flex flex-col gap-2">
        <HomeEnginesSlider />
      </section>
    </div>
  );
}
