import type { Tank, TankDeliveryEvent, TankStatus, TankTrendPoint } from '@/types/tanks';

interface SimTankState extends Tank {
  __drift?: number;
  __alarmHold?: number;
}

interface ProductPreset {
  fuelType: string;
  fuelTypeId: string;
  capacity: number;
}

const products: ProductPreset[] = [
  { fuelType: 'Diesel', fuelTypeId: 'diesel', capacity: 30_000 },
  { fuelType: 'Unleaded Petrol', fuelTypeId: 'petrol', capacity: 25_000 },
  { fuelType: 'Premium Petrol', fuelTypeId: 'premium', capacity: 20_000 },
];

function nowIso(): string {
  return new Date().toISOString();
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function maybe(probability: number): boolean {
  return Math.random() < probability;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function toStatus(alarmType: string): TankStatus {
  switch (alarmType) {
    case 'low':
      return 'low';
    case 'critical':
      return 'critical';
    case 'overfill':
      return 'overfill';
    case 'offline':
      return 'offline';
    case 'sensor_fault':
      return 'sensor_fault';
    case 'water_detected':
      return 'water_detected';
    default:
      return 'normal';
  }
}

function createDeliveryEvent(tankId: string, volumeBefore: number, volumeDelivered: number, at: Date): TankDeliveryEvent {
  const start = new Date(at);
  const end = new Date(start.getTime() + 12 * 60 * 1000);
  const volumeAfter = clamp(volumeBefore + volumeDelivered, 0, Number.MAX_SAFE_INTEGER);

  return {
    id: `DEL-${tankId}-${start.getTime()}`,
    tankId,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    volumeBefore: round1(volumeBefore),
    volumeAfter: round1(volumeAfter),
    volumeDelivered: round1(volumeDelivered),
  };
}

function seedDeliveries(tankId: string, currentVolume: number): TankDeliveryEvent[] {
  const now = new Date();
  const count = maybe(0.32) ? 1 : maybe(0.14) ? 2 : 0;
  const deliveries: TankDeliveryEvent[] = [];

  for (let index = 0; index < count; index += 1) {
    const at = new Date(now);
    at.setHours(Math.floor(rand(2, 22)), Math.floor(rand(0, 59)), 0, 0);
    const delivered = rand(1800, 9500);
    deliveries.push(createDeliveryEvent(tankId, currentVolume - delivered, delivered, at));
  }

  return deliveries.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

function determineAlarm(tank: SimTankState): { status: TankStatus; type: string; message: string } {
  const level = tank.currentLevel;
  const water = tank.waterHeight;

  if (water > 35 && maybe(0.25)) {
    return { status: 'water_detected', type: 'water_detected', message: 'High water level detected in tank' };
  }

  if (maybe(0.006)) {
    return { status: 'sensor_fault', type: 'sensor_fault', message: 'ATG sensor fault detected' };
  }

  if (maybe(0.004)) {
    return { status: 'offline', type: 'offline', message: 'ATG connection lost' };
  }

  if (level < tank.criticalThreshold || (level < tank.criticalThreshold + 2 && maybe(0.35))) {
    return { status: 'critical', type: 'critical', message: 'Tank volume is in critical range' };
  }

  if (level < tank.lowThreshold) {
    return { status: 'low', type: 'low', message: 'Tank volume below low threshold' };
  }

  if (level > tank.highThreshold + 2 && maybe(0.45)) {
    return { status: 'overfill', type: 'overfill', message: 'Tank level approaching overfill threshold' };
  }

  return { status: 'normal', type: 'normal', message: '' };
}

export function createInitialSimTanks(): Tank[] {
  return products.map((product, index) => {
    const capacity = product.capacity;
    const currentVolume = Math.round(rand(capacity * 0.35, capacity * 0.85));
    const currentLevel = Math.round((currentVolume / capacity) * 100);
    const waterHeight = maybe(0.12) ? Math.round(rand(4, 42)) : 0;
    const id = `SIM-T${index + 1}`;

    const tank: SimTankState = {
      id,
      number: index + 1,
      name: `Tank ${index + 1}`,
      fuelType: product.fuelType,
      fuelTypeId: product.fuelTypeId,
      capacity,
      currentVolume,
      currentLevel,
      ullage: Math.max(0, capacity - currentVolume),
      temperature: round1(rand(18, 32)),
      productHeight: Math.round(rand(900, 2400)),
      waterHeight,
      status: 'normal',
      lowThreshold: 20,
      criticalThreshold: 10,
      highThreshold: 95,
      lastUpdated: nowIso(),
      atgSource: 'SIMULATOR',
      deliveries: seedDeliveries(id, currentVolume),
      alarms: [],
      __drift: rand(-8, 8),
      __alarmHold: 0,
    };

    return tank;
  });
}

export function tickSimTanks(prevTanks: Tank[]): Tank[] {
  const source = Array.isArray(prevTanks) ? prevTanks : [];

  return source.map((item) => {
    const tank = item as SimTankState;
    const drift = (tank.__drift ?? rand(-8, 8)) + rand(-2, 2);
    const delta = drift + rand(-6, 6);

    const deliveryTriggered = maybe(0.002);
    const deliveredVolume = deliveryTriggered ? Math.round(rand(900, 3600)) : 0;
    const nextVolume = clamp(round1(tank.currentVolume + delta + deliveredVolume), 0, tank.capacity);
    const nextLevel = Math.round((nextVolume / Math.max(1, tank.capacity)) * 100);
    const nextTemp = clamp(round1(tank.temperature + rand(-0.16, 0.16)), 10, 45);
    const nextWater = clamp(
      Math.round(
        tank.waterHeight + (maybe(0.02) ? rand(1, 4) : maybe(0.03) ? -rand(1, 2) : 0)
      ),
      0,
      120
    );

    const nextTank: SimTankState = {
      ...tank,
      currentVolume: nextVolume,
      ullage: Math.max(0, round1(tank.capacity - nextVolume)),
      currentLevel: nextLevel,
      temperature: nextTemp,
      waterHeight: nextWater,
      lastUpdated: nowIso(),
      __drift: drift,
      __alarmHold: Math.max(0, (tank.__alarmHold ?? 0) - 1),
    };

    if (deliveryTriggered) {
      const event = createDeliveryEvent(nextTank.id, tank.currentVolume, deliveredVolume, new Date());
      nextTank.deliveries = [...(nextTank.deliveries ?? []), event].slice(-8);
      nextTank.status = 'normal';
      nextTank.alarms = [];
      return nextTank;
    }

    const heldAlarm = nextTank.__alarmHold && nextTank.__alarmHold > 0 && nextTank.alarms.length > 0;
    if (heldAlarm) {
      nextTank.status = toStatus(nextTank.alarms[0].type);
      return nextTank;
    }

    const alarm = determineAlarm(nextTank);
    nextTank.status = alarm.status;

    if (alarm.status === 'normal') {
      nextTank.alarms = [];
      return nextTank;
    }

    nextTank.alarms = [
      {
        type: alarm.type,
        message: alarm.message,
        time: nowIso(),
      },
    ];
    nextTank.__alarmHold = 10;
    return nextTank;
  });
}

export function buildSimTankTrend(tank: Tank, points = 24): TankTrendPoint[] {
  const data: TankTrendPoint[] = [];
  const hours = Math.max(8, points);
  const now = new Date();
  const capacity = Math.max(1, tank.capacity);
  let volume = clamp(tank.currentVolume + rand(-capacity * 0.08, capacity * 0.08), 0, capacity);
  let temp = clamp(tank.temperature + rand(-1.5, 1.5), 10, 45);

  for (let index = hours - 1; index >= 0; index -= 1) {
    const timestamp = new Date(now.getTime() - index * 60 * 60 * 1000);
    volume = clamp(volume + rand(-220, 160), 0, capacity);
    temp = clamp(temp + rand(-0.4, 0.4), 10, 45);

    data.push({
      timestamp: timestamp.toISOString(),
      volume: round1(volume),
      temperature: round1(temp),
    });
  }

  if (data.length > 0) {
    data[data.length - 1] = {
      ...data[data.length - 1],
      volume: round1(tank.currentVolume),
      temperature: round1(tank.temperature),
    };
  }

  return data;
}
