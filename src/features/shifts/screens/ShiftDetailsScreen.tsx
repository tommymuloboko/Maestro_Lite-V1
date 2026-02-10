import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Grid, Stack, Text, Button, Group, Loader, Center, Badge } from '@mantine/core';
import { IconPrinter, IconCheck } from '@tabler/icons-react';
import { Screen } from '@/layouts/Screen';
import { TransactionsList } from '../components/TransactionsList';
import { VerificationWorkspace } from '../components/VerificationWorkspace';
import { VariancePanel } from '../components/VariancePanel';
import { attendantShiftsApi } from '../api/attendantShiftsApi';
import type { ShiftDetails } from '../types/attendantShifts';

function fmt(dt: string | null | undefined) {
  if (!dt) return '-';
  return new Date(dt).toLocaleString();
}

export function ShiftDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<ShiftDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShift() {
      if (!id) return;
      try {
        const res = await attendantShiftsApi.getShiftDetails(id);
        setDetails(res.data);
      } catch (error) {
        console.error('Failed to load shift:', error);
        setDetails(null);
      } finally {
        setIsLoading(false);
      }
    }
    void loadShift();
  }, [id]);

  if (isLoading) {
    return (
      <Screen title="Loading...">
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Screen>
    );
  }

  if (!details) {
    return (
      <Screen title="Shift Not Found">
        <Text>Shift not found</Text>
      </Screen>
    );
  }

  const { shift, close_declaration, verification_summary, transaction_summary } = details;

  return (
    <Screen
      title="Shift Details"
      actions={
        <Group gap="sm">
          <Button variant="light" leftSection={<IconPrinter size={16} />}>
            Print
          </Button>
          <Button leftSection={<IconCheck size={16} />} variant="light">
            Verify
          </Button>
        </Group>
      }
    >
      <Paper p="md" radius="md" withBorder mb="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text fw={800}>
              {shift.attendant_name ?? shift.attendant_no ?? 'Attendant'} • Tag {shift.tag_number}
            </Text>
            <Text size="sm" c="dimmed">Started: {fmt(shift.started_at)}</Text>
            <Text size="sm" c="dimmed">Ended: {fmt(shift.ended_at)}</Text>
          </div>

          <Group gap="xs">
            <Badge variant="light" color={shift.is_open ? 'green' : 'gray'}>
              {shift.is_open ? 'OPEN' : 'CLOSED'}
            </Badge>
            <Badge variant="light" color={shift.is_pending_verification ? 'orange' : 'green'}>
              {shift.is_pending_verification ? 'PENDING' : 'OK'}
            </Badge>
          </Group>
        </Group>

        <Group mt="sm" gap="lg">
          <Text size="sm" c="dimmed">Transactions: <Text span fw={800}>{transaction_summary.transaction_count}</Text></Text>
          <Text size="sm" c="dimmed">Total: <Text span fw={800}>{transaction_summary.total_amount.toLocaleString()}</Text></Text>
          <Text size="sm" c="dimmed">Verified: <Text span fw={800}>{transaction_summary.verified_count}</Text></Text>
        </Group>
      </Paper>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="md">
            <Paper p="md" radius="md" withBorder>
              <Text fw={600} mb="md">Transactions</Text>
              <TransactionsList transactions={[]} />
            </Paper>

            <Paper p="md" radius="md" withBorder>
              <Text fw={600} mb="md">Verification</Text>
              <VerificationWorkspace shiftId={shift.id} details={details} />
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper p="md" radius="md" withBorder>
            <Text fw={600} mb="md">Variance Summary</Text>
            <VariancePanel
              transactionTotal={transaction_summary.total_amount}
              declaration={close_declaration}
              verification={verification_summary}
            />
          </Paper>
        </Grid.Col>
      </Grid>
    </Screen>
  );
}
