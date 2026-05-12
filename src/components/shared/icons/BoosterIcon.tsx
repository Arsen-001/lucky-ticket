'use client';
import { ChipIcon, type ChipIconProps } from './ChipIcon';

export type BoosterIconProps = Omit<ChipIconProps, 'temporary'>;

export function BoosterIcon(props: BoosterIconProps) {
  return <ChipIcon {...props} temporary />;
}
