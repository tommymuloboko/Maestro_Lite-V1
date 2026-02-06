import { z } from 'zod';

export const startShiftSchema = z.object({
  attendantId: z.string().min(1, 'Attendant is required'),
  pumpIds: z.array(z.string()).min(1, 'At least one pump must be selected'),
  openingReadings: z.array(
    z.object({
      pumpId: z.string(),
      nozzleId: z.string(),
      reading: z.number().min(0, 'Reading must be positive'),
    })
  ),
});

export const endShiftSchema = z.object({
  closingReadings: z.array(
    z.object({
      pumpId: z.string(),
      nozzleId: z.string(),
      reading: z.number().min(0, 'Reading must be positive'),
    })
  ),
  payments: z.array(
    z.object({
      paymentType: z.string(),
      declaredAmount: z.number().min(0),
      countedAmount: z.number().min(0),
    })
  ),
  notes: z.string().optional(),
});

export type StartShiftFormData = z.infer<typeof startShiftSchema>;
export type EndShiftFormData = z.infer<typeof endShiftSchema>;
