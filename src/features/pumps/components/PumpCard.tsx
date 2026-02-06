import { Paper, Stack, Group, Text, Badge, ThemeIcon, Button } from '@mantine/core';
import { IconGasStation, IconHistory } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { Pump, PumpStatus } from '@/types/pumps';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { paths } from '@/routes/paths';

interface PumpCardProps {
  pump: Pump;
}

const statusColors: Record<PumpStatus, string> = {
  idle: 'gray',
  authorized: 'blue',
  fueling: 'green',
  offline: 'red',
  error: 'orange',
};

const statusLabels: Record<PumpStatus, string> = {
  idle: 'Idle',
  authorized: 'Authorized',
  fueling: 'Fueling',
  offline: 'Offline',
  error: 'Error',
};

export function PumpCard({ pump }: PumpCardProps) {
  const navigate = useNavigate();

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm">
            <ThemeIcon size="lg" variant="light" color={statusColors[pump.status]}>
              <IconGasStation size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600}>{pump.name}</Text>
              <Badge size="sm" color={statusColors[pump.status]}>
                {statusLabels[pump.status]}
              </Badge>
            </div>
          </Group>
        </Group>

        {pump.currentTransaction && (
          <Paper p="sm" bg="green.0" radius="sm">
            <Text size="xs" c="dimmed" mb="xs">Current Transaction</Text>
            <Group justify="space-between">
              <div>
                <Text size="sm" fw={500}>{pump.currentTransaction.fuelType}</Text>
                <Text size="lg" fw={700}>{formatVolume(pump.currentTransaction.volume)}</Text>
              </div>
              <Text size="lg" fw={700} c="green">
                {formatMoney(pump.currentTransaction.amount)}
              </Text>
            </Group>
          </Paper>
        )}

        {pump.nozzles.length > 0 && (
          <div>
            <Text size="xs" c="dimmed" mb="xs">Nozzles</Text>
            {pump.nozzles.map((nozzle) => (
              <Group key={nozzle.id} justify="space-between" mb="xs">
                <Text size="sm">{nozzle.fuelType}</Text>
                <Text size="sm" c="dimmed">
                  {nozzle.totalizer.toLocaleString()} L
                </Text>
              </Group>
            ))}
          </div>
        )}

        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconHistory size={14} />}
          onClick={() => navigate(paths.pumpTransactions(pump.id))}
        >
          View Transactions
        </Button>
      </Stack>
    </Paper>
  );
}
