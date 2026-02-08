import { useMemo, useState } from 'react';
import { DatePickerInput } from '@mantine/dates';
import { Grid, Group, Paper, SegmentedControl, Stack, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import {
  IconAlertTriangle,
  IconChartLine,
  IconClockPlay,
  IconGasStation,
  IconReportAnalytics,
  IconRoute,
  IconShoppingCartDollar,
} from '@tabler/icons-react';
import type { FuelSalesFiltersDto } from '@/lib/api/dto';
import type { DateRange } from '@/types/common';
import type { FuelTransaction } from '@/types/fuel';
import { paymentTypeLabels } from '@/config/stationDefaults';
import { formatMoney } from '@/lib/utils/money';
import { paths } from '@/routes/paths';
import { useFuelSales } from '@/features/fuelSales/api/fuelSales.hooks';
import { useLivePumps } from '@/hooks/useLivePumps';
import { useDashboardAlerts, useDashboardSummary } from '../api/dashboard.hooks';
import { DashboardQuickActions, type DashboardQuickActionItem } from '../components/DashboardQuickActions';
import { SalesTrendChart, VerifiedPaymentPieChart } from '../components/DashboardCharts';
import { RecentSalesTable, type RecentTransactionRow } from '../components/RecentSalesTable';
import { SalesMetricCard } from '../components/SalesMetricCard';

type DatePreset = 'daily' | 'weekly' | 'monthly' | 'custom';

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function toDayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function safeTimestamp(dateLike: string) {
  const value = new Date(dateLike).getTime();
  return Number.isNaN(value) ? 0 : value;
}

function resolveDateRange(preset: DatePreset, customRange: DateRange) {
  const now = new Date();

  if (preset === 'daily') {
    return { start: startOfDay(now), end: endOfDay(now) };
  }

  if (preset === 'weekly') {
    return { start: startOfDay(addDays(now, -6)), end: endOfDay(now) };
  }

  if (preset === 'monthly') {
    return { start: startOfDay(addDays(now, -29)), end: endOfDay(now) };
  }

  if (customRange.start && customRange.end) {
    return { start: startOfDay(customRange.start), end: endOfDay(customRange.end) };
  }

  return { start: startOfDay(addDays(now, -6)), end: endOfDay(now) };
}

function buildSalesTrend(transactions: FuelTransaction[], preset: DatePreset, start: Date, end: Date) {
  const values: number[] = [];
  const labels: string[] = [];
  const startMs = start.getTime();
  const endMs = end.getTime();

  if (preset === 'daily') {
    const hourlyValues = new Array<number>(24).fill(0);

    for (const tx of transactions) {
      const txTime = safeTimestamp(tx.timestamp);
      if (txTime < startMs || txTime > endMs) continue;
      const hour = new Date(txTime).getHours();
      hourlyValues[hour] += tx.amount ?? 0;
    }

    for (let hour = 0; hour < 24; hour += 1) {
      labels.push(`${String(hour).padStart(2, '0')}:00`);
      values.push(hourlyValues[hour]);
    }

    return { labels, values };
  }

  const days: Date[] = [];
  const cursor = startOfDay(start);
  const endDate = startOfDay(end);
  while (cursor.getTime() <= endDate.getTime()) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const dayIndex = new Map<string, number>();
  days.forEach((day, index) => {
    dayIndex.set(toDayKey(day), index);
    labels.push(formatDayLabel(day));
    values.push(0);
  });

  for (const tx of transactions) {
    const txTime = safeTimestamp(tx.timestamp);
    if (txTime < startMs || txTime > endMs) continue;

    const key = toDayKey(new Date(txTime));
    const index = dayIndex.get(key);
    if (typeof index === 'number') {
      values[index] += tx.amount ?? 0;
    }
  }

  return { labels, values };
}

function buildVerifiedPaymentBreakdown(transactions: FuelTransaction[]) {
  const totals = new Map<string, number>();

  for (const tx of transactions) {
    if (!tx.isVerified || !tx.paymentType) continue;
    const paymentLabel = paymentTypeLabels[tx.paymentType] ?? tx.paymentType;
    totals.set(paymentLabel, (totals.get(paymentLabel) ?? 0) + (tx.amount ?? 0));
  }

  return [...totals.entries()].map(([name, value]) => ({ name, value }));
}

function mapRecentTransactions(transactions: FuelTransaction[]): RecentTransactionRow[] {
  return [...transactions]
    .sort((a, b) => safeTimestamp(b.timestamp) - safeTimestamp(a.timestamp))
    .slice(0, 5)
    .map((tx) => ({
      id: tx.id,
      time: new Date(tx.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      reference: tx.transactionNumber || tx.id.slice(-8),
      pump: `Pump ${tx.pumpId}`,
      amount: formatMoney(tx.amount ?? 0),
      payment: tx.paymentType ? paymentTypeLabels[tx.paymentType] : 'Unassigned',
      status: tx.isVerified ? 'verified' : 'unverified',
    }));
}

export default function DashboardScreen() {
  const navigate = useNavigate();
  const [preset, setPreset] = useState<DatePreset>('weekly');
  const [customRange, setCustomRange] = useState<DateRange>({
    start: startOfDay(addDays(new Date(), -6)),
    end: endOfDay(new Date()),
  });

  const dateRange = useMemo(() => resolveDateRange(preset, customRange), [preset, customRange]);

  const chartFilters = useMemo<FuelSalesFiltersDto>(
    () => ({
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString(),
      page: 1,
      pageSize: 500,
    }),
    [dateRange.end, dateRange.start]
  );

  const latestFilters = useMemo<FuelSalesFiltersDto>(
    () => ({
      page: 1,
      pageSize: 100,
    }),
    []
  );

  const { data: summary } = useDashboardSummary();
  const { data: alertsData = [] } = useDashboardAlerts();
  const { data: pumpsData = [] } = useLivePumps();
  const { data: rangeSalesData, isLoading: isRangeSalesLoading } = useFuelSales(chartFilters);
  const { data: latestSalesData, isLoading: isLatestSalesLoading } = useFuelSales(latestFilters);

  const rangeTransactions = useMemo(() => {
    const data = rangeSalesData?.data;
    return Array.isArray(data) ? data : [];
  }, [rangeSalesData]);

  const latestTransactions = useMemo(() => {
    const data = latestSalesData?.data;
    return Array.isArray(data) ? data : [];
  }, [latestSalesData]);

  const totalFuelSales = useMemo(() => {
    const total = rangeTransactions.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
    return total > 0 || rangeTransactions.length > 0 ? total : (summary?.todaySales ?? 0);
  }, [rangeTransactions, summary?.todaySales]);

  const activePumpMeta = useMemo(() => {
    const pumps = Array.isArray(pumpsData) ? pumpsData : [];

    if (pumps.length > 0) {
      const active = pumps.filter((pump) => pump.status !== 'offline' && pump.status !== 'error').length;
      return { active, total: pumps.length };
    }

    const active = (summary?.pumpStatus?.online ?? 0) + (summary?.pumpStatus?.fueling ?? 0);
    const total = active + (summary?.pumpStatus?.offline ?? 0);
    return { active, total };
  }, [pumpsData, summary?.pumpStatus?.fueling, summary?.pumpStatus?.offline, summary?.pumpStatus?.online]);

  const unverifiedTxnCount = useMemo(() => {
    if (rangeTransactions.length > 0) {
      return rangeTransactions.filter((tx) => !tx.isVerified).length;
    }

    return summary?.unverifiedShifts ?? 0;
  }, [rangeTransactions, summary?.unverifiedShifts]);

  const safeAlerts = Array.isArray(alertsData) ? alertsData : [];
  const tankAlertCount = safeAlerts.length > 0 ? safeAlerts.length : (summary?.tankAlerts ?? 0);

  const trendSeries = useMemo(
    () => buildSalesTrend(rangeTransactions, preset, dateRange.start, dateRange.end),
    [dateRange.end, dateRange.start, preset, rangeTransactions]
  );
  const paymentBreakdown = useMemo(
    () => buildVerifiedPaymentBreakdown(rangeTransactions),
    [rangeTransactions]
  );
  const recentRows = useMemo(() => mapRecentTransactions(latestTransactions), [latestTransactions]);

  const quickActions = useMemo<DashboardQuickActionItem[]>(
    () => [
      {
        id: 'fuel-sales',
        label: 'Fuel Sales',
        icon: IconShoppingCartDollar,
        onClick: () => navigate(paths.fuelSales),
      },
      {
        id: 'monitoring',
        label: 'Monitoring',
        icon: IconRoute,
        onClick: () => navigate(paths.monitoring),
      },
      {
        id: 'shifts',
        label: 'Shifts',
        icon: IconClockPlay,
        onClick: () => navigate(paths.monitoringShifts),
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: IconReportAnalytics,
        onClick: () => navigate(paths.reports),
      },
    ],
    [navigate]
  );

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
        <div>
          <Text fw={700} size="xl">
            Dashboard
          </Text>
          <Text size="sm" c="dimmed">
            Operations overview, sales trend, and recent transaction activity
          </Text>
        </div>

        <Group gap="xs" align="flex-end">
          <SegmentedControl
            size="sm"
            value={preset}
            onChange={(value) => setPreset(value as DatePreset)}
            data={[
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' },
              { label: 'Custom', value: 'custom' },
            ]}
          />
          {preset === 'custom' ? (
            <Group gap="xs" wrap="nowrap">
              <DatePickerInput
                value={customRange.start}
                onChange={(date) => setCustomRange((prev) => ({ ...prev, start: date ? new Date(date) : null }))}
                placeholder="From"
                clearable
                size="sm"
                maxDate={customRange.end ?? undefined}
              />
              <DatePickerInput
                value={customRange.end}
                onChange={(date) => setCustomRange((prev) => ({ ...prev, end: date ? new Date(date) : null }))}
                placeholder="To"
                clearable
                size="sm"
                minDate={customRange.start ?? undefined}
              />
            </Group>
          ) : null}
        </Group>
      </Group>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <SalesMetricCard
            label="Fuel Sales"
            value={formatMoney(totalFuelSales)}
            icon={IconChartLine}
            color="teal"
            helper="Selected period total"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <SalesMetricCard
            label="Active Pumps"
            value={`${activePumpMeta.active} / ${activePumpMeta.total}`}
            icon={IconGasStation}
            color="blue"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <SalesMetricCard
            label="Unverified Txn"
            value={String(unverifiedTxnCount)}
            icon={IconShoppingCartDollar}
            color="orange"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <SalesMetricCard
            label="Tank Alerts"
            value={String(tankAlertCount)}
            icon={IconAlertTriangle}
            color="red"
          />
        </Grid.Col>
      </Grid>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper p="md" radius="md" withBorder bg="white">
            <Text fw={600} mb="sm">
              Overall Sales Trend
            </Text>
            <SalesTrendChart
              labels={trendSeries.labels}
              values={trendSeries.values}
              loading={isRangeSalesLoading}
            />
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper p="md" radius="md" withBorder bg="white">
            <Text fw={600} mb="sm">
              Verified Fuel Txn by Payment Type
            </Text>
            <VerifiedPaymentPieChart data={paymentBreakdown} loading={isRangeSalesLoading} />
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, xl: 8 }}>
          <RecentSalesTable
            rows={recentRows}
            loading={isLatestSalesLoading}
            onViewAll={() => navigate(paths.fuelSales)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, xl: 4 }}>
          <DashboardQuickActions actions={quickActions} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
