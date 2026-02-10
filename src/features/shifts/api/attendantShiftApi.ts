/**
 * API wrapper for the attendant-shift lifecycle.
 *
 * Uses the shared `api` client – no custom HTTP logic.
 * All endpoints confirmed working against maestro-lite.onrender.com.
 */

import type {
  ApiEnvelope,
  Attendant,
  AttendantTag,
  CloseDeclaration,
  Shift,
  ShiftDetails,
  VerificationResult,
} from '../types/attendantShifts';

import { api } from '@/lib/api/client';
import { getStoredStationId, getStoredUser } from '@/lib/storage/secureStore';

// ─── Helpers ────────────────────────────────────────────────

function getStationId(): string | null {
  return getStoredUser()?.stationId ?? getStoredStationId() ?? null;
}

// ─── API ────────────────────────────────────────────────────

export const attendantShiftsApi = {
  // ── Attendants ──────────────────────────────────────────────

  /** GET /api/attendants */
  getAttendants: async (params?: { limit?: number; offset?: number }) => {
    const res = await api.get<{ success: boolean; count: number; attendants: Attendant[] }>(
      '/attendants',
      { params: { limit: params?.limit ?? 100, offset: params?.offset ?? 0 } }
    );
    return {
      success: true as const,
      count: res.count ?? res.attendants?.length ?? 0,
      attendants: res.attendants ?? [],
    };
  },

  // ── Attendant Tags ─────────────────────────────────────────

  /** GET /api/attendant-tags */
  getAttendantTags: async () => {
    const res = await api.get<ApiEnvelope<AttendantTag[]>>('/attendant-tags');
    return res;
  },

  /** GET /api/attendant-tags/:tagId */
  getTagById: async (tagId: string) => {
    return api.get<ApiEnvelope<AttendantTag>>(`/attendant-tags/${tagId}`);
  },

  /** POST /api/attendant-tags */
  createTag: async (body: {
    attendant_id: string;
    station_id: string;
    tag_number: string;
  }) => {
    return api.post<ApiEnvelope<AttendantTag>>('/attendant-tags', body);
  },

  /** POST /api/attendant-tags/:tagId/revoke */
  revokeTag: async (tagId: string) => {
    return api.post<ApiEnvelope<AttendantTag>>(`/attendant-tags/${tagId}/revoke`);
  },

  /** POST /api/attendant-tags/:tagId/activate */
  activateTag: async (tagId: string) => {
    return api.post<ApiEnvelope<AttendantTag>>(`/attendant-tags/${tagId}/activate`);
  },

  // ── Attendant Shifts ───────────────────────────────────────

  /** GET /api/stations/{stationId}/attendant-shifts */
  listShifts: async (params?: { limit?: number; offset?: number }) => {
    const stationId = getStationId();
    if (!stationId) {
      console.warn('[attendantShiftsApi] No stationId — cannot list shifts');
      return { success: true as const, count: 0, shifts: [] as Shift[] };
    }

    const res = await api.get<{ success: boolean; count: number; shifts: Shift[] }>(
      `/stations/${stationId}/attendant-shifts`,
      { params: { limit: params?.limit ?? 100, offset: params?.offset ?? 0 } }
    );
    return {
      success: true as const,
      count: res.count ?? res.shifts?.length ?? 0,
      shifts: res.shifts ?? [],
    };
  },

  /** GET /api/attendant-shifts/:shiftId */
  getShiftDetails: (shiftId: string) =>
    api.get<{ error: false; data: ShiftDetails }>(`/attendant-shifts/${shiftId}`),

  /** POST /api/attendant-shifts/open */
  openShift: (body: {
    company_id: string;
    station_id: string;
    attendant_id: string;
    tag_number: string;
    opened_by_user_id: string;
  }) =>
    api.post<ApiEnvelope<Shift>>('/attendant-shifts/open', body),

  /** POST /api/attendant-shifts/:shiftId/end */
  endShift: (shiftId: string, body: { ended_by_user_id: string; notes?: string }) =>
    api.post<ApiEnvelope<Shift>>(`/attendant-shifts/${shiftId}/end`, body),

  /** POST /api/attendant-shifts/:shiftId/close-declaration */
  submitCloseDeclaration: (
    shiftId: string,
    body: {
      declared_cash: number;
      declared_card: number;
      declared_debtors: number;
      declared_other: Record<string, unknown>;
      declared_total: number;
      currency: string;
    }
  ) =>
    api.post<ApiEnvelope<CloseDeclaration>>(`/attendant-shifts/${shiftId}/close-declaration`, body),

  /** GET /api/attendant-shifts/:shiftId/close-declaration */
  getCloseDeclaration: (shiftId: string) =>
    api.get<ApiEnvelope<CloseDeclaration>>(`/attendant-shifts/${shiftId}/close-declaration`),

  /** POST /api/attendant-shifts/:shiftId/verify */
  verifyShift: (
    shiftId: string,
    body: { verified_by_user_id: string; verified_total: number; is_disputed: boolean; notes?: string }
  ) =>
    api.post<ApiEnvelope<VerificationResult>>(`/attendant-shifts/${shiftId}/verify`, body),

  /** POST /api/attendant-shifts/:shiftId/dispute */
  disputeShift: (
    shiftId: string,
    body: { disputed_by_user_id: string; notes?: string }
  ) =>
    api.post<ApiEnvelope<unknown>>(`/attendant-shifts/${shiftId}/dispute`, body),

  /** GET /api/attendant-shifts/:shiftId/verification */
  getVerification: (shiftId: string) =>
    api.get<ApiEnvelope<VerificationResult>>(`/attendant-shifts/${shiftId}/verification`),
};
