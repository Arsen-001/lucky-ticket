import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { Star } from 'lucide-react';

export const ReferralInfoSection = () => {
  const t = useAppTranslations();

  return (
    <div className="flex flex-col gap-2.5 p-4 bg-purple-gradient rounded-2xl">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-lg font-bold">{t('invite friends')}</h3>
        <p className="text-sm text-gray-400">{t('get rewards description')}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between py-2.5 px-3 bg-white/5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{t('regular friends')}</span>
            <span className="text-xs text-gray-400">{t('from their claimed tickets')}</span>
          </div>
          <span className="text-lg font-semibold text-success">
            +{GlobalConstants.referralPercentage}%
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 px-3 bg-gold/10 rounded-xl border border-gold/20">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <Star size={13} className="fill-gold text-gold" />
              <span className="text-sm font-semibold text-gold">
                {t('telegram premium friends')}
              </span>
            </div>
            <span className="text-xs text-gray-400">{t('from their claimed tickets')}</span>
          </div>
          <span className="text-lg font-semibold text-gold">
            +{GlobalConstants.telegramPremiumReferralPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
};
