import { Table, Badge, Text } from '@mantine/core';
import type { FuelTransaction } from '@/types/fuel';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { formatTime } from '@/lib/utils/dates';
import { paymentTypeLabels } from '@/config/stationDefaults';

interface TransactionsListProps {
  transactions?: FuelTransaction[];
}

export function TransactionsList({ transactions = [] }: TransactionsListProps) {
  if (transactions.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        No transactions available for this shift (summary only).
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
          <Table.Tr key={tx.id}>
            <Table.Td>{formatTime(tx.timestamp)}</Table.Td>
            <Table.Td>{tx.pumpId}</Table.Td>
            <Table.Td>{tx.fuelType}</Table.Td>
            <Table.Td>{formatVolume(tx.volume)}</Table.Td>
            <Table.Td>{formatMoney(tx.amount)}</Table.Td>
            <Table.Td>
              <Badge variant="light">
                {tx.paymentType ? paymentTypeLabels[tx.paymentType] : 'Unassigned'}
              </Badge>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
