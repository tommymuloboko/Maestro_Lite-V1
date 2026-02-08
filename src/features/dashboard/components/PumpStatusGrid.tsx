import { SimpleGrid, Paper, Text, Badge, Stack } from '@mantine/core';
import { IconGasStation } from '@tabler/icons-react';
import type { PumpStatus } from '@/types/pumps';
import { useLivePumps } from '@/hooks/useLivePumps';

const statusColors: Record<PumpStatus, string> = {
  idle: 'gray',
  authorized: 'blue',
  fueling: 'green',
  offline: 'red',
  error: 'orange',
};

export function PumpStatusGrid() {
  const { data: pumps = [], isLoading, isError } = useLivePumps();
  const safePumps = Array.isArray(pumps) ? pumps : [];

  if (isLoading) {
    return <Text size="sm" c="dimmed">Loading pump status...</Text>;
  }

  if (isError) {
    return <Text size="sm" c="red">Unable to load pump status</Text>;
  }

  if (safePumps.length === 0) {
    return <Text size="sm" c="dimmed">No pumps available</Text>;
  }

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
      {safePumps.map((pump, index) => {
        const status = pump.status as PumpStatus;
        const badgeColor = statusColors[status] ?? 'gray';
        const pumpNumber = Number.isFinite(pump.number) ? pump.number : index + 1;
        const txVolume = pump.currentTransaction?.volume;

        return (
          <Paper key={pump.id ?? `pump-${index + 1}`} p="sm" radius="md" withBorder>
            <Stack gap="xs" align="center">
              <IconGasStation size={24} />
              <Text fw={500} size="sm">
                Pump {pumpNumber}
              </Text>
              <Badge size="sm" color={badgeColor}>
                {pump.status ?? 'offline'}
              </Badge>
              {typeof txVolume === 'number' && Number.isFinite(txVolume) && (
                <Text size="xs" c="dimmed">
                  {txVolume.toFixed(1)} L
                </Text>
              )}
            </Stack>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
