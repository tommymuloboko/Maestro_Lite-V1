import type { ShiftVariance } from '@/types/shifts';
import type { FuelTransaction } from '@/types/fuel';
import type { ShiftPayment } from '@/types/shifts';

export function calculateExpectedTotal(transactions: FuelTransaction[]): number {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

export function calculateDeclaredTotal(payments: ShiftPayment[]): number {
  return payments.reduce((sum, p) => sum + p.declaredAmount, 0);
}

export function calculateCountedTotal(payments: ShiftPayment[]): number {
  return payments.reduce((sum, p) => sum + p.countedAmount, 0);
}

export function calculateShiftVariance(
  transactions: FuelTransaction[],
  payments: ShiftPayment[]
): ShiftVariance {
  const expected = calculateExpectedTotal(transactions);
  const declared = calculateDeclaredTotal(payments);
  const counted = calculateCountedTotal(payments);
  const variance = counted - expected;
  const variancePercent = expected !== 0 ? (variance / expected) * 100 : 0;

  return {
    totalExpected: expected,
    totalDeclared: declared,
    totalCounted: counted,
    variance,
    variancePercent,
  };
}

export function groupByFuelType(transactions: FuelTransaction[]) {
  return transactions.reduce(
    (acc, tx) => {
      if (!acc[tx.fuelType]) {
        acc[tx.fuelType] = { volume: 0, amount: 0, count: 0 };
      }
      acc[tx.fuelType].volume += tx.volume;
      acc[tx.fuelType].amount += tx.amount;
      acc[tx.fuelType].count += 1;
      return acc;
    },
    {} as Record<string, { volume: number; amount: number; count: number }>
  );
}
