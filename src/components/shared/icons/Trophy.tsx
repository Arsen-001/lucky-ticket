import { icons } from '@/constants/icons';
import Image, { type ImageProps } from 'next/image';

export type TrophyType = 'bronze' | 'silver' | 'gold';

export interface TrophyProps extends Omit<ImageProps, 'src' | 'alt'> {
  type: TrophyType;
}

export function Trophy({ type, width, height, ...rest }: TrophyProps) {
  const src = {
    bronze: icons.bronzeTrophy,
    silver: icons.silverTrophy,
    gold: icons.goldenTrophy,
  }[type];

  return (
    <Image
      {...rest}
      src={src}
      width={width}
      height={height}
      alt={`${type}-trophy`}
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
