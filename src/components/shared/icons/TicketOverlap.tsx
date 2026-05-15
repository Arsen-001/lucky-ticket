'use client';
import { icons } from '@/constants/icons';
import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { getRandomNumber } from '@/utils/global/number.utils';
import { twMerge } from 'tailwind-merge';
import type { TicketType } from '@/types/types/ticket.types';

export interface TicketOverlapProps extends Omit<
  ImageProps,
  'src' | 'alt' | 'loading' | 'fill' | 'className' | 'style'
> {
  type: TicketType;
  loading?: boolean;
  nextLoading?: ImageProps['loading'];
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
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
  className,
  style,
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

  const sizes = typeof width === 'number' ? `${width}px` : undefined;

  return (
    <span
      className={twMerge('relative inline-block shrink-0', className, loading && 'animation-blink')}
      style={{ width, height, ...style }}
    >
      <Image
        {...rest}
        fill
        sizes={sizes}
        src={loading ? values[ticketTypeIndex] : ticketOverlapSources[type]}
        alt={`${type}-ticket-overlap`}
        loading={nextLoading}
        style={{ objectFit: 'contain' }}
      />
    </span>
  );
}
