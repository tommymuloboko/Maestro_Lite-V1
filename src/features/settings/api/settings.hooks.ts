/**
 * React Query hooks for Settings (attendants, tags, station config).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
  getStationConfig,
  getAttendants,
  createAttendant,
  updateAttendant,
  deleteAttendant,
  getAttendantTags,
  getPaymentTypes,
} from '../api/settings.api';
import type { Attendant } from '@/types/attendants';

/* ─── Queries ─── */

export function useStationConfig() {
  return useQuery({
    queryKey: queryKeys.settings.station(),
    queryFn: getStationConfig,
    staleTime: Infinity, // loaded once
  });
}

export function useAttendants() {
  return useQuery({
    queryKey: queryKeys.settings.attendants(),
    queryFn: getAttendants,
  });
}

export function useAttendantTags(attendantId: string) {
  return useQuery({
    queryKey: [...queryKeys.settings.attendants(), attendantId, 'tags'] as const,
    queryFn: () => getAttendantTags(attendantId),
    enabled: !!attendantId,
  });
}

export function usePaymentTypes() {
  return useQuery({
    queryKey: queryKeys.settings.paymentTypes(),
    queryFn: getPaymentTypes,
    staleTime: Infinity,
  });
}

/* ─── Mutations ─── */

export function useCreateAttendant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Attendant>) => createAttendant(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.attendants() });
    },
  });
}

export function useUpdateAttendant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Attendant> }) =>
      updateAttendant(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.attendants() });
    },
  });
}

export function useDeleteAttendant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttendant(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.settings.attendants() });
    },
  });
}
