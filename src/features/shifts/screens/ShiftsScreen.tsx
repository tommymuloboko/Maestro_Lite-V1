import { Button, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { Screen } from '@/layouts/Screen';
import { DataTable } from '@/components/common/DataTable';
import { FiltersBar } from '@/components/common/FiltersBar';
import { formatDateTime } from '@/lib/utils/dates';
import type { Shift, ShiftStatus } from '@/types/shifts';
import { mockShifts } from '@/mocks';

const statusColors: Record<ShiftStatus, string> = {
  active: 'blue',
  ended: 'orange',
  verified: 'green',
  closed: 'gray',
};

export function ShiftsScreen() {
  const shifts: Shift[] = mockShifts;
  const isLoading = false;

  const columns = [
    {
      key: 'attendant',
      header: 'Attendant',
      render: (shift: Shift) => shift.attendant?.name ?? 'Unknown',
    },
    {
      key: 'startTime',
      header: 'Start',
      render: (shift: Shift) => formatDateTime(shift.startTime),
    },
    {
      key: 'endTime',
      header: 'End',
      render: (shift: Shift) => shift.endTime ? formatDateTime(shift.endTime) : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (shift: Shift) => (
        <Badge color={statusColors[shift.status]}>{shift.status}</Badge>
      ),
    },
    {
      key: 'transactions',
      header: 'Transactions',
      render: (shift: Shift) => shift.transactions.length,
    },
  ];

  return (
    <Screen
      title="Shifts"
      actions={
        <Button leftSection={<IconPlus size={16} />}>
          Start Shift
        </Button>
      }
    >
      <FiltersBar
        searchPlaceholder="Search by attendant..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'ended', label: 'Ended' },
              { value: 'verified', label: 'Verified' },
              { value: 'closed', label: 'Closed' },
            ],
            value: null,
            onChange: () => {},
          },
        ]}
      />

      <DataTable
        data={shifts}
        columns={columns}
        isLoading={isLoading}
        getRowKey={(shift) => shift.id}
        emptyMessage="No shifts found"
      />
    </Screen>
  );
}
