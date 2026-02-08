import { useMemo, useState } from 'react';
import { Table, Text, Loader, Center } from '@mantine/core';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import type { DateRange } from '@/types/common';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { formatDate } from '@/lib/utils/dates';
import { useDailySalesReport } from '../api/reports.hooks';

export function DailySalesByPaymentReport() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const filters = useMemo(
    () => ({
      startDate: dateRange.start?.toISOString(),
      endDate: dateRange.end?.toISOString(),
    }),
    [dateRange]
  );
  const { data = [], isLoading } = useDailySalesReport(filters);

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
              <Table.Th>Date</Table.Th>
              <Table.Th>Total Sales</Table.Th>
              <Table.Th>Volume</Table.Th>
              <Table.Th>Transactions</Table.Th>
              <Table.Th>Cash</Table.Th>
              <Table.Th>Card</Table.Th>
              <Table.Th>Mobile</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((row) => (
              <Table.Tr key={row.date}>
                <Table.Td>{formatDate(row.date)}</Table.Td>
                <Table.Td>{formatMoney(row.totalSales)}</Table.Td>
                <Table.Td>{formatVolume(row.totalVolume)}</Table.Td>
                <Table.Td>{row.transactionCount}</Table.Td>
                <Table.Td>{formatMoney(row.byPaymentType.cash ?? 0)}</Table.Td>
                <Table.Td>{formatMoney(row.byPaymentType.card ?? 0)}</Table.Td>
                <Table.Td>{formatMoney(row.byPaymentType.mobile ?? 0)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {data.length === 0 && !isLoading && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No sales data for selected period
        </Text>
      )}
    </div>
  );
}
