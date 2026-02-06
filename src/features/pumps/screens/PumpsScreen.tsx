import { SimpleGrid } from '@mantine/core';
import { Screen } from '@/layouts/Screen';
import { PumpCard } from '../components/PumpCard';
import { mockPumps } from '@/mocks';

export function PumpsScreen() {
  const pumps = mockPumps;

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
