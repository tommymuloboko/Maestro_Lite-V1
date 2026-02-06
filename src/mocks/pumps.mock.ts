import type { Pump } from '@/types/pumps';

export const mockPumps: Pump[] = [
  {
    id: '1',
    number: 1,
    name: 'Pump 1',
    status: 'idle',
    nozzles: [
      { id: 'n1-1', number: 1, fuelType: 'Petrol', fuelTypeId: 'petrol', totalizer: 125430.5 },
    ],
    lastUpdated: '2026-02-06T11:00:00Z',
  },
  {
    id: '2',
    number: 2,
    name: 'Pump 2',
    status: 'fueling',
    nozzles: [
      { id: 'n2-1', number: 1, fuelType: 'Diesel', fuelTypeId: 'diesel', totalizer: 98210.3 },
      { id: 'n2-2', number: 2, fuelType: 'Diesel', fuelTypeId: 'diesel', totalizer: 45120.8 },
    ],
    currentTransaction: {
      volume: 23.5,
      amount: 559.3,
      fuelType: 'Diesel',
      startTime: '2026-02-06T11:25:00Z',
    },
    lastUpdated: '2026-02-06T11:25:30Z',
  },
  {
    id: '3',
    number: 3,
    name: 'Pump 3',
    status: 'idle',
    nozzles: [
      { id: 'n3-1', number: 1, fuelType: 'Petrol', fuelTypeId: 'petrol', totalizer: 87650.2 },
    ],
    lastUpdated: '2026-02-06T10:50:00Z',
  },
  {
    id: '4',
    number: 4,
    name: 'Pump 4',
    status: 'offline',
    nozzles: [
      { id: 'n4-1', number: 1, fuelType: 'Petrol', fuelTypeId: 'petrol', totalizer: 62300.0 },
    ],
    lastUpdated: '2026-02-05T16:00:00Z',
  },
];
