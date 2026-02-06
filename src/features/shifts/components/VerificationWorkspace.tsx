import { Stack, Text, Paper } from '@mantine/core';

export function VerificationWorkspace() {
  // TODO: Implement verification logic

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Verify pump readings and payment allocations for this shift.
      </Text>

      <Paper p="sm" bg="gray.0" radius="md">
        <Text size="sm" fw={500} mb="sm">Pump Readings</Text>
        <Text size="xs" c="dimmed">
          Closing readings will be compared with opening readings to calculate expected sales.
        </Text>
      </Paper>

      <Paper p="sm" bg="gray.0" radius="md">
        <Text size="sm" fw={500} mb="sm">Payment Allocation</Text>
        <Text size="xs" c="dimmed">
          Verify that all payments are correctly allocated to transactions.
        </Text>
      </Paper>
    </Stack>
  );
}
