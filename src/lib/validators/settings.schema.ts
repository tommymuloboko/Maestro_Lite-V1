import { z } from 'zod';

export const stationConfigSchema = z.object({
  stationId: z.string().min(1, 'Station ID is required'),
  stationName: z.string().min(1, 'Station name is required'),
});

export const attendantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  employeeCode: z.string().min(1, 'Employee code is required'),
  tag: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const paymentTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  isActive: z.boolean().default(true),
});

export type StationConfigFormData = z.infer<typeof stationConfigSchema>;
export type AttendantFormData = z.infer<typeof attendantSchema>;
export type PaymentTypeFormData = z.infer<typeof paymentTypeSchema>;
