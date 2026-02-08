import { EChart } from '@/components/charts/EChart';
import type { EChartsOption } from 'echarts';

interface SalesTrendChartProps {
  labels: string[];
  values: number[];
  loading?: boolean;
}

interface PaymentPieChartDatum {
  name: string;
  value: number;
}

interface VerifiedPaymentPieChartProps {
  data: PaymentPieChartDatum[];
  loading?: boolean;
}

export function SalesTrendChart({ labels, values, loading }: SalesTrendChartProps) {
  const hasData = values.some((value) => value > 0);

  const option: EChartsOption = {
    tooltip: { trigger: 'axis' },
    grid: {
      top: 24,
      right: 18,
      bottom: 34,
      left: 44,
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: { color: '#64748b', fontSize: 11 },
      axisLine: { lineStyle: { color: '#d1d5db' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748b', fontSize: 11 },
      splitLine: { lineStyle: { color: '#e5e7eb' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: values,
        showSymbol: false,
        lineStyle: { width: 3, color: '#0f766e' },
        areaStyle: {
          color: 'rgba(15, 118, 110, 0.18)',
        },
      },
    ],
    graphic: !hasData
      ? [
          {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: 'No sales data for selected range',
              fill: '#64748b',
              fontSize: 13,
            },
          },
        ]
      : undefined,
  };

  return <EChart option={option} loading={loading} height={280} />;
}

export function VerifiedPaymentPieChart({ data, loading }: VerifiedPaymentPieChartProps) {
  const hasData = data.some((item) => item.value > 0);

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      valueFormatter: (value) => `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#475569', fontSize: 12 },
    },
    series: [
      {
        type: 'pie',
        radius: ['55%', '75%'],
        center: ['50%', '46%'],
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: false } },
        data,
        color: ['#0f766e', '#2563eb', '#7c3aed', '#ea580c', '#94a3b8', '#059669'],
      },
    ],
    graphic: !hasData
      ? [
          {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: 'No verified transactions',
              fill: '#64748b',
              fontSize: 13,
            },
          },
        ]
      : undefined,
  };

  return <EChart option={option} loading={loading} height={280} />;
}
