import type { ShiftPayment, ShiftVariance } from '@/types/shifts';
import type { FuelTransaction } from '@/types/fuel';

export function calculateShiftTotal(transactions: FuelTransaction[]): number {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

export function calculateShiftVolume(transactions: FuelTransaction[]): number {
  return transactions.reduce((sum, tx) => sum + tx.volume, 0);
}

export function calculatePaymentTotals(
  payments: ShiftPayment[]
): { declared: number; counted: number } {
  return payments.reduce(
    (acc, payment) => ({
      declared: acc.declared + payment.declaredAmount,
      counted: acc.counted + payment.countedAmount,
    }),
    { declared: 0, counted: 0 }
  );
}

export function calculateVariance(
  expected: number,
  payments: ShiftPayment[]
): ShiftVariance {
  const { declared, counted } = calculatePaymentTotals(payments);
  const variance = counted - expected;
  const variancePercent = expected !== 0 ? (variance / expected) * 100 : 0;

  return {
    totalDeclared: declared,
    totalCounted: counted,
    totalExpected: expected,
    variance,
    variancePercent,
  };
}

export function groupTransactionsByFuelType(
  transactions: FuelTransaction[]
): Record<string, { volume: number; amount: number }> {
  return transactions.reduce(
    (acc, tx) => {
      if (!acc[tx.fuelType]) {
        acc[tx.fuelType] = { volume: 0, amount: 0 };
      }
      acc[tx.fuelType].volume += tx.volume;
      acc[tx.fuelType].amount += tx.amount;
      return acc;
    },
    {} as Record<string, { volume: number; amount: number }>
  );
}

export function groupTransactionsByPaymentType(
  transactions: FuelTransaction[]
): Record<string, number> {
  return transactions.reduce(
    (acc, tx) => {
      const paymentType = tx.paymentType ?? 'unassigned';
      acc[paymentType] = (acc[paymentType] ?? 0) + tx.amount;
      return acc;
    },
    {} as Record<string, number>
  );
}
