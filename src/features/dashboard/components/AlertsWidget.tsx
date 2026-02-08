import { Stack, Group, Text, Badge, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconDroplet, IconGasStation } from '@tabler/icons-react';
import { formatRelative } from '@/lib/utils/dates';
import { useDashboardAlerts } from '../api/dashboard.hooks';

export function AlertsWidget() {
  const { data: alerts = [], isLoading, isError } = useDashboardAlerts();

  if (isLoading) {
    return <Text size="sm" c="dimmed" ta="center" py="md">Loading alerts...</Text>;
  }

  if (isError) {
    return <Text size="sm" c="red" ta="center" py="md">Unable to load alerts</Text>;
  }

  if (alerts.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        No active alerts
      </Text>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'tank':
      case 'low':
      case 'critical':
      case 'overfill':
      case 'offline':
      case 'variance':
        return <IconDroplet size={16} />;
      case 'pump':
        return <IconGasStation size={16} />;
      default:
        return <IconAlertTriangle size={16} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'error':
        return 'orange';
      default:
        return 'yellow';
    }
  };

  return (
    <Stack gap="sm">
      {alerts.map((alert) => (
        <Group key={alert.id} gap="sm" wrap="nowrap">
          <ThemeIcon
            size="sm"
            variant="light"
            color={getSeverityColor(alert.severity)}
          >
            {getIcon(alert.type)}
          </ThemeIcon>
          <div style={{ flex: 1 }}>
            <Text size="sm">{alert.message}</Text>
            <Text size="xs" c="dimmed">
              {formatRelative(alert.createdAt)}
            </Text>
          </div>
          <Badge size="xs" color={getSeverityColor(alert.severity)}>
            {alert.severity}
          </Badge>
        </Group>
      ))}
    </Stack>
  );
}
