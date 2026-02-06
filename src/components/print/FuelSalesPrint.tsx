import { PrintLayout } from './PrintLayout';
import type { FuelTransaction } from '@/types/fuel';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { formatDateTime } from '@/lib/utils/dates';

interface FuelSalesPrintProps {
  transactions: FuelTransaction[];
  dateRange: { start: string; end: string };
}

export function FuelSalesPrint({ transactions, dateRange }: FuelSalesPrintProps) {
  const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.volume, 0);

  return (
    <PrintLayout
      title="Fuel Sales Report"
      subtitle={`${dateRange.start} - ${dateRange.end}`}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1">Time</th>
            <th className="text-left py-1">Pump</th>
            <th className="text-left py-1">Fuel</th>
            <th className="text-right py-1">Volume</th>
            <th className="text-right py-1">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b">
              <td className="py-1">{formatDateTime(tx.timestamp)}</td>
              <td className="py-1">{tx.pumpId}</td>
              <td className="py-1">{tx.fuelType}</td>
              <td className="text-right py-1">{formatVolume(tx.volume)}</td>
              <td className="text-right py-1">{formatMoney(tx.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={3} className="py-2">Total</td>
            <td className="text-right py-2">{formatVolume(totalVolume)}</td>
            <td className="text-right py-2">{formatMoney(total)}</td>
          </tr>
        </tfoot>
      </table>
    </PrintLayout>
  );
}
