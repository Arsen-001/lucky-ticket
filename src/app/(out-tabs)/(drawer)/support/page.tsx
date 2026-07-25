import { SupportChannelCard } from '@/components/pages/out-tabs/drawer/support/SupportChannelCard';
import { SupportFaqLink } from '@/components/pages/out-tabs/drawer/support/SupportFaqLink';
import { SupportHeroCard } from '@/components/pages/out-tabs/drawer/support/SupportHeroCard';
import { SupportIdCard } from '@/components/pages/out-tabs/drawer/support/SupportIdCard';
import { SupportSectionLabel } from '@/components/pages/out-tabs/drawer/support/SupportSectionLabel';
import { SupportTelegramCard } from '@/components/pages/out-tabs/drawer/support/SupportTelegramCard';
import { getAppTranslations } from '@/i18n/getAppTranslations';

export default async function SupportPage() {
  const t = await getAppTranslations();

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <SupportHeroCard className="animate-slide-in-bottom" style={{ animationDelay: '0ms' }} />

      <section className="flex flex-col gap-2">
        <SupportSectionLabel className="animate-slide-in-bottom" style={{ animationDelay: '60ms' }}>
          {t('get help')}
        </SupportSectionLabel>
        <SupportTelegramCard
          className="animate-slide-in-bottom"
          style={{ animationDelay: '120ms' }}
        />
        <SupportFaqLink className="animate-slide-in-bottom" style={{ animationDelay: '180ms' }} />
      </section>

      <section className="flex flex-col gap-2">
        <SupportSectionLabel
          className="animate-slide-in-bottom"
          style={{ animationDelay: '240ms' }}
        >
          {t('community')}
        </SupportSectionLabel>
        <SupportChannelCard
          className="animate-slide-in-bottom"
          style={{ animationDelay: '300ms' }}
        />
      </section>

      <SupportIdCard className="animate-slide-in-bottom" style={{ animationDelay: '360ms' }} />
    </div>
  );
}
