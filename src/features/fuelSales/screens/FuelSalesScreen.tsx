import { useMemo, useState } from 'react';
import { Button, Group, Text, Badge, Stack, Loader, Center } from '@mantine/core';
import { IconDownload, IconRefresh } from '@tabler/icons-react';
import { Screen } from '@/layouts/Screen';
import { DataTable } from '@/components/common/DataTable';
import { FuelSalesFilters } from '../components/FuelSalesFilters';
import type { RawFuelTransaction } from '@/types/fuel';
import { formatMoney } from '@/lib/utils/money';
import { formatDateTime } from '@/lib/utils/dates';
import { useTransactions, useTransactionsSummary } from '../api/transactions.hooks';

export function FuelSalesScreen() {
  const [filters] = useState({ limit: 100, offset: 0 });

  const { data, isLoading, refetch, isFetching } = useTransactions(filters);
  const { data: summary } = useTransactionsSummary();

  const transactions = useMemo(() => data?.transactions ?? [], [data]);

  const columns = [
    {
      key: 'time',
      header: 'Time',
      render: (tx: RawFuelTransaction) => formatDateTime(tx.time),
    },
    {
      key: 'pump',
      header: 'Pump',
      render: (tx: RawFuelTransaction) => `Pump ${tx.pumpId}`,
    },
    {
      key: 'tagNumber',
      header: 'Tag',
      render: (tx: RawFuelTransaction) => tx.tagNumber || '-',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (tx: RawFuelTransaction) => formatMoney(tx.amount),
    },
    {
      key: 'currency',
      header: 'Currency',
      render: (tx: RawFuelTransaction) => tx.currency,
    },
    {
      key: 'status',
      header: 'Status',
      render: (tx: RawFuelTransaction) => (
        <Badge color={tx.isVerified ? 'green' : 'orange'} size="sm">
          {tx.isVerified ? 'Verified' : 'Unverified'}
        </Badge>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Screen title="Fuel Sales">
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Screen>
    );
  }

  return (
    <Screen
      title="Fuel Sales"
      actions={
        <Group gap="xs">
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
            loading={isFetching}
          >
            Refresh
          </Button>
          <Button variant="light" leftSection={<IconDownload size={16} />}>
            Export CSV
          </Button>
        </Group>
      }
    >
      <Stack gap="md">
        {/* Summary Stats */}
        {summary && (
          <Group gap="lg">
            <Text size="sm" c="dimmed">
              Total: <Text span fw={600}>{summary.totalCount}</Text> transactions
            </Text>
            <Text size="sm" c="dimmed">
              Verified: <Text span fw={600} c="green">{formatMoney(summary.verifiedTotal)}</Text>
            </Text>
            <Text size="sm" c="dimmed">
              Unverified: <Text span fw={600} c="orange">{formatMoney(summary.unverifiedTotal)}</Text>
            </Text>
          </Group>
        )}

        <FuelSalesFilters />

        <DataTable
          data={transactions}
          columns={columns}
          isLoading={isLoading}
          getRowKey={(tx) => tx.id}
          emptyMessage="No transactions found"
        />

        {data && (
          <Text size="xs" c="dimmed" ta="center">
            Showing {transactions.length} of {data.count} transactions
          </Text>
        )}
      </Stack>
    </Screen>
  );
}
