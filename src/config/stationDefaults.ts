import type { PaymentType, Currency } from '@/types/common';

export const defaultCurrency: Currency = {
  code: 'ZMW',
  symbol: 'K',
  name: 'Zambian Kwacha',
  decimals: 2,
};

export const defaultPaymentTypes: PaymentType[] = [
  'cash',
  'card',
  'mobile',
  'credit',
];

export const paymentTypeLabels: Record<PaymentType, string> = {
  cash: 'Cash',
  card: 'Card',
  mobile: 'Mobile Money',
  credit: 'Credit',
  other: 'Other',
};
