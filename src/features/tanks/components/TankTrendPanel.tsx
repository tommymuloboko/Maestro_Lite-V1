import { TankTrendChart } from '@/components/charts/TankTrendChart';
import { getMockTankTrend, getMockTankById } from '@/mocks';

interface TankTrendPanelProps {
  tankId: string;
}

export function TankTrendPanel({ tankId }: TankTrendPanelProps) {
  const tank = getMockTankById(tankId);
  const readings = getMockTankTrend(tankId);
  const isLoading = false;

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
