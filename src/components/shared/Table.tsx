'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

/* eslint-disable */
export interface ColumnType<RecordType> {
  title: React.ReactNode;
  dataIndex?: keyof RecordType;
  key?: string | number;
  render?: (value: any, record: RecordType, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface TableProps<RecordType> {
  columns: ColumnType<RecordType>[];
  dataSource: RecordType[];
  isLoading?: boolean;
  rowKey?: keyof RecordType | ((record: RecordType) => string | number);
  className?: string;
  emptyText?: React.ReactNode;
  loadingRows?: number;
}

const HeaderCell = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th
    className={twMerge(
      'max-w-[25vw] py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center truncate',
      className
    )}
  >
    {children}
  </th>
);

const BodyCell = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td
    className={twMerge(
      'py-4 px-4 text-sm font-semibold text-white text-center overflow-hidden',
      className
    )}
  >
    {children}
  </td>
);

export const Table = <RecordType extends object>({
  columns,
  dataSource,
  isLoading,
  rowKey,
  className,
  emptyText,
  loadingRows = 3,
}: TableProps<RecordType>) => {
  const getRowKey = (record: RecordType, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    if (rowKey) {
      return record[rowKey] as unknown as string | number;
    }
    return (record as any).id || (record as any).key || index;
  };

  return (
    <div className={twMerge('overflow-hidden bg-purple-gradient rounded-t-2xl', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              {columns.map((col, index) => (
                <HeaderCell key={col.key || String(index)} className={col.headerClassName}>
                  {col.title}
                </HeaderCell>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading
              ? Array.from({ length: loadingRows }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={columns.length} className="p-4">
                      <Skeleton />
                    </td>
                  </tr>
                ))
              : dataSource?.map((record, rowIndex) => (
                  <tr
                    key={getRowKey(record, rowIndex)}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {columns.map((col, colIndex) => {
                      const value = col.dataIndex ? record[col.dataIndex] : undefined;
                      return (
                        <BodyCell key={col.key || String(colIndex)} className={col.className}>
                          {col.render
                            ? col.render(value, record, rowIndex)
                            : (value as React.ReactNode)}
                        </BodyCell>
                      );
                    })}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!isLoading && !dataSource?.length && emptyText && (
        <div className="p-8 text-center text-gray-400">{emptyText}</div>
      )}
    </div>
  );
};
