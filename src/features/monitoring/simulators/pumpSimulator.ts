import type { Nozzle, Pump, PumpStatus } from '@/types/pumps';

type SimPumpStatus = Extract<PumpStatus, 'idle' | 'authorized' | 'fueling' | 'offline' | 'error'>;

interface ProductProfile {
  fuelType: string;
  fuelTypeId: string;
  pricePerLiter: number;
}

interface SimPumpState extends Pump {
  __targetVolume?: number;
  __flowRate?: number;
  __activeNozzleId?: string;
}

const products: ProductProfile[] = [
  { fuelType: 'Diesel', fuelTypeId: 'diesel', pricePerLiter: 28.5 },
  { fuelType: 'Unleaded Petrol', fuelTypeId: 'petrol', pricePerLiter: 27.0 },
  { fuelType: 'Premium Petrol', fuelTypeId: 'premium', pricePerLiter: 29.5 },
];

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function maybe(probability: number): boolean {
  return Math.random() < probability;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function nowIso(): string {
  return new Date().toISOString();
}

function toStatus(value: string): SimPumpStatus {
  if (value === 'authorized' || value === 'fueling' || value === 'offline' || value === 'error') {
    return value;
  }

  return 'idle';
}

function buildNozzles(pumpNumber: number): Nozzle[] {
  return [
    {
      id: `SIM-P${pumpNumber}-N1`,
      number: 1,
      fuelType: products[0].fuelType,
      fuelTypeId: products[0].fuelTypeId,
      totalizer: Math.round(rand(90_000, 180_000)),
    },
    {
      id: `SIM-P${pumpNumber}-N2`,
      number: 2,
      fuelType: products[1].fuelType,
      fuelTypeId: products[1].fuelTypeId,
      totalizer: Math.round(rand(90_000, 180_000)),
    },
  ];
}

export function createInitialSimPumps(count = 6): Pump[] {
  const initial: SimPumpState[] = [];

  for (let number = 1; number <= count; number += 1) {
    const status: SimPumpStatus = maybe(0.07) ? 'offline' : maybe(0.04) ? 'error' : 'idle';
    const nozzles = buildNozzles(number);

    initial.push({
      id: `SIM-P${number}`,
      number,
      name: `Pump ${number}`,
      status,
      nozzles,
      lastUpdated: nowIso(),
      currentTransaction: undefined,
      __targetVolume: undefined,
      __flowRate: undefined,
      __activeNozzleId: undefined,
    });
  }

  return initial;
}

function beginFueling(pump: SimPumpState): SimPumpState {
  const nozzle = pick(pump.nozzles);
  const product = products.find((p) => p.fuelTypeId === nozzle.fuelTypeId) ?? products[0];

  return {
    ...pump,
    status: 'fueling',
    currentTransaction: {
      fuelType: nozzle.fuelType,
      volume: 0,
      amount: 0,
      startTime: nowIso(),
    },
    __targetVolume: Number(rand(8, 60).toFixed(2)),
    __flowRate: Number(rand(0.28, 0.72).toFixed(3)),
    __activeNozzleId: nozzle.id,
    lastUpdated: nowIso(),
    nozzles: pump.nozzles.map((item) =>
      item.id === nozzle.id
        ? {
            ...item,
            fuelType: product.fuelType,
            fuelTypeId: product.fuelTypeId,
          }
        : item
    ),
  };
}

function recoverOrFault(pump: SimPumpState): SimPumpState {
  const status = toStatus(pump.status);

  if ((status === 'offline' || status === 'error') && maybe(0.08)) {
    return { ...pump, status: 'idle', lastUpdated: nowIso() };
  }

  if ((status === 'idle' || status === 'authorized') && maybe(0.003)) {
    return { ...pump, status: maybe(0.65) ? 'offline' : 'error', lastUpdated: nowIso() };
  }

  return pump;
}

function tickFueling(pump: SimPumpState): SimPumpState {
  if (!pump.currentTransaction) {
    return { ...pump, status: 'idle', __targetVolume: undefined, __flowRate: undefined, __activeNozzleId: undefined };
  }

  const activeNozzle = pump.nozzles.find((nozzle) => nozzle.id === pump.__activeNozzleId) ?? pump.nozzles[0];
  const product = products.find((item) => item.fuelTypeId === activeNozzle.fuelTypeId) ?? products[0];

  const flowRate = clamp(pump.__flowRate ?? rand(0.28, 0.72), 0.18, 0.9);
  const target = Math.max(1, pump.__targetVolume ?? rand(8, 60));
  const nextVolume = Number((pump.currentTransaction.volume + flowRate).toFixed(2));
  const cappedVolume = Math.min(target, nextVolume);
  const nextAmount = Number((cappedVolume * product.pricePerLiter).toFixed(2));
  const done = cappedVolume >= target - 0.02;

  const nextNozzles = pump.nozzles.map((nozzle) => {
    if (nozzle.id !== activeNozzle.id) {
      return nozzle;
    }

    const delta = cappedVolume - (pump.currentTransaction?.volume ?? 0);
    return {
      ...nozzle,
      totalizer: Number((nozzle.totalizer + Math.max(delta, 0)).toFixed(2)),
    };
  });

  if (done || maybe(0.02)) {
    return {
      ...pump,
      status: 'idle',
      currentTransaction: undefined,
      nozzles: nextNozzles,
      lastUpdated: nowIso(),
      __targetVolume: undefined,
      __flowRate: undefined,
      __activeNozzleId: undefined,
    };
  }

  return {
    ...pump,
    status: 'fueling',
    nozzles: nextNozzles,
    currentTransaction: {
      ...pump.currentTransaction,
      volume: cappedVolume,
      amount: nextAmount,
      fuelType: activeNozzle.fuelType,
    },
    __flowRate: clamp(flowRate + rand(-0.06, 0.06), 0.18, 0.9),
    lastUpdated: nowIso(),
  };
}

export function tickSimPumps(prevPumps: Pump[]): Pump[] {
  const source = Array.isArray(prevPumps) ? prevPumps : [];

  return source.map((pump) => {
    let next: SimPumpState = { ...(pump as SimPumpState) };

    next = recoverOrFault(next);

    if (next.status === 'offline' || next.status === 'error') {
      return { ...next, lastUpdated: nowIso() };
    }

    if (next.status === 'fueling') {
      return tickFueling(next);
    }

    if (next.status === 'authorized' && maybe(0.55)) {
      return beginFueling(next);
    }

    if (next.status === 'idle' && maybe(0.025)) {
      return { ...next, status: 'authorized', lastUpdated: nowIso() };
    }

    return { ...next, lastUpdated: nowIso() };
  });
}
