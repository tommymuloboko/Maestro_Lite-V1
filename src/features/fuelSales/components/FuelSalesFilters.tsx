import { Group, Select, Button } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import { useState } from 'react';
import type { DateRange } from '@/types/common';

export function FuelSalesFilters() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [pumpId, setPumpId] = useState<string | null>(null);
  const [fuelType, setFuelType] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<string | null>(null);

  const handleClear = () => {
    setDateRange({ start: null, end: null });
    setPumpId(null);
    setFuelType(null);
    setPaymentType(null);
  };

  const hasFilters = dateRange.start || dateRange.end || pumpId || fuelType || paymentType;

  return (
    <Group gap="sm" wrap="wrap" mb="md">
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      <Select
        placeholder="Pump"
        data={[
          { value: '1', label: 'Pump 1' },
          { value: '2', label: 'Pump 2' },
          { value: '3', label: 'Pump 3' },
          { value: '4', label: 'Pump 4' },
        ]}
        value={pumpId}
        onChange={setPumpId}
        clearable
      />

      <Select
        placeholder="Fuel Type"
        data={[
          { value: 'petrol', label: 'Petrol' },
          { value: 'diesel', label: 'Diesel' },
        ]}
        value={fuelType}
        onChange={setFuelType}
        clearable
      />

      <Select
        placeholder="Payment"
        data={[
          { value: 'cash', label: 'Cash' },
          { value: 'card', label: 'Card' },
          { value: 'mobile', label: 'Mobile Money' },
        ]}
        value={paymentType}
        onChange={setPaymentType}
        clearable
      />

      {hasFilters && (
        <Button
          variant="subtle"
          color="gray"
          size="sm"
          leftSection={<IconX size={14} />}
          onClick={handleClear}
        >
          Clear
        </Button>
      )}
    </Group>
  );
}
