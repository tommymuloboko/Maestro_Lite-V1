import { useState, useEffect } from 'react';
import { Loader, Center, Text, Box } from '@mantine/core';
import type { Tank, TankTrendPoint } from '@/types/tanks';
import { getApiService } from '@/lib/api/apiAdapter';
import { TankTrendChart } from './TankTrendChart';

interface TankTrendPanelProps {
  tankId: string;
}

export function TankTrendPanel({ tankId }: TankTrendPanelProps) {
  const [tank, setTank] = useState<Tank | null>(null);
  const [readings, setReadings] = useState<TankTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const api = await getApiService();
        const [tankData, trendData] = await Promise.all([
          api.getTank(tankId),
          api.getTankTrend(tankId),
        ]);

        if (!isMounted) return;
        setTank(tankData ?? null);
        setReadings(Array.isArray(trendData) ? trendData : []);
      } catch (error) {
        console.error('Failed to load tank trend:', error);
        if (!isMounted) return;
        setReadings([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [tankId]);

  if (isLoading) {
    return (
      <Center h={200}>
        <Loader size="md" />
      </Center>
    );
  }

  if (!tank) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        Tank not found
      </Text>
    );
  }

  if (readings.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        No trend data
      </Text>
    );
  }

  return (
    <Box>
      <TankTrendChart
        data={readings}
        deliveries={tank.deliveries ?? []}
        capacity={tank.capacity}
        fuelTypeId={tank.fuelTypeId}
        height={240}
      />
    </Box>
  );
}
