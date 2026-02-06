import { useCallback } from 'react';
import { generateCsv, downloadCsv } from '@/lib/utils/csv';

interface CsvColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => string | number);
}

export function useExportCsv<T extends Record<string, unknown>>() {
  const exportToCsv = useCallback(
    (data: T[], columns: CsvColumn<T>[], filename: string) => {
      const csv = generateCsv(data, columns);
      const timestampedFilename = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCsv(csv, timestampedFilename);
    },
    []
  );

  return { exportToCsv };
}
