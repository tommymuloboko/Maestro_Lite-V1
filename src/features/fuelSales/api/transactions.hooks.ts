/**
 * React Query hooks for Transactions (new /api/transactions endpoint)
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import {
    getTransactions,
    getTransactionsSummary,
    getVerifiedTransactionsSummary,
    type TransactionFilters,
} from './transactions.api';

export function useTransactions(filters?: TransactionFilters) {
    return useQuery({
        queryKey: queryKeys.transactions.list(filters ?? {}),
        queryFn: () => getTransactions(filters),
        refetchInterval: 30000, // Refetch every 30 seconds for live data
    });
}

export function useTransactionsSummary(stationId?: string) {
    return useQuery({
        queryKey: queryKeys.transactions.summary(stationId),
        queryFn: () => getTransactionsSummary(stationId),
        refetchInterval: 30000,
    });
}

export function useVerifiedTransactionsSummary(stationId?: string) {
    return useQuery({
        queryKey: queryKeys.transactions.verifiedSummary(stationId),
        queryFn: () => getVerifiedTransactionsSummary(stationId),
        refetchInterval: 30000,
    });
}
