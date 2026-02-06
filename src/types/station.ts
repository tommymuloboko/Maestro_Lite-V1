export interface Station {
  id: string;
  name: string;
  address?: string;
  pts2Url: string;
  apiBaseUrl: string;
  currency: string;
  timezone: string;
}

export interface StationConfig {
  stationId: string;
  stationName: string;
  pts2Url: string;
  apiBaseUrl: string;
  currency: string;
}
