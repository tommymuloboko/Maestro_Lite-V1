import { SimpleGrid, Group, Text, Badge, Stack } from '@mantine/core';
import { TankCard } from '../components/TankCard';
import { mockTanks } from '@/mocks';

export function TanksScreen() {
  const tanks = mockTanks;
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
    </Stack>
  );
}
