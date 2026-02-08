import { Table, Badge, Button, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { formatMoney } from '@/lib/utils/money';
import { formatDateTime } from '@/lib/utils/dates';
import { useRecentUnverifiedShifts } from '../api/dashboard.hooks';

export function LatestUnverifiedTable() {
  const navigate = useNavigate();
  const { data: shifts = [], isLoading, isError } = useRecentUnverifiedShifts();

  if (isLoading) {
    return <Text size="sm" c="dimmed" ta="center" py="md">Loading shifts...</Text>;
  }

  if (isError) {
    return <Text size="sm" c="red" ta="center" py="md">Unable to load shifts</Text>;
  }

  if (shifts.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        All shifts verified
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Attendant</Table.Th>
          <Table.Th>Ended</Table.Th>
          <Table.Th>Sales</Table.Th>
          <Table.Th>Variance</Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {shifts.map((shift) => (
          <Table.Tr key={shift.id}>
            <Table.Td>{shift.attendant?.name ?? 'Unknown'}</Table.Td>
            <Table.Td>{formatDateTime(shift.endTime ?? shift.startTime)}</Table.Td>
            <Table.Td>{formatMoney(shift.transactions.reduce((sum, tx) => sum + tx.amount, 0))}</Table.Td>
            <Table.Td>
              <Badge color={(shift.verificationSummary?.varianceAmount ?? shift.variance?.variance ?? 0) < 0 ? 'red' : 'green'}>
                {formatMoney(shift.verificationSummary?.varianceAmount ?? shift.variance?.variance ?? 0)}
              </Badge>
            </Table.Td>
            <Table.Td>
              <Button
                size="xs"
                variant="light"
                onClick={() => navigate(paths.shiftDetails(shift.id))}
              >
                Review
              </Button>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
