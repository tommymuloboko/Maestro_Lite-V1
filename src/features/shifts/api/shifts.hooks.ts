/**
 * React Query hooks for Shifts.
 *
 * All hooks use the feature API layer which auto-resolves
 * mock vs real backend via the API adapter.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
  getShifts,
  getShift,
  startShift,
  endShift,
  verifyShift,
  getShiftRawTransactions,
  getShiftVerifiedTransactions,
  getShiftDeclaration,
  getShiftVerificationSummary,
} from '../api/shifts.api';
import type { StartShiftRequestDto, EndShiftRequestDto, VerifyShiftRequestDto, ShiftListFiltersDto } from '@/lib/api/dto';

// ─── Queries ─────────────────────────────────────────────────

export function useShifts(filters?: ShiftListFiltersDto) {
  return useQuery({
    queryKey: queryKeys.shifts.list(filters ?? {}),
    queryFn: () => getShifts(filters),
  });
}

export function useShift(id: string) {
  return useQuery({
    queryKey: queryKeys.shifts.detail(id),
    queryFn: () => getShift(id),
    enabled: !!id,
  });
}

export function useShiftRawTransactions(shiftId: string) {
  return useQuery({
    queryKey: [...queryKeys.shifts.detail(shiftId), 'rawTransactions'],
    queryFn: () => getShiftRawTransactions(shiftId),
    enabled: !!shiftId,
  });
}

export function useShiftVerifiedTransactions(shiftId: string) {
  return useQuery({
    queryKey: [...queryKeys.shifts.detail(shiftId), 'verifiedTransactions'],
    queryFn: () => getShiftVerifiedTransactions(shiftId),
    enabled: !!shiftId,
  });
}

export function useShiftDeclaration(shiftId: string) {
  return useQuery({
    queryKey: [...queryKeys.shifts.detail(shiftId), 'declaration'],
    queryFn: () => getShiftDeclaration(shiftId),
    enabled: !!shiftId,
  });
}

export function useShiftVerificationSummary(shiftId: string) {
  return useQuery({
    queryKey: [...queryKeys.shifts.detail(shiftId), 'verificationSummary'],
    queryFn: () => getShiftVerificationSummary(shiftId),
    enabled: !!shiftId,
  });
}

// ─── Mutations ───────────────────────────────────────────────

export function useStartShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: StartShiftRequestDto) => startShift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useEndShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EndShiftRequestDto }) => endShift(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useVerifyShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VerifyShiftRequestDto }) => verifyShift(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shifts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.fuelSales.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
