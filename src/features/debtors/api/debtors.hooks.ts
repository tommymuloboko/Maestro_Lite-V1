/**
 * React Query hooks for the Debtors module.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Debtor, DebtorVehicle } from '@/types/debtors';
import {
    getDebtors,
    getDebtor,
    createDebtor,
    updateDebtor,
    deleteDebtor,
    getDebtorVehicles,
    addDebtorVehicle,
    removeDebtorVehicle,
    getDebtorTransactions,
    getDebtorBalance,
} from './debtors.api';

// ─── Query Keys ──────────────────────────────────────────────

export const debtorKeys = {
    all: ['debtors'] as const,
    lists: () => [...debtorKeys.all, 'list'] as const,
    detail: (id: string) => [...debtorKeys.all, 'detail', id] as const,
    vehicles: (id: string) => [...debtorKeys.all, 'vehicles', id] as const,
    transactions: (id: string) => [...debtorKeys.all, 'transactions', id] as const,
    balance: (id: string) => [...debtorKeys.all, 'balance', id] as const,
} as const;

// ─── Queries ─────────────────────────────────────────────────

export function useDebtors() {
    return useQuery({
        queryKey: debtorKeys.lists(),
        queryFn: getDebtors,
    });
}

export function useDebtor(id: string | undefined) {
    return useQuery({
        queryKey: debtorKeys.detail(id ?? ''),
        queryFn: () => getDebtor(id!),
        enabled: !!id,
    });
}

export function useDebtorVehicles(debtorId: string | undefined) {
    return useQuery({
        queryKey: debtorKeys.vehicles(debtorId ?? ''),
        queryFn: () => getDebtorVehicles(debtorId!),
        enabled: !!debtorId,
    });
}

export function useDebtorTransactions(debtorId: string | undefined) {
    return useQuery({
        queryKey: debtorKeys.transactions(debtorId ?? ''),
        queryFn: () => getDebtorTransactions(debtorId!),
        enabled: !!debtorId,
    });
}

export function useDebtorBalance(debtorId: string | undefined) {
    return useQuery({
        queryKey: debtorKeys.balance(debtorId ?? ''),
        queryFn: () => getDebtorBalance(debtorId!),
        enabled: !!debtorId,
    });
}

// ─── Mutations ───────────────────────────────────────────────

export function useCreateDebtor() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Debtor>) => createDebtor(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: debtorKeys.lists() });
        },
    });
}

export function useUpdateDebtor() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Debtor> }) => updateDebtor(id, data),
        onSuccess: (_result, { id }) => {
            void qc.invalidateQueries({ queryKey: debtorKeys.lists() });
            void qc.invalidateQueries({ queryKey: debtorKeys.detail(id) });
        },
    });
}

export function useDeleteDebtor() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteDebtor(id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: debtorKeys.lists() });
        },
    });
}

export function useAddVehicle() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ debtorId, data }: { debtorId: string; data: Partial<DebtorVehicle> }) =>
            addDebtorVehicle(debtorId, data),
        onSuccess: (_result, { debtorId }) => {
            void qc.invalidateQueries({ queryKey: debtorKeys.vehicles(debtorId) });
        },
    });
}

export function useRemoveVehicle() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ debtorId, vehicleId }: { debtorId: string; vehicleId: string }) =>
            removeDebtorVehicle(debtorId, vehicleId),
        onSuccess: (_result, { debtorId }) => {
            void qc.invalidateQueries({ queryKey: debtorKeys.vehicles(debtorId) });
        },
    });
}
