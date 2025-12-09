import type { ReactNode } from 'react';

export interface SkeletonWrapperProps {
  loading: boolean;
  children: ReactNode;
  skeleton: ReactNode;
}

export function SkeletonSuspense({
  loading,
  children,
  skeleton,
}: SkeletonWrapperProps) {
  return loading ? skeleton : children;
}
