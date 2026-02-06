/**
 * React Query hooks for Fuel Sales.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { getFuelSales, getFuelSale, getFuelSalesSummary } from '../api/fuelSales.api';
import type { FuelSalesFiltersDto } from '@/lib/api/dto';

export function useFuelSales(filters?: FuelSalesFiltersDto) {
  return useQuery({
    queryKey: queryKeys.fuelSales.list(filters ?? {}),
    queryFn: () => getFuelSales(filters),
  });
}

export function useFuelSale(id: string) {
  return useQuery({
    queryKey: queryKeys.fuelSales.detail(id),
    queryFn: () => getFuelSale(id),
    enabled: !!id,
  });
}

export function useFuelSalesSummary(filters?: FuelSalesFiltersDto) {
  return useQuery({
    queryKey: queryKeys.fuelSales.summary(filters ?? {}),
    queryFn: () => getFuelSalesSummary(filters),
  });
}
