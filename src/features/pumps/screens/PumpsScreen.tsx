import { useState, useEffect, useCallback } from 'react';
import { Badge, Center, Group, Loader, SimpleGrid, Text } from '@mantine/core';
import { Screen } from '@/layouts/Screen';
import { PumpCard } from '../components/PumpCard';
import type { Pump } from '@/types/pumps';
import { getApiService } from '@/lib/api/apiAdapter';
import { createInitialSimPumps, tickSimPumps } from '@/features/monitoring/simulators/pumpSimulator';
import { useDataSource } from '@/context/DataSourceContext';
import { DataSourceToggle } from '@/components/DataSourceToggle';

export function PumpsScreen() {
  const { useSimulator } = useDataSource();

  const [pumps, setPumps] = useState<Pump[]>(() =>
    useSimulator ? createInitialSimPumps() : []
  );
  const [isLoading, setIsLoading] = useState(!useSimulator);

  const loadRealPumps = useCallback(async () => {
    setIsLoading(true);
    try {
      const api = await getApiService();
      const data = await api.getPumps();
      setPumps(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load pumps:', error);
      setPumps([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (useSimulator) {
      // Switch to simulator data
      setPumps(createInitialSimPumps());
      setIsLoading(false);

      const timer = window.setInterval(() => {
        setPumps((prev) => tickSimPumps(prev));
      }, 1000);

      return () => {
        window.clearInterval(timer);
      };
    }

    // Switch to real data
    loadRealPumps();
  }, [useSimulator, loadRealPumps]);

  if (isLoading) {
    return (
      <Screen title="Pumps" actions={<DataSourceToggle />}>
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Screen>
    );
  }

  return (
    <Screen title="Pumps" actions={<DataSourceToggle />}>
      {useSimulator && (
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
