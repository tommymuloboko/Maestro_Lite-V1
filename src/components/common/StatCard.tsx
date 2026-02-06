import { Paper, Group, Text } from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive?: boolean;
  };
}

export function StatCard({ label, value, trend }: StatCardProps) {
  const trendColor = trend?.isPositive !== false ? '#22c55e' : '#ef4444';
  const TrendIcon = trend?.isPositive !== false ? IconTrendingUp : IconTrendingDown;

  return (
    <Paper p="md" radius="md" withBorder bg="white">
      <Text size="xs" c="dimmed" mb={4}>
        {label}
      </Text>
      <Group justify="space-between" align="flex-end">
        <Text size="xl" fw={700} lh={1}>
          {value}
        </Text>
        {trend && (
          <Group gap={4} align="center">
            <TrendIcon size={14} color={trendColor} />
            <Text size="xs" c={trendColor} fw={600}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </Text>
          </Group>
        )}
      </Group>
    </Paper>
  );
}
