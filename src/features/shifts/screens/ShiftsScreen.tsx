import { useCallback, useEffect, useState } from 'react';
import { Button, Badge, Loader, Center } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Screen } from '@/layouts/Screen';
import { DataTable } from '@/components/common/DataTable';
import { FiltersBar } from '@/components/common/FiltersBar';
import { formatDateTime } from '@/lib/utils/dates';
import type { Shift, ShiftStatus } from '@/types/shifts';
import { getApiService } from '@/lib/api/apiAdapter';
import { StartShiftModal } from '../components/StartShiftModal';
import { useStartShift } from '../api/shifts.hooks';

const statusColors: Record<ShiftStatus, string> = {
  active: 'blue',
  ended: 'orange',
  verified: 'green',
  closed: 'gray',
};

export function ShiftsScreen() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startShiftOpened, setStartShiftOpened] = useState(false);
  const startShiftMutation = useStartShift();

  const loadShifts = useCallback(async () => {
    try {
      const api = await getApiService();
      const result = await api.getShifts();
      setShifts(result.data);
    } catch (error) {
      console.error('Failed to load shifts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadShifts();
  }, [loadShifts]);

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

  if (isLoading) {
    return (
      <Screen title="Shifts">
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Screen>
    );
  }

  return (
    <Screen
      title="Shifts"
      actions={
        <Button leftSection={<IconPlus size={16} />} onClick={() => setStartShiftOpened(true)}>
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
            onChange: () => { },
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

      <StartShiftModal
        opened={startShiftOpened}
        onClose={() => setStartShiftOpened(false)}
        isLoading={startShiftMutation.isPending}
        onSubmit={async ({ attendantId, pumpIds }) => {
          try {
            await startShiftMutation.mutateAsync({
              attendantId,
              pumpIds,
              tagNumber: '',
              openingReadings: [],
            });
            notifications.show({
              color: 'green',
              title: 'Shift started',
              message: 'A new shift was started successfully.',
            });
            setStartShiftOpened(false);
            await loadShifts();
          } catch (error) {
            notifications.show({
              color: 'red',
              title: 'Failed to start shift',
              message: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }}
      />
    </Screen>
  );
}
