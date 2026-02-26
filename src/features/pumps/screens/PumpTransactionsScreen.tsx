import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Loader, Center } from '@mantine/core';
import { Screen } from '@/layouts/Screen';
import { PumpTransactionsTable } from '../components/PumpTransactionsTable';
import type { FuelTransaction } from '@/types/fuel';
import { getApiService } from '@/lib/api/apiAdapter';

export function PumpTransactionsScreen() {
  const { id } = useParams<{ id: string }>();
  const [transactions, setTransactions] = useState<FuelTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    async function loadTransactions() {
      try {
        const api = await getApiService();
        const data = await api.getPumpTransactions(id!);
        setTransactions(data);
      } catch (error) {
        console.error('Failed to load pump transactions:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTransactions();
  }, [id]);

  if (isLoading) {
    return (
      <Screen title={`Pump ${id} Transactions`}>
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Screen>
    );
  }

  return (
    <Screen title={`Pump ${id} Transactions`}>
      <Paper p="md" radius="md" withBorder>
        <PumpTransactionsTable transactions={transactions} isLoading={isLoading} />
      </Paper>
    </Screen>
  );
}
