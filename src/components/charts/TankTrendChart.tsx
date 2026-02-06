import { EChart } from './EChart';
import type { TankReading } from '@/types/tanks';

interface TankTrendChartProps {
  readings: TankReading[];
  tankName: string;
  capacity: number;
  loading?: boolean;
}

export function TankTrendChart({ readings, tankName, capacity, loading }: TankTrendChartProps) {
  const option = {
    title: {
      text: `${tankName} Level Trend`,
      left: 'center' as const,
    },
    tooltip: {
      trigger: 'axis' as const,
    },
    xAxis: {
      type: 'time' as const,
    },
    yAxis: {
      type: 'value' as const,
      name: 'Volume (L)',
      max: capacity,
    },
    series: [
      {
        name: 'Volume',
        type: 'line' as const,
        data: readings.map((r) => [r.timestamp, r.volume]),
        smooth: true,
        areaStyle: {
          opacity: 0.3,
        },
      },
    ],
  };

  return <EChart option={option} loading={loading} height={250} />;
}
