import { Stack, Group, Text, Paper, ThemeIcon } from '@mantine/core';
import { IconArrowUp, IconArrowDown, IconMinus } from '@tabler/icons-react';
import { formatMoney } from '@/lib/utils/money';
import type { ShiftVariance } from '@/types/shifts';

interface VariancePanelProps {
  variance?: ShiftVariance;
}

export function VariancePanel({ variance }: VariancePanelProps) {
  if (!variance) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        Variance data not available
      </Text>
    );
  }

  const getVarianceIcon = () => {
    if (variance.variance > 0) return <IconArrowUp size={16} />;
    if (variance.variance < 0) return <IconArrowDown size={16} />;
    return <IconMinus size={16} />;
  };

  const getVarianceColor = () => {
    if (Math.abs(variance.variancePercent) < 0.5) return 'green';
    if (Math.abs(variance.variancePercent) < 2) return 'orange';
    return 'red';
  };

  return (
    <Stack gap="md">
      <Paper p="sm" bg="gray.0" radius="md">
        <Text size="xs" c="dimmed" mb="xs">Expected</Text>
        <Text size="lg" fw={600}>{formatMoney(variance.totalExpected)}</Text>
      </Paper>

      <Paper p="sm" bg="gray.0" radius="md">
        <Text size="xs" c="dimmed" mb="xs">Declared</Text>
        <Text size="lg" fw={600}>{formatMoney(variance.totalDeclared)}</Text>
      </Paper>

      <Paper p="sm" bg="gray.0" radius="md">
        <Text size="xs" c="dimmed" mb="xs">Counted</Text>
        <Text size="lg" fw={600}>{formatMoney(variance.totalCounted)}</Text>
      </Paper>

      <Paper p="sm" radius="md" bg={`${getVarianceColor()}.0`}>
        <Group justify="space-between" align="center">
          <div>
            <Text size="xs" c="dimmed" mb="xs">Variance</Text>
            <Text size="xl" fw={700} c={getVarianceColor()}>
              {formatMoney(variance.variance)}
            </Text>
            <Text size="xs" c="dimmed">
              {variance.variancePercent.toFixed(2)}%
            </Text>
          </div>
          <ThemeIcon size="lg" color={getVarianceColor()} variant="light">
            {getVarianceIcon()}
          </ThemeIcon>
        </Group>
      </Paper>
    </Stack>
  );
}
