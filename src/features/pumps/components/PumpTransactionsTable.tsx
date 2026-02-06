import { Table, Text, Loader, Center } from '@mantine/core';
import type { FuelTransaction } from '@/types/fuel';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { formatDateTime } from '@/lib/utils/dates';

interface PumpTransactionsTableProps {
  transactions: FuelTransaction[];
  isLoading?: boolean;
}

export function PumpTransactionsTable({ transactions, isLoading }: PumpTransactionsTableProps) {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

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
          <Table.Th>Fuel</Table.Th>
          <Table.Th>Volume</Table.Th>
          <Table.Th>Amount</Table.Th>
          <Table.Th>Attendant</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {transactions.map((tx) => (
          <Table.Tr key={tx.id}>
            <Table.Td>{formatDateTime(tx.timestamp)}</Table.Td>
            <Table.Td>{tx.fuelType}</Table.Td>
            <Table.Td>{formatVolume(tx.volume)}</Table.Td>
            <Table.Td>{formatMoney(tx.amount)}</Table.Td>
            <Table.Td>{tx.attendantId ?? '-'}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
