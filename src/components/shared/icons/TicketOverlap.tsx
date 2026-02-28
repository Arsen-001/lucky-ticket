'use client';
import { icons } from '@/constants/icons';
import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { getRandomNumber } from '@/utils/global/number.utils';
import { twMerge } from 'tailwind-merge';
import type { TicketType } from '@/types/types/ticket.types';

export interface TicketOverlapProps extends Omit<ImageProps, 'src' | 'alt' | 'loading'> {
  type: TicketType;
  loading?: boolean;
  nextLoading?: ImageProps['loading'];
  duration?: number;
}

const ticketOverlapSources = {
  bronze: icons.bronzeTicketOverlap,
  silver: icons.silverTicketOverlap,
  gold: icons.goldenTicketOverlap,
  diamond: icons.diamondTicketOverlap,
  platinum: icons.platinumTicketOverlap,
};

export function TicketOverlap({
  type,
  width,
  height,
  nextLoading = 'eager',
  loading,
  duration = 3000,
  ...rest
}: TicketOverlapProps) {
  const values = Object.values(ticketOverlapSources);
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
      src={loading ? values[ticketTypeIndex] : ticketOverlapSources[type]}
      width={width}
      height={height}
      alt={`${type}-ticket-overlap`}
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
