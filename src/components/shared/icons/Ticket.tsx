import { icons } from '@/constants/icons';
import Image, { type ImageProps } from 'next/image';

export type TicketType = 'bronze' | 'silver' | 'gold' | 'diamond' | 'platinum';

export interface TicketProps extends Omit<ImageProps, 'src' | 'alt'> {
  type: TicketType;
}

export function Ticket({ type, width, height, ...rest }: TicketProps) {
  const src = {
    bronze: icons.bronzeTicket,
    silver: icons.silverTicket,
    gold: icons.goldenTicket,
    diamond: icons.diamondTicket,
    platinum: icons.platinumTicket,
  }[type];

  return (
    <Image
      {...rest}
      src={src}
      width={width}
      height={height}
      alt={`${type}-ticket`}
      loading="eager"
      style={{
        width,
        height,
        objectFit: 'contain',
        ...rest.style,
      }}
    />
  );
}
