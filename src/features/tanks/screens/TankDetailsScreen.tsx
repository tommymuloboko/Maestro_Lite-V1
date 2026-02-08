import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Paper, Text, Loader, Center, Group } from '@mantine/core';
import { Screen } from '@/layouts/Screen';
import { TankAlertsPanel } from '../components/TankAlertsPanel';
import { TankTrendPanel } from '../components/TankTrendPanel';
import { TankCard } from '../components/TankCard';
import type { Tank } from '@/types/tanks';
import { getApiService } from '@/lib/api/apiAdapter';

export function TankDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const [tank, setTank] = useState<Tank | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTank() {
      if (!id) return;
      try {
        const api = await getApiService();
        const data = await api.getTank(id);
        setTank(data);
      } catch (error) {
        console.error('Failed to load tank:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTank();
  }, [id]);

  if (isLoading) {
    return (
      <Screen title="Loading...">
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Screen>
    );
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
            <Group justify="space-between" mb="md">
              <Text fw={700}>Level Trend</Text>
              <Text size="xs" c="dimmed">Last 24h</Text>
            </Group>
            <TankTrendPanel tankId={tank.id} />
          </Paper>

          <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Text fw={700}>Alerts</Text>
              <Text size="xs" c="dimmed">Active</Text>
            </Group>
            <TankAlertsPanel tankId={tank.id} />
          </Paper>
        </Grid.Col>
      </Grid>
    </Screen>
  );
}
