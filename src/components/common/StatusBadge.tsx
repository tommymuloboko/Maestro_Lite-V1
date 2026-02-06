import { Badge } from '@mantine/core';
import type { ConnectionStatus } from '@/types/common';

interface StatusBadgeProps {
  label: string;
  status: ConnectionStatus;
}

const statusColors: Record<ConnectionStatus, string> = {
  connected: 'green',
  disconnected: 'red',
  connecting: 'yellow',
  error: 'red',
};

const statusLabels: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  disconnected: 'Offline',
  connecting: 'Connecting...',
  error: 'Error',
};

export function StatusBadge({ label, status }: StatusBadgeProps) {
  return (
    <Badge
      variant="dot"
      color={statusColors[status]}
      size="sm"
    >
      {label}: {statusLabels[status]}
    </Badge>
  );
}
