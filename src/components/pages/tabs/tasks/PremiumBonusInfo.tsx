'use client';

import Image from 'next/image';
import { icons } from '@/constants/icons';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';

export function PremiumBonusInfo({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const t = useAppTranslations();

  return (
    <div
      style={style}
      className={twMerge(
        'flex justify-center items-start gap-1 bg-white/5 rounded-xl p-3',
        className
      )}
    >
      <Image src={icons.crown} alt="crown" height={14} className="object-contain" />
      <p className="text-sm font-semibold">
        <GoldenText className="font-semibold">{t('premium bonus')}: </GoldenText>
        {t('rewards bonus', { percent: 20 })}
      </p>
    </div>
  );
}
