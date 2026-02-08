import { useState, useEffect } from 'react';
import { SimpleGrid, Loader, Center } from '@mantine/core';
import { Screen } from '@/layouts/Screen';
import { PumpCard } from '../components/PumpCard';
import type { Pump } from '@/types/pumps';
import { getApiService } from '@/lib/api/apiAdapter';

export function PumpsScreen() {
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {pumps.map((pump) => (
          <PumpCard key={pump.id} pump={pump} />
        ))}
      </SimpleGrid>
    </Screen>
  );
}
