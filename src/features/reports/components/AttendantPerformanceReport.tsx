import { useMemo, useState } from 'react';
import { Table, Text, Loader, Center } from '@mantine/core';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import type { DateRange } from '@/types/common';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { useAttendantPerformanceReport } from '../api/reports.hooks';

export function AttendantPerformanceReport() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const filters = useMemo(
    () => ({
      startDate: dateRange.start?.toISOString(),
      endDate: dateRange.end?.toISOString(),
    }),
    [dateRange]
  );
  const { data = [], isLoading } = useAttendantPerformanceReport(filters);

  return (
    <div>
      <DateRangePicker value={dateRange} onChange={setDateRange} label="Period" />

      {isLoading ? (
        <Center h={200}>
          <Loader size="lg" />
        </Center>
      ) : (
        <Table striped highlightOnHover mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Attendant</Table.Th>
              <Table.Th>Shifts</Table.Th>
              <Table.Th>Total Sales</Table.Th>
              <Table.Th>Volume</Table.Th>
              <Table.Th>Transactions</Table.Th>
              <Table.Th>Avg Variance</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((row) => (
              <Table.Tr key={row.attendantId}>
                <Table.Td>{row.attendantName}</Table.Td>
                <Table.Td>{row.shiftCount}</Table.Td>
                <Table.Td>{formatMoney(row.totalSales)}</Table.Td>
                <Table.Td>{formatVolume(row.totalVolume)}</Table.Td>
                <Table.Td>{row.transactionCount}</Table.Td>
                <Table.Td>{formatMoney(row.averageVariance)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {data.length === 0 && !isLoading && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No attendant data for selected period
        </Text>
      )}
    </div>
  );
}
