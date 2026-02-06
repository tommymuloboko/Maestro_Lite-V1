import { Table, Badge, Button, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { formatMoney } from '@/lib/utils/money';
import { formatDateTime } from '@/lib/utils/dates';

interface UnverifiedShift {
  id: string;
  attendantName: string;
  endTime: string;
  totalSales: number;
  variance: number;
}

export function LatestUnverifiedTable() {
  const navigate = useNavigate();

  // TODO: Replace with real data from useUnverifiedShifts hook
  const shifts: UnverifiedShift[] = [
    {
      id: '1',
      attendantName: 'John Mwamba',
      endTime: '2026-02-06T14:30:00Z',
      totalSales: 45200,
      variance: -150,
    },
    {
      id: '2',
      attendantName: 'Mary Banda',
      endTime: '2026-02-06T08:00:00Z',
      totalSales: 38750,
      variance: 25,
    },
  ];

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
            <Table.Td>{shift.attendantName}</Table.Td>
            <Table.Td>{formatDateTime(shift.endTime)}</Table.Td>
            <Table.Td>{formatMoney(shift.totalSales)}</Table.Td>
            <Table.Td>
              <Badge color={shift.variance < 0 ? 'red' : 'green'}>
                {formatMoney(shift.variance)}
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
