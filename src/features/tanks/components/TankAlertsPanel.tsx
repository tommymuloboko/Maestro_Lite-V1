import { Stack, Group, Text, Badge, Button, Paper, Box } from '@mantine/core';
import { IconCheck, IconAlertTriangle, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import { formatRelative } from '@/lib/utils/dates';
import { useTankAlerts } from '../api/tanks.hooks';

interface TankAlertsPanelProps {
  tankId: string;
}

function getSeverityMeta(severity: string) {
  switch (severity) {
    case 'critical':
      return { color: 'red', icon: IconAlertCircle };
    case 'error':
      return { color: 'orange', icon: IconAlertTriangle };
    case 'warning':
      return { color: 'yellow', icon: IconInfoCircle };
    default:
      return { color: 'gray', icon: IconInfoCircle };
  }
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

  return (
    <Stack gap="sm">
      {alerts.map((alert) => {
        const meta = getSeverityMeta(alert.severity);
        const SevIcon = meta.icon;

        return (
          <Paper
            key={alert.id}
            withBorder
            radius="md"
            p="sm"
            style={{ background: alert.isAcknowledged ? undefined : 'rgba(0,0,0,0.01)' }}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Group gap="sm" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
                {/* left indicator */}
                <Box
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    marginTop: 6,
                    background:
                      alert.severity === 'critical'
                        ? '#ef4444'
                        : alert.severity === 'error'
                          ? '#f97316'
                          : alert.severity === 'warning'
                            ? '#f59e0b'
                            : '#9ca3af',
                    boxShadow: '0 0 0 3px rgba(0,0,0,0.04)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <Group gap={6} align="center">
                    <SevIcon size={14} style={{ opacity: 0.7 }} />
                    <Text size="sm" fw={600} style={{ wordBreak: 'break-word' }}>
                      {alert.message}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    {formatRelative(alert.createdAt)}
                  </Text>
                </div>
              </Group>

              <Group gap="xs" align="center" style={{ flexShrink: 0 }}>
                <Badge size="sm" color={meta.color} variant="light" styles={{ root: { textTransform: 'uppercase', fontWeight: 700 } }}>
                  {alert.severity}
                </Badge>

                {!alert.isAcknowledged && (
                  <Button size="xs" variant="subtle" leftSection={<IconCheck size={12} />}>
                    Ack
                  </Button>
                )}
              </Group>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
}
