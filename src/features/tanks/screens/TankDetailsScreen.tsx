import { useParams } from 'react-router-dom';
import { Grid, Paper, Text } from '@mantine/core';
import { Screen } from '@/layouts/Screen';
import { TankAlertsPanel } from '../components/TankAlertsPanel';
import { TankTrendPanel } from '../components/TankTrendPanel';
import { TankCard } from '../components/TankCard';
import type { Tank } from '@/types/tanks';
import { getMockTankById } from '@/mocks';

export function TankDetailsScreen() {
  const { id } = useParams<{ id: string }>();

  const tank: Tank | null = id ? getMockTankById(id) ?? null : null;
  const isLoading = false;

  if (isLoading) {
    return <Screen title="Loading..."><Text>Loading tank details...</Text></Screen>;
  }

  if (!tank) {
    return <Screen title="Tank Not Found"><Text>Tank not found</Text></Screen>;
  }

  return (
    <Screen title={tank.name}>
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <TankCard tank={tank} />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper p="md" radius="md" withBorder mb="md">
            <Text fw={600} mb="md">Level Trend</Text>
            <TankTrendPanel tankId={tank.id} />
          </Paper>

          <Paper p="md" radius="md" withBorder>
            <Text fw={600} mb="md">Alerts</Text>
            <TankAlertsPanel tankId={tank.id} />
          </Paper>
        </Grid.Col>
      </Grid>
    </Screen>
  );
}
