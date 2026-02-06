import { Table, Text } from '@mantine/core';
import type { FuelTransaction } from '@/types/fuel';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { formatDateTime } from '@/lib/utils/dates';
import { paymentTypeLabels } from '@/config/stationDefaults';

interface FuelSalesTableProps {
  transactions: FuelTransaction[];
  onRowClick?: (tx: FuelTransaction) => void;
}

export function FuelSalesTable({ transactions, onRowClick }: FuelSalesTableProps) {
  if (transactions.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="xl">
        No transactions found
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Time</Table.Th>
          <Table.Th>Pump</Table.Th>
          <Table.Th>Fuel</Table.Th>
          <Table.Th>Volume</Table.Th>
          <Table.Th>Amount</Table.Th>
          <Table.Th>Payment</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {transactions.map((tx) => (
          <Table.Tr
            key={tx.id}
            style={{ cursor: onRowClick ? 'pointer' : undefined }}
            onClick={() => onRowClick?.(tx)}
          >
            <Table.Td>{formatDateTime(tx.timestamp)}</Table.Td>
            <Table.Td>{tx.pumpId}</Table.Td>
            <Table.Td>{tx.fuelType}</Table.Td>
            <Table.Td>{formatVolume(tx.volume)}</Table.Td>
            <Table.Td>{formatMoney(tx.amount)}</Table.Td>
            <Table.Td>{paymentTypeLabels[tx.paymentType]}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
