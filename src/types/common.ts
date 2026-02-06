export type PaymentType = 'cash' | 'card' | 'mobile' | 'credit' | 'other';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
}
