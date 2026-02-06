import { SegmentedControl } from '@mantine/core';
import type { ReportType } from '@/types/reports';

interface ReportPickerProps {
  value: ReportType;
  onChange: (value: ReportType) => void;
}

const reportOptions: { value: ReportType; label: string }[] = [
  { value: 'shift-summary', label: 'Shift Summary' },
  { value: 'daily-sales-by-payment', label: 'Daily Sales' },
  { value: 'attendant-performance', label: 'Attendant Performance' },
  { value: 'pump-totals', label: 'Pump Totals' },
];

export function ReportPicker({ value, onChange }: ReportPickerProps) {
  return (
    <SegmentedControl
      value={value}
      onChange={(v) => onChange(v as ReportType)}
      data={reportOptions}
      fullWidth
    />
  );
}
