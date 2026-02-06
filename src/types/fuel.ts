import type { PaymentType } from './common';

export interface FuelType {
  id: string;
  name: string;
  code: string;
  color: string;
  unitPrice: number;
}

export interface FuelTransaction {
  id: string;
  transactionNumber: string;
  pumpId: string;
  nozzleId: string;
  fuelType: string;
  volume: number;
  unitPrice: number;
  amount: number;
  paymentType: PaymentType;
  attendantId?: string;
  shiftId?: string;
  timestamp: string;
  pts2TransactionId?: string;
  isVoided: boolean;
  voidReason?: string;
}

export interface FuelSalesFilters {
  startDate?: string;
  endDate?: string;
  pumpId?: string;
  fuelType?: string;
  paymentType?: PaymentType;
  attendantId?: string;
  shiftId?: string;
}

export interface FuelSalesSummary {
  totalVolume: number;
  totalAmount: number;
  transactionCount: number;
  byFuelType: Record<string, { volume: number; amount: number; count: number }>;
  byPaymentType: Record<PaymentType, number>;
}
