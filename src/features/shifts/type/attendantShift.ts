export type UUID = string;

export type ShiftUiStatus = 'active' | 'ended' | 'pending_verification' | 'verified' | 'disputed';

export interface Attendant {
  id: UUID;
  attendant_no: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  employee_id: UUID;
  company_id: UUID;
  station_id: UUID;
  // optional joined
  attendant_name?: string;
}

export interface AttendantTag {
  id: UUID;
  attendant_id: UUID;
  station_id: UUID;
  tag_number: string;
  is_active: boolean;
  issued_at: string;
  revoked_at: string | null;
  attendant_no?: string;
  attendant_name?: string;
}

export interface Shift {
  id: UUID;
  company_id: UUID;
  station_id: UUID;
  attendant_id: UUID;
  tag_number: string;
  started_at: string;
  ended_at: string | null;

  is_open: boolean;
  is_ended: boolean;
  is_pending_verification: boolean;
  is_verified: boolean;
  is_disputed: boolean;

  opened_by_user_id?: UUID;
  created_at?: string;

  // joined (from backend)
  attendant_no?: string;
  attendant_name?: string;
}

export interface TransactionSummary {
  transaction_count: number;
  total_amount: number;
  verified_count: number;
}

export interface CloseDeclaration {
  id: UUID;
  shift_id: UUID;
  currency: string;
  declared_total: number;
  declared_cash: number;
  declared_card: number;
  declared_debtors: number;
  declared_other: Record<string, unknown>;
  submitted_at: string;
}

export interface VerificationResult {
  id: UUID;
  shift_id: UUID;
  computed_total: number;
  declared_total: number;
  verified_total: number;
  variance_amount: number;
  currency: string;
  is_verified: boolean;
  is_disputed: boolean;
  notes?: string;
  verified_by_user_id: UUID;
  verified_at: string;
}

export interface ShiftDetails {
  shift: Shift;
  close_declaration: CloseDeclaration | null;
  verification_summary: VerificationResult | null;
  transaction_summary: TransactionSummary;
}

export interface ApiEnvelope<T> {
  error: boolean;
  data: T;
  message?: string;
}
