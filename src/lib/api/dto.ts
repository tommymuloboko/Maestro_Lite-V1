// Data Transfer Objects for API requests/responses

import type { User, AuthTokens } from '@/types/auth';

// Auth DTOs
export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  user: User;
  tokens: AuthTokens;
}

// Shift DTOs
export interface StartShiftRequestDto {
  attendantId: string;
  pumpIds: string[];
  openingReadings: {
    pumpId: string;
    nozzleId: string;
    reading: number;
  }[];
}

export interface EndShiftRequestDto {
  closingReadings: {
    pumpId: string;
    nozzleId: string;
    reading: number;
  }[];
  payments: {
    paymentType: string;
    declaredAmount: number;
    countedAmount: number;
  }[];
  notes?: string;
}

// Dashboard DTOs
export interface DashboardSummaryDto {
  todaySales: number;
  todayVolume: number;
  activeShifts: number;
  unverifiedShifts: number;
  tankAlerts: number;
  pumpStatus: {
    online: number;
    offline: number;
    fueling: number;
  };
}

// List response wrapper
export interface ListResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
