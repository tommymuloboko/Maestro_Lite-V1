import { PrintLayout } from './PrintLayout';
import type { Shift, ShiftSummary } from '@/types/shifts';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { formatDateTime } from '@/lib/utils/dates';

interface ShiftPrintPackProps {
  shift: Shift;
  summary: ShiftSummary;
}

export function ShiftPrintPack({ shift, summary }: ShiftPrintPackProps) {
  return (
    <PrintLayout
      title={`Shift Report`}
      subtitle={`Attendant: ${shift.attendant?.name ?? 'Unknown'}`}
    >
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <strong>Start:</strong> {formatDateTime(shift.startTime)}
        </div>
        <div>
          <strong>End:</strong> {shift.endTime ? formatDateTime(shift.endTime) : 'Active'}
        </div>
      </div>

      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1">Metric</th>
            <th className="text-right py-1">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="py-1">Total Sales</td>
            <td className="text-right">{formatMoney(summary.totalAmount)}</td>
          </tr>
          <tr className="border-b">
            <td className="py-1">Total Volume</td>
            <td className="text-right">{formatVolume(summary.totalVolume)}</td>
          </tr>
          <tr className="border-b">
            <td className="py-1">Transactions</td>
            <td className="text-right">{summary.transactionCount}</td>
          </tr>
          {shift.variance && (
            <tr className="border-b">
              <td className="py-1">Variance</td>
              <td className="text-right">{formatMoney(shift.variance.variance)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </PrintLayout>
  );
}
