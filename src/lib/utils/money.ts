import { defaultCurrency } from '@/config/stationDefaults';
import type { Currency } from '@/types/common';

export function formatMoney(
  amount: number,
  currency: Currency = defaultCurrency
): string {
  return `${currency.symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  })}`;
}

export function parseMoney(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatVolume(liters: number): string {
  return `${liters.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} L`;
}

export function calculateVariance(expected: number, actual: number): number {
  return actual - expected;
}

export function calculateVariancePercent(expected: number, actual: number): number {
  if (expected === 0) return 0;
  return ((actual - expected) / expected) * 100;
}
