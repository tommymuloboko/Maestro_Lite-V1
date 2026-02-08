import { Badge, Box, Group, Loader, Paper, Table, Text, UnstyledButton } from '@mantine/core';
import { IconFileOff } from '@tabler/icons-react';

export interface RecentTransactionRow {
  id: string;
  time: string;
  reference: string;
  pump: string;
  amount: string;
  payment: string;
  status: 'verified' | 'unverified';
}

const statusColors: Record<RecentTransactionRow['status'], string> = {
  verified: 'green',
  unverified: 'orange',
};

interface RecentSalesTableProps {
  rows: RecentTransactionRow[];
  loading?: boolean;
  onViewAll: () => void;
}

export function RecentSalesTable({ rows, loading, onViewAll }: RecentSalesTableProps) {
  return (
    <Paper p="md" radius="md" withBorder bg="white">
      <Group justify="space-between" align="center" mb="sm">
        <div>
          <Text fw={600}>
            Recent Transactions
          </Text>
          <Text c="dimmed" size="xs">
            Last 5 transactions
          </Text>
        </div>

        <UnstyledButton
          onClick={onViewAll}
          style={{
            color: '#0f6d71',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          View All
        </UnstyledButton>
      </Group>

      <Box style={{ overflowX: 'auto' }}>
        <Table horizontalSpacing="sm" verticalSpacing="xs" miw={760}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>TIME</Table.Th>
              <Table.Th>REFERENCE</Table.Th>
              <Table.Th>PUMP</Table.Th>
              <Table.Th>AMOUNT</Table.Th>
              <Table.Th>PAYMENT</Table.Th>
              <Table.Th>STATUS</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Group justify="center" py="sm">
                    <Loader size="sm" />
                  </Group>
                </Table.Td>
              </Table.Tr>
            ) : null}

            {rows.map((row) => (
              <Table.Tr key={row.id}>
                <Table.Td>
                  <Text size="sm">{row.time}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{row.reference}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{row.pump}</Text>
                </Table.Td>
                <Table.Td>
                  <Text fw={600} size="sm">{row.amount}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{row.payment}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color={statusColors[row.status]} radius="sm">
                    {row.status}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}

            {!loading && rows.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Group justify="center" gap="xs" py="md">
                    <IconFileOff size={18} />
                    <Text c="dimmed" size="sm">No transactions found</Text>
                  </Group>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Box>
    </Paper>
  );
}
