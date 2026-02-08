import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Grid, Stack, Text, Button, Group, Loader, Center } from '@mantine/core';
import { IconPrinter, IconCheck } from '@tabler/icons-react';
import { Screen } from '@/layouts/Screen';
import { TransactionsList } from '../components/TransactionsList';
import { VerificationWorkspace } from '../components/VerificationWorkspace';
import { VariancePanel } from '../components/VariancePanel';
import type { Shift } from '@/types/shifts';
import { getApiService } from '@/lib/api/apiAdapter';

export function ShiftDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const [shift, setShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShift() {
      if (!id) return;
      try {
        const api = await getApiService();
        const data = await api.getShift(id);
        setShift(data);
      } catch (error) {
        console.error('Failed to load shift:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadShift();
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
              <VerificationWorkspace shiftId={shift.id} />
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
