import { useMemo } from 'react';
import { EChart } from '@/components/charts/EChart';
import type { EChartsOption } from 'echarts';
import type { TankTrendPoint, TankDeliveryEvent } from '@/types/tanks';

interface TankTrendChartProps {
  data: TankTrendPoint[];
  deliveries: TankDeliveryEvent[];
  capacity: number;
  fuelTypeId: string;
  height?: number;
}

function getLineColor(fuelTypeId: string): string {
  return fuelTypeId === 'diesel' ? '#3b82f6' : '#22c55e';
}

export function TankTrendChart({
  data,
  deliveries,
  capacity,
  fuelTypeId,
  height = 180,
}: TankTrendChartProps) {
  const color = getLineColor(fuelTypeId);

  const option = useMemo<EChartsOption>(() => {
    const volumeData = data.map((p) => [p.timestamp, p.volume]);

    // Delivery scatter points + markLines
    const deliveryScatter = deliveries.map((d) => ({
      value: [d.startTime, d.volumeAfter],
      itemStyle: { color: '#f97316' },
    }));

    const deliveryMarkLines = deliveries.map((d) => ({
      xAxis: d.startTime,
      label: {
        formatter: `+${d.volumeDelivered.toLocaleString()}L`,
        fontSize: 10,
        color: '#f97316',
      },
      lineStyle: {
        type: 'dashed' as const,
        color: '#f97316',
        width: 1,
      },
    }));

    return {
      grid: {
        top: 30,
        bottom: 25,
        left: 55,
        right: 15,
      },
      tooltip: {
        trigger: 'axis',
        formatter(params: unknown) {
          const p = Array.isArray(params) ? params[0] : params;
          const item = p as { value: [string, number] };
          if (!item?.value) return '';
          const time = new Date(item.value[0]).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
          return `${time}<br/>Volume: <b>${item.value[1].toLocaleString()}</b> L`;
        },
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (value: number) => {
            const d = new Date(value);
            return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          },
          fontSize: 10,
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        max: capacity,
        name: 'L',
        nameTextStyle: { fontSize: 10 },
        axisLabel: {
          fontSize: 10,
          formatter: (value: number) => {
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
            return String(value);
          },
        },
        splitLine: {
          lineStyle: { type: 'dashed', opacity: 0.3 },
        },
      },
      series: [
        {
          name: 'Volume',
          type: 'line',
          data: volumeData,
          smooth: true,
          showSymbol: false,
          lineStyle: { color, width: 2 },
          areaStyle: { color, opacity: 0.15 },
        },
        ...(deliveryScatter.length > 0
          ? [
              {
                name: 'Deliveries',
                type: 'scatter' as const,
                data: deliveryScatter,
                symbolSize: 10,
                symbol: 'diamond',
                z: 10,
                markLine: {
                  symbol: 'none',
                  data: deliveryMarkLines,
                },
              },
            ]
          : []),
      ],
    };
  }, [data, deliveries, capacity, fuelTypeId, color]);

  if (data.length === 0) return null;

  return <EChart option={option} height={height} />;
}
