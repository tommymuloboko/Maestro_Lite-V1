import { Stack, Group, Text, Badge, Button } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { formatRelative } from '@/lib/utils/dates';
import { useTankAlerts } from '../api/tanks.hooks';

interface TankAlertsPanelProps {
  tankId: string;
}

export function TankAlertsPanel({ tankId }: TankAlertsPanelProps) {
  const { data: allAlerts = [], isLoading } = useTankAlerts();
  const alerts = allAlerts.filter((alert) => alert.tankId === tankId);

  if (isLoading) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        Loading alerts...
      </Text>
    );
  }

  if (alerts.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        No active alerts
      </Text>
    );
  }

  const severityColors: Record<string, string> = {
    warning: 'yellow',
    error: 'orange',
    critical: 'red',
  };

  return (
    <Stack gap="sm">
      {alerts.map((alert) => (
        <Group key={alert.id} justify="space-between" wrap="nowrap">
          <div>
            <Text size="sm">{alert.message}</Text>
            <Text size="xs" c="dimmed">{formatRelative(alert.createdAt)}</Text>
          </div>
          <Group gap="xs">
            <Badge size="sm" color={severityColors[alert.severity]}>
              {alert.severity}
            </Badge>
            {!alert.isAcknowledged && (
              <Button size="xs" variant="subtle" leftSection={<IconCheck size={12} />}>
                Ack
              </Button>
            )}
          </Group>
        </Group>
      ))}
    </Stack>
  );
}
