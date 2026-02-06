export type TankStatus = 'normal' | 'low' | 'critical' | 'overfill' | 'offline' | 'sensor_fault' | 'water_detected';

export interface Tank {
  id: string;
  number: number;
  name: string;
  fuelType: string;
  fuelTypeId: string;
  capacity: number;
  currentVolume: number;
  currentLevel: number; // percentage
  ullage: number;
  temperature: number;
  productHeight: number;
  waterHeight: number;
  status: TankStatus;
  lowThreshold: number;
  criticalThreshold: number;
  highThreshold: number;
  lastUpdated: string;
  atgSource: string;
  deliveries: TankDeliveryEvent[];
  alarms: { type: string; message: string; time: string }[];
}

export interface TankReading {
  id: string;
  tankId: string;
  volume: number;
  level: number;
  temperature?: number;
  waterLevel?: number;
  timestamp: string;
}

export interface TankAlert {
  id: string;
  tankId: string;
  type: 'low' | 'critical' | 'overfill' | 'variance' | 'offline';
  message: string;
  severity: 'warning' | 'error' | 'critical';
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

export interface TankDelivery {
  id: string;
  tankId: string;
  volume: number;
  beforeLevel: number;
  afterLevel: number;
  deliveryDate: string;
  supplier?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface TankTrendPoint {
  timestamp: string;
  volume: number;
  temperature: number;
}

export interface TankDeliveryEvent {
  id: string;
  tankId: string;
  startTime: string;
  endTime: string;
  volumeBefore: number;
  volumeAfter: number;
  volumeDelivered: number;
}
