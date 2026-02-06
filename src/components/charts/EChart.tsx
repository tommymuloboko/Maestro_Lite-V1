import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useMantineColorScheme } from '@mantine/core';

interface EChartProps {
  option: EChartsOption;
  height?: number | string;
  loading?: boolean;
}

export function EChart({ option, height = 300, loading }: EChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current, colorScheme);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [colorScheme]);

  useEffect(() => {
    if (chartInstance.current) {
      if (loading) {
        chartInstance.current.showLoading();
      } else {
        chartInstance.current.hideLoading();
        chartInstance.current.setOption(option);
      }
    }
  }, [option, loading]);

  return <div ref={chartRef} style={{ width: '100%', height }} />;
}
