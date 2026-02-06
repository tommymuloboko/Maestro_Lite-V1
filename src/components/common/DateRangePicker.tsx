import { DatePickerInput } from '@mantine/dates';
import { Group } from '@mantine/core';
import type { DateRange } from '@/types/common';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  label?: string;
}

export function DateRangePicker({ value, onChange, label }: DateRangePickerProps) {
  return (
    <Group gap="xs">
      <DatePickerInput
        label={label ? `${label} From` : 'From'}
        placeholder="Start date"
        value={value.start}
        onChange={(date) => onChange({ ...value, start: date ? new Date(date) : null })}
        maxDate={value.end ?? undefined}
        clearable
      />
      <DatePickerInput
        label={label ? `${label} To` : 'To'}
        placeholder="End date"
        value={value.end}
        onChange={(date) => onChange({ ...value, end: date ? new Date(date) : null })}
        minDate={value.start ?? undefined}
        clearable
      />
    </Group>
  );
}
