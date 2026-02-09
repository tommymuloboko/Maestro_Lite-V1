export interface Station {
  id: string;
  name: string;
  address?: string;
  currency: string;
  timezone: string;
}

export interface StationConfig {
  stationId: string;
  stationName: string;
  currency: string;
}
