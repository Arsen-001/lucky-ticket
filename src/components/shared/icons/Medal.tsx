'use client';
import { icons } from '@/constants/icons';
import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { getRandomNumber } from '@/utils/global/number.utils';
import { twMerge } from 'tailwind-merge';

export type MedalType = 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum';

export interface MedalProps extends Omit<ImageProps, 'src' | 'alt' | 'loading'> {
  type?: MedalType;
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

const BASE_WIDTH = 620;
const BASE_HEIGHT = 730;
const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;

export function Medal({
  type,
  width,
  height,
  nextLoading = 'eager',
  loading,
  duration = 3000,
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

  if (!type && !loading) return null;

  const numWidth = typeof width === 'number' ? width : parseFloat(width as string);
  const numHeight = typeof height === 'number' ? height : parseFloat(height as string);

  const hasWidth = !isNaN(numWidth);
  const hasHeight = !isNaN(numHeight);

  const finalWidth = hasWidth
    ? numWidth
    : hasHeight
      ? Math.round(numHeight * ASPECT_RATIO)
      : BASE_WIDTH;

  const finalHeight = hasHeight
    ? numHeight
    : hasWidth
      ? Math.round(numWidth / ASPECT_RATIO)
      : BASE_HEIGHT;

  return (
    <Image
      {...rest}
      src={loading ? values[ticketTypeIndex] : medalSources[type as MedalType]}
      width={finalWidth}
      height={finalHeight}
      alt={`${type}-medal`}
      loading={nextLoading}
      style={{
        objectFit: 'contain',
        ...rest.style,
        width: hasWidth ? width : hasHeight ? 'auto' : undefined,
        height: hasHeight ? height : hasWidth ? 'auto' : undefined,
        aspectRatio: `${finalWidth} / ${finalHeight}`,
      }}
      className={twMerge(rest.className, loading && 'animation-blink')}
    />
  );
}
