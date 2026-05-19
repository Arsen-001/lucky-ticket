import { Crown, Star, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';

interface RewardTier {
  key: string;
  label: string;
  percent: number;
  icon: ReactNode;
  iconWrapClass: string;
  percentClass: string;
}

export const ReferralInfoSection = () => {
  const t = useAppTranslations();

  const tiers: RewardTier[] = [
    {
      key: 'regular',
      label: t('regular friends'),
      percent: GlobalConstants.referralPercentage,
      icon: <Users size={14} className="text-electric-pink" strokeWidth={2.4} />,
      iconWrapClass: 'bg-electric-pink/15',
      percentClass: 'text-success',
    },
    {
      key: 'telegram',
      label: t('telegram premium'),
      percent: GlobalConstants.telegramPremiumReferralPercentage,
      icon: <Star size={14} className="fill-gold text-gold" />,
      iconWrapClass: 'bg-gold/20',
      percentClass: 'text-gold',
    },
    {
      key: 'lucky-player',
      label: t('lucky player friends'),
      percent: GlobalConstants.luckyPlayerReferralPercentage,
      icon: <Crown size={14} className="text-electric-purple" strokeWidth={2.4} />,
      iconWrapClass: 'bg-electric-purple/20',
      percentClass: 'text-electric-purple',
    },
  ];

  return (
    <div
      className="shine-card relative overflow-hidden rounded-2xl p-3.5"
      style={{ ['--shine-card-accent' as string]: 'var(--color-electric-pink)' }}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-pink-secondary text-xs font-bold uppercase tracking-wider">
          {t('rewards explained')}
        </h3>
        <span className="text-pink-secondary text-[10px]">{t('from their claimed tickets')}</span>
      </div>

      <ul className="flex flex-col">
        {tiers.map((tier, index) => (
          <li
            key={tier.key}
            className={twMerge(
              'flex items-center gap-2.5 py-2',
              index !== tiers.length - 1 && 'border-b border-white/5'
            )}
          >
            <div
              className={twMerge(
                'flex-center h-7 w-7 flex-shrink-0 rounded-lg',
                tier.iconWrapClass
              )}
            >
              {tier.icon}
            </div>
            <span className="text-white-secondary flex-1 truncate text-sm font-semibold">
              {tier.label}
            </span>
            <span
              className={twMerge(
                'text-base font-extrabold leading-none tabular-nums',
                tier.percentClass
              )}
            >
              +{tier.percent}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
