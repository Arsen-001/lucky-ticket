import { getAppTranslations } from '@/i18n/getAppTranslations';
import { HomeActiveStakeCard } from '@/components/pages/tabs/home/HomeActiveStakeCard';
import { HomeEnginesSlider } from '@/components/pages/tabs/home/HomeEnginesSlider';
import { HomeInviteCard } from '@/components/pages/tabs/home/HomeInviteCard';
import { HomeQuickActions } from '@/components/pages/tabs/home/HomeQuickActions';
import { HomeSectionHeader } from '@/components/pages/tabs/home/HomeSectionHeader';
import { HomeUpcomingTournaments } from '@/components/pages/tabs/home/HomeUpcomingTournaments';
import { routes } from '@/constants/routes';

export default async function HomePage() {
  const t = await getAppTranslations();

  return (
    <div className="flex flex-col gap-5 pt-3 pb-6">
      <HomeQuickActions />

      <section className="flex flex-col gap-2">
        <HomeSectionHeader
          title={t('your engines')}
          actionLabel={t('see all')}
          actionHref={routes.tickets.index}
        />
        <HomeEnginesSlider />
      </section>

      <HomeUpcomingTournaments />

      <HomeActiveStakeCard />

      <HomeInviteCard />
    </div>
  );
}
