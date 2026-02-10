import { Stack, Group, Text, Paper, ThemeIcon } from '@mantine/core';
import { IconArrowUp, IconArrowDown, IconMinus } from '@tabler/icons-react';
import { formatMoney } from '@/lib/utils/money';
import type { VerificationResult, CloseDeclaration } from '../types/attendantShifts';

interface VariancePanelProps {
  transactionTotal?: number; // computed_total from server (or derived)
  declaration?: CloseDeclaration | null;
  verification?: VerificationResult | null;
}

export function VariancePanel({ transactionTotal = 0, declaration, verification }: VariancePanelProps) {
  const computed = Number(verification?.computed_total ?? transactionTotal ?? 0);
  const declared = Number(verification?.declared_total ?? declaration?.declared_total ?? 0);
  const counted = Number(verification?.verified_total ?? 0);
  const variance = Number(verification?.variance_amount ?? (counted - computed));
  const variancePercent = computed > 0 ? (variance / computed) * 100 : 0;

  const hasAny = computed > 0 || declared > 0 || counted > 0;

  if (!hasAny) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        Variance data not available
      </Text>
    );
  }

  const getVarianceIcon = () => {
    if (variance > 0) return <IconArrowUp size={16} />;
    if (variance < 0) return <IconArrowDown size={16} />;
    return <IconMinus size={16} />;
  };

  const getVarianceColor = () => {
    if (Math.abs(variancePercent) < 0.5) return 'green';
    if (Math.abs(variancePercent) < 2) return 'orange';
    return 'red';
  };

  return (
    <Stack gap="md">
      <Paper p="sm" bg="gray.0" radius="md">
        <Text size="xs" c="dimmed" mb="xs">Computed (Expected)</Text>
        <Text size="lg" fw={600}>{formatMoney(computed)}</Text>
      </Paper>

      <Paper p="sm" bg="gray.0" radius="md">
        <Text size="xs" c="dimmed" mb="xs">Declared</Text>
        <Text size="lg" fw={600}>{formatMoney(declared)}</Text>
      </Paper>

      <Paper p="sm" bg="gray.0" radius="md">
        <Text size="xs" c="dimmed" mb="xs">Verified</Text>
        <Text size="lg" fw={600}>{formatMoney(counted)}</Text>
      </Paper>

      <Paper p="sm" radius="md" bg={`${getVarianceColor()}.0`}>
        <Group justify="space-between" align="center">
          <div>
            <Text size="xs" c="dimmed" mb="xs">Variance</Text>
            <Text size="xl" fw={700} c={getVarianceColor()}>
              {formatMoney(variance)}
            </Text>
            <Text size="xs" c="dimmed">
              {variancePercent.toFixed(2)}%
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
