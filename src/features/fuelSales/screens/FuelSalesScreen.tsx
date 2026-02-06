import { Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { Screen } from '@/layouts/Screen';
import { DataTable } from '@/components/common/DataTable';
import { FuelSalesFilters } from '../components/FuelSalesFilters';
import type { FuelTransaction } from '@/types/fuel';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { formatDateTime } from '@/lib/utils/dates';
import { paymentTypeLabels } from '@/config/stationDefaults';
import { mockFuelTransactions } from '@/mocks';

export function FuelSalesScreen() {
  const transactions: FuelTransaction[] = mockFuelTransactions;
  const isLoading = false;

  const columns = [
    {
      key: 'timestamp',
      header: 'Time',
      render: (tx: FuelTransaction) => formatDateTime(tx.timestamp),
    },
    {
      key: 'pump',
      header: 'Pump',
      render: (tx: FuelTransaction) => tx.pumpId,
    },
    {
      key: 'fuelType',
      header: 'Fuel',
      render: (tx: FuelTransaction) => tx.fuelType,
    },
    {
      key: 'volume',
      header: 'Volume',
      render: (tx: FuelTransaction) => formatVolume(tx.volume),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (tx: FuelTransaction) => formatMoney(tx.amount),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (tx: FuelTransaction) => paymentTypeLabels[tx.paymentType],
    },
  ];

  return (
    <Screen
      title="Fuel Sales"
      actions={
        <Button variant="light" leftSection={<IconDownload size={16} />}>
          Export CSV
        </Button>
      }
    >
      <FuelSalesFilters />

      <DataTable
        data={transactions}
        columns={columns}
        isLoading={isLoading}
        getRowKey={(tx) => tx.id}
        emptyMessage="No transactions found"
      />
    </Screen>
  );
}
