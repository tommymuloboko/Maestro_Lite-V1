import { useState, useEffect } from 'react';
import { SimpleGrid, Group, Text, Badge, Stack, Loader, Center } from '@mantine/core';
import { TankCard } from '../components/TankCard';
import type { Tank } from '@/types/tanks';
import { getApiService } from '@/lib/api/apiAdapter';

export function TanksScreen() {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTanks() {
      try {
        const api = await getApiService();
        const data = await api.getTanks();
        // Defensive: ensure we always have an array
        setTanks(Array.isArray(data) ? data : []);
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

  const totalAlarms = tanks.reduce((sum, t) => sum + t.alarms.length, 0);
  const isSimulator = tanks.some((t) => t.atgSource === 'SIMULATOR');

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
