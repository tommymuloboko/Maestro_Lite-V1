export type PumpStatus = 'idle' | 'authorized' | 'fueling' | 'offline' | 'error';

export interface Pump {
  id: string;
  number: number;
  name: string;
  status: PumpStatus;
  nozzles: Nozzle[];
  currentTransaction?: CurrentTransaction;
  lastUpdated: string;
}

export interface Nozzle {
  id: string;
  number: number;
  fuelType: string;
  fuelTypeId: string;
  totalizer: number;
}

export interface CurrentTransaction {
  volume: number;
  amount: number;
  fuelType: string;
  startTime: string;
}

export interface PumpTotals {
  pumpId: string;
  pumpNumber: number;
  totalVolume: number;
  totalAmount: number;
  transactionCount: number;
  byNozzle: Record<string, { volume: number; amount: number }>;
}
