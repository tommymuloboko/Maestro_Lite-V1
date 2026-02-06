import { getApiService } from '@/lib/api/apiAdapter';
import type { FuelSalesFiltersDto } from '@/lib/api/dto';

export async function getFuelSales(filters?: FuelSalesFiltersDto) {
  const svc = await getApiService();
  return svc.getFuelSales(filters);
}

export async function getFuelSale(id: string) {
  const svc = await getApiService();
  return svc.getFuelSale(id);
}

export async function getFuelSalesSummary(filters?: FuelSalesFiltersDto) {
  const svc = await getApiService();
  return svc.getFuelSalesSummary(filters);
}
