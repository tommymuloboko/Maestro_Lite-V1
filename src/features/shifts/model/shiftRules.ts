import type { ShiftVariance } from '@/types/shifts';

export interface VerificationRule {
  id: string;
  name: string;
  check: (variance: ShiftVariance) => boolean;
  severity: 'warning' | 'error';
  message: string;
}

export const verificationRules: VerificationRule[] = [
  {
    id: 'variance-threshold',
    name: 'Variance Threshold',
    check: (v) => Math.abs(v.variancePercent) <= 2,
    severity: 'error',
    message: 'Variance exceeds 2% threshold',
  },
  {
    id: 'variance-warning',
    name: 'Variance Warning',
    check: (v) => Math.abs(v.variancePercent) <= 0.5,
    severity: 'warning',
    message: 'Variance exceeds 0.5% - review recommended',
  },
  {
    id: 'declared-matches-counted',
    name: 'Declared Matches Counted',
    check: (v) => v.totalDeclared === v.totalCounted,
    severity: 'warning',
    message: 'Declared amount does not match counted amount',
  },
];

export function validateShift(variance: ShiftVariance): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of verificationRules) {
    if (!rule.check(variance)) {
      if (rule.severity === 'error') {
        errors.push(rule.message);
      } else {
        warnings.push(rule.message);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
