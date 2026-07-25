'use client';

import type { CSSProperties } from 'react';
import { Megaphone } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { SupportActionRow } from './SupportActionRow';

export interface SupportChannelCardProps {
  className?: string;
  style?: CSSProperties;
}

export function SupportChannelCard({ className, style }: SupportChannelCardProps) {
  const t = useAppTranslations();

  return (
    <SupportActionRow
      icon={Megaphone}
      accent="purple"
      href={GlobalConstants.telegramChannelUrl}
      title={t('follow channel')}
      description={t('follow channel description')}
      className={className}
      style={style}
    />
  );
}
