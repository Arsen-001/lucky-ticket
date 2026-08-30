import { HomeEnginesSlider } from '@/components/pages/tabs/home/HomeEnginesSlider';
import { HomeUpcomingTournaments } from '@/components/pages/tabs/home/HomeUpcomingTournaments';
import { HomeJackpotBanner } from '@/components/pages/tabs/home/HomeJackpotBanner';
import { HomeTestQuestCard } from '@/components/pages/tabs/home/HomeTestQuestCard';
import { HomeGamesChip } from '@/components/pages/tabs/home/HomeGamesChip';
import { HomeTikkiSection } from '@/components/pages/tabs/home/HomeTikkiSection';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-5 pt-3 pb-6">
      {/* Поля и зазор тут уже, чем на остальной странице (10 px по бокам,
          6 px между плашками): третья плашка помещается в строку только так.
          Замер на 390: до поджатия заголовок тест-квеста терял 19 px и уходил
          в многоточие, после — читается целиком. */}
      <section className="flex items-stretch gap-1.5 px-2.5">
        <HomeJackpotBanner />
        <HomeTestQuestCard />
        <HomeGamesChip />
      </section>

      {/* Тикки на главной. Сам решает, показываться ли: стадия выката приходит
          с сервера, и до неё блок не рисуется вовсе. */}
      <HomeTikkiSection />

      {/* Pulled tight against its neighbours: the strip is 88px of card and the
          page's 20px rhythm around it read as two gaps rather than one block. */}
      <HomeUpcomingTournaments className="-my-2.5" />

      <section className="flex flex-col gap-2">
        <HomeEnginesSlider />
      </section>
    </div>
  );
}
