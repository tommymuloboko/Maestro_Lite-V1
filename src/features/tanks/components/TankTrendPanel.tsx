import { useState, useEffect } from 'react';
import { Loader, Center } from '@mantine/core';
import { TankTrendChart } from '@/components/charts/TankTrendChart';
import type { Tank, TankTrendPoint } from '@/types/tanks';
import { getApiService } from '@/lib/api/apiAdapter';

interface TankTrendPanelProps {
  tankId: string;
}

export function TankTrendPanel({ tankId }: TankTrendPanelProps) {
  const [tank, setTank] = useState<Tank | null>(null);
  const [readings, setReadings] = useState<TankTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const api = await getApiService();
        const [tankData, trendData] = await Promise.all([
          api.getTank(tankId),
          api.getTankTrend(tankId),
        ]);
        setTank(tankData);
        setReadings(trendData);
      } catch (error) {
        console.error('Failed to load tank trend:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [tankId]);

  if (isLoading) {
    return (
      <Center h={200}>
        <Loader size="md" />
      </Center>
    );
  }

  const tankName = tank?.name ?? 'Tank';
  const capacity = tank?.capacity ?? 20000;

  // Convert TankTrendPoint[] to TankReading[] for the shared chart component
  const chartReadings = readings.map((p, i) => ({
    id: `${tankId}-${i}`,
    tankId,
    volume: p.volume,
    level: tank ? (p.volume / tank.capacity) * 100 : 0,
    temperature: p.temperature,
    timestamp: p.timestamp,
  }));

  return (
    <TankTrendChart
      readings={chartReadings}
      tankName={tankName}
      capacity={capacity}
      loading={isLoading}
    />
  );
}
