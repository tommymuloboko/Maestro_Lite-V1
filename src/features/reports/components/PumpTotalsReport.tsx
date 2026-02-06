import { useState } from 'react';
import { Table, Text } from '@mantine/core';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import type { DateRange } from '@/types/common';
import type { PumpTotalsReport as PumpTotalsReportType } from '@/types/reports';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { mockPumpTotalsReports } from '@/mocks';

export function PumpTotalsReport() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });

  const data: PumpTotalsReportType[] = mockPumpTotalsReports;
  const isLoading = false;

  return (
    <div>
      <DateRangePicker value={dateRange} onChange={setDateRange} label="Period" />

      <Table striped highlightOnHover mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Pump</Table.Th>
            <Table.Th>Total Volume</Table.Th>
            <Table.Th>Total Sales</Table.Th>
            <Table.Th>Transactions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((row) => (
            <Table.Tr key={row.pumpId}>
              <Table.Td>Pump {row.pumpNumber}</Table.Td>
              <Table.Td>{formatVolume(row.totalVolume)}</Table.Td>
              <Table.Td>{formatMoney(row.totalSales)}</Table.Td>
              <Table.Td>{row.transactionCount}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {data.length === 0 && !isLoading && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No pump data for selected period
        </Text>
      )}
    </div>
  );
}
