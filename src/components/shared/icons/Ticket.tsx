'use client';
import { icons } from '@/constants/icons';
import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { getRandomNumber } from '@/utils/global/number.utils';
import { twMerge } from 'tailwind-merge';

export type TicketType = 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum';

export interface TicketProps extends Omit<ImageProps, 'src' | 'alt' | 'loading'> {
  type: TicketType;
  loading?: boolean;
  nextLoading?: ImageProps['loading'];
  duration?: number;
}

const ticketSources = {
  bronze: icons.bronzeTicket,
  silver: icons.silverTicket,
  gold: icons.goldenTicket,
  diamond: icons.diamondTicket,
  platinum: icons.platinumTicket,
};

export function Ticket({
  type,
  width,
  height,
  nextLoading = 'eager',
  loading,
  duration = 3000,
  ...rest
}: TicketProps) {
  const values = Object.values(ticketSources);
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
      src={loading ? values[ticketTypeIndex] : ticketSources[type]}
      width={width}
      height={height}
      alt={`${type}-ticket`}
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
