import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { PrimeBadge } from '@/components/shared/badges/PrimeBadge';

export const ReferralInfoSection = () => {
  const t = useAppTranslations();

  return (
    <div className="flex flex-col gap-4 p-5 bg-purple-gradient rounded-2xl">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold">{t('invite friends')}</h3>
        <p className="text-sm text-gray-400">
          {t('get rewards description', {
            projectName: GlobalConstants.projectName,
          })}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{t('regular friends')}</span>
            <span className="text-xs text-gray-400">{t('from their earnings')}</span>
          </div>
          <span className="text-xl font-semibold text-success">
            +{GlobalConstants.referralPercentage}%
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gold/10 rounded-2xl border border-gold/20">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-gold">{t('prime friends')}</span>
              <PrimeBadge
                hideText
                className="p-0 h-4.5 w-4.5"
                classNames={{ icon: 'w-2.5 h-2.5' }}
              />
            </div>
            <span className="text-xs text-gray-400">{t('from their earnings')}</span>
          </div>
          <span className="text-xl font-semibold text-gold">
            +{GlobalConstants.primeReferralPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
};
