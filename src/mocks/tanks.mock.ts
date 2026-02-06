import type { Tank, TankTrendPoint, TankDeliveryEvent } from '@/types/tanks';

const tank1Delivery: TankDeliveryEvent = {
  id: 'del-1',
  tankId: '1',
  startTime: '2026-01-23T14:30:00Z',
  endTime: '2026-01-23T14:55:00Z',
  volumeBefore: 8500,
  volumeAfter: 13500,
  volumeDelivered: 5000,
};

export const mockTanks: Tank[] = [
  {
    id: '1',
    number: 1,
    name: 'Tank 1',
    fuelType: 'Diesel',
    fuelTypeId: 'diesel',
    capacity: 30000,
    currentVolume: 13586.9,
    currentLevel: 45,
    ullage: 16413.1,
    temperature: 18.9,
    productHeight: 2195,
    waterHeight: 0,
    status: 'normal',
    lowThreshold: 20,
    criticalThreshold: 10,
    highThreshold: 95,
    lastUpdated: '2026-01-23T18:33:04Z',
    atgSource: 'SIMULATOR',
    deliveries: [tank1Delivery],
    alarms: [],
  },
  {
    id: '2',
    number: 2,
    name: 'Tank 2',
    fuelType: 'Unleaded Petrol',
    fuelTypeId: 'petrol',
    capacity: 25000,
    currentVolume: 18259,
    currentLevel: 73,
    ullage: 6741,
    temperature: 18.8,
    productHeight: 1127,
    waterHeight: 0,
    status: 'normal',
    lowThreshold: 20,
    criticalThreshold: 10,
    highThreshold: 95,
    lastUpdated: '2026-01-23T18:33:04Z',
    atgSource: 'SIMULATOR',
    deliveries: [],
    alarms: [],
  },
  {
    id: '3',
    number: 3,
    name: 'Tank 3',
    fuelType: 'Premium Petrol',
    fuelTypeId: 'petrol',
    capacity: 20000,
    currentVolume: 7601.3,
    currentLevel: 38,
    ullage: 12398.7,
    temperature: 19.6,
    productHeight: 2109,
    waterHeight: 2,
    status: 'normal',
    lowThreshold: 20,
    criticalThreshold: 10,
    highThreshold: 95,
    lastUpdated: '2026-01-23T18:33:04Z',
    atgSource: 'SIMULATOR',
    deliveries: [],
    alarms: [
      {
        type: 'water_detected',
        message: 'Water detected in tank — 2 mm',
        time: '2026-01-23T17:12:00Z',
      },
    ],
  },
];

export function getMockTankById(id: string): Tank | undefined {
  return mockTanks.find((t) => t.id === id);
}

/**
 * Generate 24h of mock trend data for a given tank.
 * Produces a point every 15 minutes (96 points).
 * If the tank has a delivery, the trend shows a spike at delivery time.
 */
export function getMockTankTrend(tankId: string): TankTrendPoint[] {
  const tank = getMockTankById(tankId);
  if (!tank) return [];

  const now = new Date(tank.lastUpdated);
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const points: TankTrendPoint[] = [];

  const delivery = tank.deliveries[0];
  const deliveryStart = delivery ? new Date(delivery.startTime).getTime() : 0;
  const deliveryEnd = delivery ? new Date(delivery.endTime).getTime() : 0;

  // Walk backwards from current volume to estimate starting volume
  // Assume ~120 L/hr consumption rate for a realistic curve
  const consumptionPerInterval = 120 / 4; // 30 L per 15-min interval
  const totalConsumption = 96 * consumptionPerInterval; // ~2,880 L over 24h
  let startVolume = tank.currentVolume + totalConsumption;
  if (delivery) {
    startVolume -= delivery.volumeDelivered;
  }
  startVolume = Math.min(startVolume, tank.capacity * 0.92);

  let volume = startVolume;
  const baseTemp = tank.temperature;

  for (let i = 0; i < 96; i++) {
    const t = new Date(start.getTime() + i * 15 * 60 * 1000);
    const tMs = t.getTime();

    // Delivery spike
    if (delivery && tMs >= deliveryStart && tMs <= deliveryEnd) {
      const progress = (tMs - deliveryStart) / (deliveryEnd - deliveryStart);
      volume = delivery.volumeBefore + progress * delivery.volumeDelivered;
    } else {
      // Normal consumption with slight noise
      const noise = (Math.random() - 0.5) * 10;
      volume = Math.max(0, volume - consumptionPerInterval + noise);
    }

    // Temperature drifts slightly over day
    const tempVariation = Math.sin((i / 96) * Math.PI * 2) * 0.8;

    points.push({
      timestamp: t.toISOString(),
      volume: Math.round(volume * 10) / 10,
      temperature: Math.round((baseTemp + tempVariation) * 10) / 10,
    });
  }

  return points;
}
