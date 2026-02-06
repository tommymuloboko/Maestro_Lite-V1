import { EChart } from './EChart';

interface PumpActivityData {
  pumpNumber: number;
  transactionCount: number;
  totalVolume: number;
}

interface PumpActivityChartProps {
  data: PumpActivityData[];
  loading?: boolean;
}

export function PumpActivityChart({ data, loading }: PumpActivityChartProps) {
  const option = {
    title: {
      text: 'Pump Activity',
      left: 'center' as const,
    },
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: {
        type: 'shadow' as const,
      },
    },
    legend: {
      bottom: 0,
    },
    xAxis: {
      type: 'category' as const,
      data: data.map((d) => `Pump ${d.pumpNumber}`),
    },
    yAxis: [
      {
        type: 'value' as const,
        name: 'Transactions',
        position: 'left' as const,
      },
      {
        type: 'value' as const,
        name: 'Volume (L)',
        position: 'right' as const,
      },
    ],
    series: [
      {
        name: 'Transactions',
        type: 'bar' as const,
        data: data.map((d) => d.transactionCount),
      },
      {
        name: 'Volume',
        type: 'bar' as const,
        yAxisIndex: 1,
        data: data.map((d) => d.totalVolume),
      },
    ],
  };

  return <EChart option={option} loading={loading} height={300} />;
}
