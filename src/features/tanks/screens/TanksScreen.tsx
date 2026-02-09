import { useState, useEffect } from 'react';
import { SimpleGrid, Group, Text, Badge, Stack, Loader, Center } from '@mantine/core';
import { TankCard } from '../components/TankCard';
import type { Tank } from '@/types/tanks';
import { getApiService } from '@/lib/api/apiAdapter';
import { env } from '@/config/env';
import { createInitialSimTanks, tickSimTanks } from '@/features/monitoring/simulators/tankSimulator';

export function TanksScreen() {
  const [tanks, setTanks] = useState<Tank[]>(() =>
    env.useMonitoringSimulator ? createInitialSimTanks() : []
  );
  const [isLoading, setIsLoading] = useState(!env.useMonitoringSimulator);

  useEffect(() => {
    if (env.useMonitoringSimulator) {
      const timer = window.setInterval(() => {
        setTanks((prev) => tickSimTanks(prev));
      }, 1500);

      setIsLoading(false);

      return () => {
        window.clearInterval(timer);
      };
    }

    async function loadTanks() {
      try {
        const api = await getApiService();
        const data = await api.getTanks();
        // Defensive: ensure nested arrays exist even if backend payload is partial.
        const normalized = Array.isArray(data)
          ? data.map((tank) => ({
            ...tank,
            deliveries: Array.isArray(tank.deliveries) ? tank.deliveries : [],
            alarms: Array.isArray(tank.alarms) ? tank.alarms : [],
          }))
          : [];
        setTanks(normalized);
      } catch (error) {
        console.error('Failed to load tanks:', error);
        setTanks([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadTanks();
  }, []);

  if (isLoading) {
    return (
      <Center h={300}>
        <Loader size="lg" />
      </Center>
    );
  }

  const totalAlarms = tanks.reduce(
    (sum, tank) => sum + (Array.isArray(tank.alarms) ? tank.alarms.length : 0),
    0
  );
  const isSimulator = env.useMonitoringSimulator || tanks.some((t) => t.atgSource === 'SIMULATOR');

  return (
    <Stack gap="md">
      {/* Header row */}
      <Group gap="sm">
        <Text fw={700} size="lg">Tanks</Text>
        <Badge variant="filled" color="brand" size="md" circle>
          {tanks.length}
        </Badge>
        {totalAlarms > 0 && (
          <Badge variant="filled" color="red" size="md">
            {totalAlarms} Alert{totalAlarms > 1 ? 's' : ''}
          </Badge>
        )}
        {isSimulator && (
          <Badge variant="light" color="gray" size="md">
            SIMULATOR
          </Badge>
        )}
      </Group>

      {/* Tank cards grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {tanks.map((tank) => (
          <TankCard key={tank.id} tank={tank} />
        ))}
      </SimpleGrid>

      {tanks.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">No tanks configured</Text>
      )}
    </Stack>
  );
}
