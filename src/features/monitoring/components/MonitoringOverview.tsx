import { Grid, Paper, Text } from '@mantine/core';
import { StatCard } from '@/components/common/StatCard';
import { PumpStatusGrid } from '@/features/dashboard/components/PumpStatusGrid';
import { AlertsWidget } from '@/features/dashboard/components/AlertsWidget';

const stats = [
  { label: 'Active pumps', value: '3 / 4', trend: { value: 0, isPositive: true } },
  { label: 'Active shifts', value: '2', trend: { value: 1, isPositive: true } },
  { label: 'Tank alerts', value: '1', trend: { value: 0, isPositive: false } },
  { label: 'Today\'s volume', value: '4,320 L', trend: { value: 8.2, isPositive: true } },
];

export function MonitoringOverview() {
  return (
    <>
      <Grid mb="md" gutter="md">
        {stats.map((stat) => (
          <Grid.Col key={stat.label} span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard {...stat} />
          </Grid.Col>
        ))}
      </Grid>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper p="md" radius="md" withBorder>
            <Text fw={600} mb="md">Pump Status</Text>
            <PumpStatusGrid />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper p="md" radius="md" withBorder>
            <Text fw={600} mb="md">Active Alerts</Text>
            <AlertsWidget />
          </Paper>
        </Grid.Col>
      </Grid>
    </>
  );
}
