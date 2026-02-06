import { SimpleGrid, Paper, Text, Badge, Stack } from '@mantine/core';
import { IconGasStation } from '@tabler/icons-react';
import type { Pump, PumpStatus } from '@/types/pumps';

const statusColors: Record<PumpStatus, string> = {
  idle: 'gray',
  authorized: 'blue',
  fueling: 'green',
  offline: 'red',
  error: 'orange',
};

export function PumpStatusGrid() {
  // TODO: Replace with real data from useLivePumps hook
  const pumps: Pump[] = [
    { id: '1', number: 1, name: 'Pump 1', status: 'idle', nozzles: [], lastUpdated: '' },
    { id: '2', number: 2, name: 'Pump 2', status: 'fueling', nozzles: [], lastUpdated: '', currentTransaction: { volume: 23.5, amount: 587.5, fuelType: 'Petrol', startTime: '' } },
    { id: '3', number: 3, name: 'Pump 3', status: 'idle', nozzles: [], lastUpdated: '' },
    { id: '4', number: 4, name: 'Pump 4', status: 'offline', nozzles: [], lastUpdated: '' },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
      {pumps.map((pump) => (
        <Paper key={pump.id} p="sm" radius="md" withBorder>
          <Stack gap="xs" align="center">
            <IconGasStation size={24} />
            <Text fw={500} size="sm">
              Pump {pump.number}
            </Text>
            <Badge size="sm" color={statusColors[pump.status]}>
              {pump.status}
            </Badge>
            {pump.currentTransaction && (
              <Text size="xs" c="dimmed">
                {pump.currentTransaction.volume.toFixed(1)} L
              </Text>
            )}
          </Stack>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
