/**
 * API functions for transactions (new /api/transactions endpoint)
 */

import { getApiService } from '@/lib/api/apiAdapter';
import type { RawFuelTransaction } from '@/types/fuel';

export interface TransactionFilters {
    station_id?: string;
    limit?: number;
    offset?: number;
}

export async function getTransactions(filters?: TransactionFilters): Promise<{
    count: number;
    transactions: RawFuelTransaction[];
}> {
    const svc = await getApiService();
    return svc.getTransactions(filters);
}

export async function getTransactionsSummary(stationId?: string) {
    const svc = await getApiService();
    return svc.getTransactionsSummary(stationId);
}

export async function getVerifiedTransactionsSummary(stationId?: string) {
    const svc = await getApiService();
    return svc.getVerifiedTransactionsSummary(stationId);
}
