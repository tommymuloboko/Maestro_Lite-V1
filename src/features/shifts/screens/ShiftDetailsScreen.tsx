import { useParams } from 'react-router-dom';
import { Paper, Grid, Stack, Text, Button, Group } from '@mantine/core';
import { IconPrinter, IconCheck } from '@tabler/icons-react';
import { Screen } from '@/layouts/Screen';
import { TransactionsList } from '../components/TransactionsList';
import { VerificationWorkspace } from '../components/VerificationWorkspace';
import { VariancePanel } from '../components/VariancePanel';
import { getMockShiftById } from '@/mocks';

export function ShiftDetailsScreen() {
  const { id } = useParams<{ id: string }>();

  const shift = id ? getMockShiftById(id) ?? null : null;
  const isLoading = false;

  if (isLoading) {
    return <Screen title="Loading..."><Text>Loading shift details...</Text></Screen>;
  }

  if (!shift) {
    return <Screen title="Shift Not Found"><Text>Shift not found</Text></Screen>;
  }

  return (
    <Screen
      title={`Shift Details`}
      actions={
        <Group gap="sm">
          <Button variant="light" leftSection={<IconPrinter size={16} />}>
            Print
          </Button>
          <Button leftSection={<IconCheck size={16} />}>
            Verify Shift
          </Button>
        </Group>
      }
    >
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="md">
            <Paper p="md" radius="md" withBorder>
              <Text fw={600} mb="md">Transactions</Text>
              <TransactionsList transactions={shift.transactions} />
            </Paper>

            <Paper p="md" radius="md" withBorder>
              <Text fw={600} mb="md">Verification</Text>
              <VerificationWorkspace />
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper p="md" radius="md" withBorder>
            <Text fw={600} mb="md">Variance Summary</Text>
            <VariancePanel />
          </Paper>
        </Grid.Col>
      </Grid>
    </Screen>
  );
}
