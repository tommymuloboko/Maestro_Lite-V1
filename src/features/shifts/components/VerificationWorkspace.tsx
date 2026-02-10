import { useEffect, useMemo, useState } from 'react';
import { Stack, Text, Paper, Group, Badge, Button, NumberInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { BulkPaymentAllocator } from './BulkPaymentAllocator';
import { attendantShiftsApi } from '../api/attendantShiftsApi';
import { getStoredUser } from '@/lib/storage/secureStore';
import type { CloseDeclaration, ShiftDetails, VerificationResult } from '../types/attendantShifts';

interface VerificationWorkspaceProps {
  shiftId: string;
  details?: ShiftDetails | null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

function n(v: unknown): number {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export function VerificationWorkspace({ shiftId, details }: VerificationWorkspaceProps) {
  const [declaration, setDeclaration] = useState<CloseDeclaration | null>(details?.close_declaration ?? null);
  const [verification, setVerification] = useState<VerificationResult | null>(details?.verification_summary ?? null);
  const [loading, setLoading] = useState(false);
  const [verifiedTotal, setVerifiedTotal] = useState<number>(details?.verification_summary?.verified_total ?? 0);

  useEffect(() => {
    setDeclaration(details?.close_declaration ?? null);
    setVerification(details?.verification_summary ?? null);
    setVerifiedTotal(details?.verification_summary?.verified_total ?? 0);
  }, [details]);

  const txSummary = details?.transaction_summary;
  const computed = n(verification?.computed_total ?? txSummary?.total_amount ?? 0);
  const declared = n(verification?.declared_total ?? declaration?.declared_total ?? 0);
  const verified = n(verification?.verified_total ?? verifiedTotal ?? 0);
  const variance = n(verification?.variance_amount ?? (verified - computed));

  const canVerify = Boolean(declaration) && (details?.shift?.is_pending_verification || details?.shift?.is_ended);

  const doRefresh = async () => {
    setLoading(true);
    try {
      const [d, v] = await Promise.allSettled([
        attendantShiftsApi.getCloseDeclaration(shiftId),
        attendantShiftsApi.getShiftDetails(shiftId),
      ]);
      if (d.status === 'fulfilled') setDeclaration(d.value.data);
      if (v.status === 'fulfilled') setVerification(v.value.data.verification_summary);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const doVerify = async () => {
    const user = getStoredUser();
    const userId = user?.id ?? '';
    if (!userId) {
      notifications.show({ color: 'red', title: 'Missing user', message: 'Could not determine user from your session. Please log in again.' });
      return;
    }
    setLoading(true);
    try {
      const res = await attendantShiftsApi.verifyShift(shiftId, {
        verified_by_user_id: userId,
        verified_total: n(verifiedTotal),
        is_disputed: false,
        notes: 'Verified from backoffice',
      });
      setVerification(res.data);
      notifications.show({ color: 'green', title: 'Shift verified', message: 'Verification saved successfully.' });
    } catch (e: unknown) {
      notifications.show({ color: 'red', title: 'Verify failed', message: getErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  };

  const allocatorTxs = useMemo(() => {
    // Backend does not return raw tx list in the new shift details response.
    // Keep allocator available for future when you add /shift/:id/transactions.
    return [];
  }, []);

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Close declaration + verification is based on the new shift lifecycle (end → declare → verify).
      </Text>

      <Paper p="sm" bg="gray.0" radius="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="sm" fw={600}>Shift Summary</Text>
            <Text size="xs" c="dimmed">Transactions: {txSummary?.transaction_count ?? 0}</Text>
            <Text size="xs" c="dimmed">Total amount: {n(txSummary?.total_amount).toLocaleString()}</Text>
          </div>

          <Group gap="xs">
            <Badge variant="light" color={declaration ? 'green' : 'gray'}>
              {declaration ? 'DECLARED' : 'NOT DECLARED'}
            </Badge>
            <Badge variant="light" color={verification?.is_verified ? 'green' : 'orange'}>
              {verification?.is_verified ? 'VERIFIED' : 'NOT VERIFIED'}
            </Badge>
          </Group>
        </Group>

        <Group mt="sm" gap="lg">
          <div>
            <Text size="xs" c="dimmed">Computed</Text>
            <Text fw={800}>{computed.toLocaleString()}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">Declared</Text>
            <Text fw={800}>{declared.toLocaleString()}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">Verified</Text>
            <Text fw={800}>{verified.toLocaleString()}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">Variance</Text>
            <Text fw={800}>{variance.toLocaleString()}</Text>
          </div>
        </Group>

        <Group justify="space-between" mt="sm">
          <Button variant="light" onClick={doRefresh} loading={loading}>
            Refresh
          </Button>

          <Group gap="sm">
            <NumberInput
              label="Verified total"
              value={verifiedTotal}
              onChange={(v) => setVerifiedTotal(n(v))}
              min={0}
              w={180}
            />
            <Button onClick={doVerify} loading={loading} disabled={!canVerify}>
              Verify shift
            </Button>
          </Group>
        </Group>
      </Paper>

      <Paper p="sm" bg="gray.0" radius="md">
        <Text size="sm" fw={600} mb="sm">Payment Allocation (optional)</Text>
        <BulkPaymentAllocator
          transactions={allocatorTxs}
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
