import { useState, useEffect } from 'react';
import { Badge, Center, Group, Loader, SimpleGrid, Text } from '@mantine/core';
import { Screen } from '@/layouts/Screen';
import { PumpCard } from '../components/PumpCard';
import type { Pump } from '@/types/pumps';
import { getApiService } from '@/lib/api/apiAdapter';
import { env } from '@/config/env';
import { createInitialSimPumps, tickSimPumps } from '@/features/monitoring/simulators/pumpSimulator';

export function PumpsScreen() {
  const [pumps, setPumps] = useState<Pump[]>(() =>
    env.useMonitoringSimulator ? createInitialSimPumps() : []
  );
  const [isLoading, setIsLoading] = useState(!env.useMonitoringSimulator);

  useEffect(() => {
    if (env.useMonitoringSimulator) {
      const timer = window.setInterval(() => {
        setPumps((prev) => tickSimPumps(prev));
      }, 1000);

      setIsLoading(false);

      return () => {
        window.clearInterval(timer);
      };
    }

    async function loadPumps() {
      try {
        const api = await getApiService();
        const data = await api.getPumps();
        // Defensive: ensure we always have an array
        setPumps(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load pumps:', error);
        setPumps([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadPumps();
  }, []);

  if (isLoading) {
    return (
      <Screen title="Pumps">
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Screen>
    );
  }

  return (
    <Screen title="Pumps">
      {env.useMonitoringSimulator && (
        <Group mb="sm" gap="xs">
          <Badge variant="light" color="blue">SIMULATOR</Badge>
          <Text size="xs" c="dimmed">
            Live backend bypassed for UI development
          </Text>
        </Group>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {pumps.map((pump) => (
          <PumpCard key={pump.id} pump={pump} />
        ))}
      </SimpleGrid>
    </Screen>
  );
}
