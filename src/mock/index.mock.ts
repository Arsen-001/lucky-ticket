import meMock from '@/mock/me.mock';

export const mockData = {
  ...meMock,
} as const;

export type MockData = typeof mockData;
export type MockDataKeys = keyof MockData;
