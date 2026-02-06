import { useParams } from 'react-router-dom';
import { Paper } from '@mantine/core';
import { Screen } from '@/layouts/Screen';
import { PumpTransactionsTable } from '../components/PumpTransactionsTable';
import type { FuelTransaction } from '@/types/fuel';
import { getMockTransactionsByPump } from '@/mocks';

export function PumpTransactionsScreen() {
  const { id } = useParams<{ id: string }>();

  const transactions: FuelTransaction[] = id ? getMockTransactionsByPump(id) : [];
  const isLoading = false;

  return (
    <Screen title={`Pump ${id} Transactions`}>
      <Paper p="md" radius="md" withBorder>
        <PumpTransactionsTable transactions={transactions} isLoading={isLoading} />
      </Paper>
    </Screen>
  );
}
