import { useState, useEffect, useCallback } from 'react';
import { SimpleGrid, Group, Text, Badge, Stack, Loader, Center, ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { TankCard } from '../components/TankCard';
import type { Tank } from '@/types/tanks';
import { getApiService } from '@/lib/api/apiAdapter';
import { createInitialSimTanks, tickSimTanks } from '@/features/monitoring/simulators/tankSimulator';
import { useDataSource } from '@/context/DataSourceContext';
import { DataSourceToggle } from '@/components/DataSourceToggle';

export function TanksScreen() {
  const { useSimulator } = useDataSource();
  const navigate = useNavigate();

  const [tanks, setTanks] = useState<Tank[]>(() =>
    useSimulator ? createInitialSimTanks() : []
  );
  const [isLoading, setIsLoading] = useState(!useSimulator);

  const loadRealTanks = useCallback(async () => {
    setIsLoading(true);
    try {
      const api = await getApiService();
      const data = await api.getTanks();
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
  }, []);

  useEffect(() => {
    if (useSimulator) {
      // Switch to simulator data
      setTanks(createInitialSimTanks());
      setIsLoading(false);

      const timer = window.setInterval(() => {
        setTanks((prev) => tickSimTanks(prev));
      }, 1500);

      return () => {
        window.clearInterval(timer);
      };
    }

    // Switch to real data
    loadRealTanks();
  }, [useSimulator, loadRealTanks]);

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
  const isSimulatorData = useSimulator || tanks.some((t) => t.atgSource === 'SIMULATOR');

  return (
    <Stack gap="md">
      {/* Header row */}
      <Group gap="sm" justify="space-between">
        <Group gap="sm">
          <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => navigate(-1)} aria-label="Go back">
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Text fw={700} size="lg">Tanks</Text>
          <Badge variant="filled" color="brand" size="md" circle>
            {tanks.length}
          </Badge>
          {totalAlarms > 0 && (
            <Badge variant="filled" color="red" size="md">
              {totalAlarms} Alert{totalAlarms > 1 ? 's' : ''}
            </Badge>
          )}
          {isSimulatorData && (
            <Badge variant="light" color="gray" size="md">
              SIMULATOR
            </Badge>
          )}
        </Group>
        <DataSourceToggle />
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
