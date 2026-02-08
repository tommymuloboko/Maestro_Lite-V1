import { Button, Group, Paper, Text } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';

export interface DashboardQuickActionItem {
  id: string;
  label: string;
  icon: TablerIcon;
  onClick: () => void;
}

interface DashboardQuickActionsProps {
  actions: DashboardQuickActionItem[];
  centered?: boolean;
}

export function DashboardQuickActions({ actions, centered = false }: DashboardQuickActionsProps) {
  return (
    <Paper p="md" radius="md" withBorder bg="white">
      <Text fw={600} mb="sm" ta={centered ? 'center' : 'left'}>
        Quick Actions
      </Text>

      <Group gap="sm" wrap="wrap" justify={centered ? 'center' : 'flex-start'}>
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.id}
              variant="light"
              size="sm"
              leftSection={<Icon size={16} />}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          );
        })}
      </Group>
    </Paper>
  );
}
