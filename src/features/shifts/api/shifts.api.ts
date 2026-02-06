import { getApiService } from '@/lib/api/apiAdapter';
import type { StartShiftRequestDto, EndShiftRequestDto, VerifyShiftRequestDto, ShiftListFiltersDto } from '@/lib/api/dto';

export async function getShifts(filters?: ShiftListFiltersDto) {
  const svc = await getApiService();
  return svc.getShifts(filters);
}

export async function getShift(id: string) {
  const svc = await getApiService();
  return svc.getShift(id);
}

export async function startShift(data: StartShiftRequestDto) {
  const svc = await getApiService();
  return svc.startShift(data);
}

export async function endShift(id: string, data: EndShiftRequestDto) {
  const svc = await getApiService();
  return svc.endShift(id, data);
}

export async function verifyShift(id: string, data: VerifyShiftRequestDto) {
  const svc = await getApiService();
  return svc.verifyShift(id, data);
}

export async function getShiftRawTransactions(shiftId: string) {
  const svc = await getApiService();
  return svc.getShiftRawTransactions(shiftId);
}

export async function getShiftVerifiedTransactions(shiftId: string) {
  const svc = await getApiService();
  return svc.getShiftVerifiedTransactions(shiftId);
}

export async function getShiftDeclaration(shiftId: string) {
  const svc = await getApiService();
  return svc.getShiftDeclaration(shiftId);
}

export async function getShiftVerificationSummary(shiftId: string) {
  const svc = await getApiService();
  return svc.getShiftVerificationSummary(shiftId);
}
