import { Stack, Group, Text, Badge, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconDroplet, IconGasStation } from '@tabler/icons-react';

interface Alert {
  id: string;
  type: 'tank' | 'pump' | 'shift';
  message: string;
  severity: 'warning' | 'error' | 'critical';
  timestamp: string;
}

export function AlertsWidget() {
  // TODO: Replace with real data from useAlerts hook
  const alerts: Alert[] = [
    {
      id: '1',
      type: 'tank',
      message: 'Tank 2 (Diesel) is below 20% capacity',
      severity: 'warning',
      timestamp: '10 min ago',
    },
  ];

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
              {alert.timestamp}
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
