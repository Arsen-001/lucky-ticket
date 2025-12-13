'use client';
import { icons } from '@/constants/icons';
import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { getRandomNumber } from '@/utils/number.utils';
import { twMerge } from 'tailwind-merge';

export type MedalType = 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum';

export interface MedalProps extends Omit<ImageProps, 'src' | 'alt' | 'loading'> {
  type: MedalType;
  loading?: boolean;
  nextLoading?: ImageProps['loading'];
  duration?: number;
}

const medalSources = {
  bronze: icons.bronzeMedal,
  silver: icons.silverMedal,
  gold: icons.goldenMedal,
  diamond: icons.diamondMedal,
  platinum: icons.platinumMedal,
};

export function Medal({
  type,
  width,
  height,
  nextLoading = 'eager',
  loading,
  duration = 1800,
  ...rest
}: MedalProps) {
  const values = Object.values(medalSources);
  const valuesLength = values.length;

  const [ticketTypeIndex, setTicketTypeIndex] = useState(0);

  useEffect(() => {
    setTicketTypeIndex(getRandomNumber(0, valuesLength - 1));
  }, [valuesLength]);

  useEffect(() => {
    if (!loading) return;

    const oneItemDuration = duration / valuesLength;
    const interval = setInterval(() => {
      setTicketTypeIndex(prev => (prev + 1) % valuesLength);
    }, oneItemDuration);

    return () => clearInterval(interval);
  }, [loading, duration, valuesLength]);

  return (
    <Image
      {...rest}
      src={loading ? values[ticketTypeIndex] : medalSources[type]}
      width={width}
      height={height}
      alt={`${type}-medal`}
      loading={nextLoading}
      style={{
        width,
        height,
        objectFit: 'contain',
        ...rest.style,
      }}
      className={twMerge(rest.className, loading && 'animation-blink')}
    />
  );
}
