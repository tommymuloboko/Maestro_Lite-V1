import { Stack, Text, Paper, Group, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { BulkPaymentAllocator } from './BulkPaymentAllocator';
import {
  useShiftRawTransactions,
  useShiftVerifiedTransactions,
  useShiftDeclaration,
  useShiftVerificationSummary,
} from '../api/shifts.hooks';

interface VerificationWorkspaceProps {
  shiftId: string;
}

export function VerificationWorkspace({ shiftId }: VerificationWorkspaceProps) {
  const { data: rawTransactions = [], isLoading: loadingRaw } = useShiftRawTransactions(shiftId);
  const { data: verifiedTransactions = [], isLoading: loadingVerified } = useShiftVerifiedTransactions(shiftId);
  const { data: declaration } = useShiftDeclaration(shiftId);
  const { data: verificationSummary } = useShiftVerificationSummary(shiftId);

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Verify pump readings and payment allocations for this shift.
      </Text>

      <Paper p="sm" bg="gray.0" radius="md">
        <Text size="sm" fw={500} mb="sm">Pump Readings</Text>
        <Group gap="sm">
          <Badge variant="light" color="blue">
            Raw: {loadingRaw ? '...' : rawTransactions.length}
          </Badge>
          <Badge variant="light" color="green">
            Verified: {loadingVerified ? '...' : verifiedTransactions.length}
          </Badge>
        </Group>
      </Paper>

      <Paper p="sm" bg="gray.0" radius="md">
        <Text size="sm" fw={500} mb="sm">Declaration & Summary</Text>
        <Text size="xs" c="dimmed">
          Declared Total: {declaration ? declaration.declaredTotal.toLocaleString() : 'Not submitted'}
        </Text>
        <Text size="xs" c="dimmed">
          Verified Total: {verificationSummary ? verificationSummary.verifiedTotal.toLocaleString() : 'Not verified'}
        </Text>
      </Paper>

      <Paper p="sm" bg="gray.0" radius="md">
        <Text size="sm" fw={500} mb="sm">Payment Allocation</Text>
        <BulkPaymentAllocator
          transactions={rawTransactions.map((tx) => ({
            id: tx.id,
            transactionNumber: String(tx.transactionId),
            amount: tx.amount,
            pumpId: String(tx.pumpId),
            nozzleId: '',
            fuelType: '',
            volume: 0,
            unitPrice: 0,
            timestamp: tx.time,
            isVoided: false,
            isVerified: tx.isVerified,
            paymentType: undefined,
          }))}
          onAllocate={(allocations) => {
            notifications.show({
              color: 'blue',
              title: 'Allocations captured',
              message: `${allocations.length} transaction(s) prepared for verification.`,
            });
          }}
        />
      </Paper>
    </Stack>
  );
}
