import { useState } from 'react';
import { Table, Text, Badge } from '@mantine/core';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import type { DateRange } from '@/types/common';
import type { ShiftSummaryReport as ShiftSummaryReportType } from '@/types/reports';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { formatDateTime } from '@/lib/utils/dates';
import { mockShiftSummaryReports } from '@/mocks';

export function ShiftSummaryReport() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  const data: ShiftSummaryReportType[] = mockShiftSummaryReports;
  const isLoading = false;

  return (
    <div>
      <DateRangePicker value={dateRange} onChange={setDateRange} label="Period" />

      <Table striped highlightOnHover mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Attendant</Table.Th>
            <Table.Th>Start</Table.Th>
            <Table.Th>End</Table.Th>
            <Table.Th>Sales</Table.Th>
            <Table.Th>Volume</Table.Th>
            <Table.Th>Variance</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((row) => (
            <Table.Tr key={row.shiftId}>
              <Table.Td>{row.attendantName}</Table.Td>
              <Table.Td>{formatDateTime(row.startTime)}</Table.Td>
              <Table.Td>{formatDateTime(row.endTime)}</Table.Td>
              <Table.Td>{formatMoney(row.totalSales)}</Table.Td>
              <Table.Td>{formatVolume(row.totalVolume)}</Table.Td>
              <Table.Td>
                <Badge color={row.variance < 0 ? 'red' : 'green'}>
                  {formatMoney(row.variance)}
                </Badge>
              </Table.Td>
              <Table.Td>{row.status}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {data.length === 0 && !isLoading && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No shift data for selected period
        </Text>
      )}
    </div>
  );
}
