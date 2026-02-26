import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table, Text, Loader, Center, Group, Select, Badge, Paper, Stack,
  ThemeIcon, Box,
} from '@mantine/core';
import { IconDroplet, IconGasStation } from '@tabler/icons-react';
import { DateRangePicker } from '@/components/common/DateRangePicker';
import type { DateRange } from '@/types/common';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { env } from '@/config/env';

// ─── Types matching backend payload ─────────────────────────

interface PtsTransaction {
  DateTime: string;
  Pump: number;
  Nozzle: number;
  FuelGradeId: number;
  FuelGradeName: string;
  Transaction: number;
  UserId: number;
  Volume: number;
  Amount: number;
  Price: number;
  TotalVolume: number;
  TotalAmount: number;
  DateTimeStart: string;
  TCVolume: number;
  FlowRate: number;
  IsOffline: boolean;
  IsPaid: boolean;
  Tag: string;
}

// ─── Pump options (1-20) ────────────────────────────────────

const PUMP_OPTIONS = [
  { value: 'all', label: 'All Pumps' },
  ...Array.from({ length: 20 }, (_, i) => ({
    value: String(i + 1),
    label: `Pump ${i + 1}`,
  })),
];

function fuelColor(fuelType: string): string {
  const t = fuelType.toLowerCase();
  if (t.includes('diesel')) return 'blue';
  if (t.includes('petrol') || t.includes('gasoline')) return 'orange';
  return 'green';
}

// ─── Component ──────────────────────────────────────────────

export function PumpTotalsReport() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const endOfDay = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const [pumpFilter, setPumpFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>({ start: today, end: endOfDay });
  const [data, setData] = useState<PtsTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!dateRange.start || !dateRange.end) return;

    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = env.apiUrl || `http://${window.location.hostname}:3000/api`;
      const params = new URLSearchParams();

      if (pumpFilter !== 'all') {
        params.set('pump', pumpFilter);
      }

      // Format as local YYYY-MM-DDTHH:MM:SS (no ms, no Z) — what the backend expects
      const pad = (n: number) => String(n).padStart(2, '0');
      const fmtDate = (d: Date, endOfDay = false) => {
        const y = d.getFullYear();
        const m = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hh = endOfDay ? '23' : '00';
        const mm = endOfDay ? '59' : '00';
        const ss = endOfDay ? '59' : '00';
        return `${y}-${m}-${day}T${hh}:${mm}:${ss}`;
      };

      params.set('start', fmtDate(dateRange.start));
      params.set('end', fmtDate(dateRange.end, true));

      const url = `${apiUrl}/pts/reports/pump-transactions?${params.toString()}`;
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      setData(json.data ?? []);
    } catch (err) {
      console.error('[PumpTotalsReport] Failed to fetch:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [pumpFilter, dateRange]);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchReport();
    }
  }, [fetchReport]);

  // ── Summary calculations ──

  const summary = useMemo(() => {
    const totalVolume = data.reduce((sum, t) => sum + t.Volume, 0);
    const totalAmount = data.reduce((sum, t) => sum + t.Amount, 0);
    const txCount = data.length;

    // Group by fuel grade
    const byFuel = new Map<string, { volume: number; amount: number; count: number }>();
    for (const t of data) {
      const key = t.FuelGradeName;
      const prev = byFuel.get(key) ?? { volume: 0, amount: 0, count: 0 };
      byFuel.set(key, {
        volume: prev.volume + t.Volume,
        amount: prev.amount + t.Amount,
        count: prev.count + 1,
      });
    }

    return { totalVolume, totalAmount, txCount, byFuel };
  }, [data]);

  return (
    <Stack gap="md">
      {/* ── Filters ── */}
      <Group gap="md" align="flex-end" wrap="wrap">
        <Select
          label="Pump"
          data={PUMP_OPTIONS}
          value={pumpFilter}
          onChange={(v) => setPumpFilter(v ?? 'all')}
          w={160}
          allowDeselect={false}
        />
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          label="Period"
        />
      </Group>

      {/* ── Summary Cards ── */}
      {data.length > 0 && (
        <Group gap="md" wrap="wrap">
          <Paper p="sm" radius="md" withBorder style={{ flex: 1, minWidth: 140 }}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Transactions</Text>
            <Text size="xl" fw={800}>{summary.txCount}</Text>
          </Paper>
          <Paper p="sm" radius="md" withBorder style={{ flex: 1, minWidth: 140 }}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Total Volume</Text>
            <Text size="xl" fw={800}>{formatVolume(summary.totalVolume)}</Text>
          </Paper>
          <Paper p="sm" radius="md" withBorder style={{ flex: 1, minWidth: 140 }}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Total Sales</Text>
            <Text size="xl" fw={800}>{formatMoney(summary.totalAmount)}</Text>
          </Paper>
          {[...summary.byFuel.entries()].map(([fuel, totals]) => (
            <Paper key={fuel} p="sm" radius="md" withBorder style={{ flex: 1, minWidth: 140 }}>
              <Group gap={6} mb={4}>
                <ThemeIcon size="xs" color={fuelColor(fuel)} variant="light" radius="xl">
                  <IconDroplet size={10} />
                </ThemeIcon>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{fuel}</Text>
              </Group>
              <Text size="lg" fw={700}>{formatVolume(totals.volume)}</Text>
              <Text size="xs" c="dimmed">{formatMoney(totals.amount)} · {totals.count} txns</Text>
            </Paper>
          ))}
        </Group>
      )}

      {/* ── Loading / Error ── */}
      {isLoading && (
        <Center h={200}>
          <Loader size="lg" />
        </Center>
      )}

      {error && (
        <Text c="red" ta="center" py="md">{error}</Text>
      )}

      {/* ── Data Table ── */}
      {!isLoading && data.length > 0 && (
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Time</Table.Th>
                <Table.Th>Pump</Table.Th>
                <Table.Th>Fuel</Table.Th>
                <Table.Th>Tx #</Table.Th>
                <Table.Th ta="right">Volume (L)</Table.Th>
                <Table.Th ta="right">Price</Table.Th>
                <Table.Th ta="right">Amount</Table.Th>
                <Table.Th ta="right">Totalizer</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((tx) => (
                <Table.Tr key={`${tx.Pump}-${tx.Transaction}`}>
                  <Table.Td>
                    <Text size="sm" ff="monospace">
                      {new Date(tx.DateTime).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={6} wrap="nowrap">
                      <IconGasStation size={14} />
                      <Text size="sm" fw={600}>Pump {tx.Pump}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light" color={fuelColor(tx.FuelGradeName)}>
                      {tx.FuelGradeName}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">#{tx.Transaction}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={600} ff="monospace">{tx.Volume.toFixed(2)}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" c="dimmed" ff="monospace">{tx.Price.toFixed(2)}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={700} ff="monospace">{formatMoney(tx.Amount)}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" c="dimmed" ff="monospace">
                      {tx.TotalVolume.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      )}

      {/* ── Empty state ── */}
      {!isLoading && data.length === 0 && !error && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          {dateRange.start && dateRange.end
            ? 'No transactions found for the selected period'
            : 'Select a date range to view pump transactions'}
        </Text>
      )}
    </Stack>
  );
}
