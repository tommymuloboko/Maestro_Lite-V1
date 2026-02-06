import { PrintLayout } from './PrintLayout';
import type { ReactNode } from 'react';

interface ReportPrintProps {
  title: string;
  dateRange?: { start: string; end: string };
  children: ReactNode;
}

export function ReportPrint({ title, dateRange, children }: ReportPrintProps) {
  return (
    <PrintLayout
      title={title}
      subtitle={dateRange ? `${dateRange.start} - ${dateRange.end}` : undefined}
    >
      {children}
    </PrintLayout>
  );
}
