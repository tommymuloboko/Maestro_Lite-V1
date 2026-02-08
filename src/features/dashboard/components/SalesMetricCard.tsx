import { Group, Paper, Text, ThemeIcon } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';

interface SalesMetricCardProps {
  label: string;
  value: string;
  icon: TablerIcon;
  color: 'teal' | 'blue' | 'orange' | 'red';
  helper?: string;
}

export function SalesMetricCard({ label, value, icon: Icon, color, helper }: SalesMetricCardProps) {
  return (
    <Paper p="md" radius="md" withBorder bg="white">
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb={6}>
        <div>
          <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: 0.4 }}>
            {label}
          </Text>
          <Text size="xl" fw={700} lh={1.2}>
            {value}
          </Text>
          {helper ? (
            <Text size="xs" c="dimmed" mt={2}>
              {helper}
            </Text>
          ) : null}
        </div>
        <ThemeIcon variant="light" color={color} size={40} radius="md">
          <Icon size={20} stroke={1.8} />
        </ThemeIcon>
      </Group>
    </Paper>
  );
}
