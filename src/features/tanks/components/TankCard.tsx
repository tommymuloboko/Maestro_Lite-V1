import { Paper, Group, Text, Badge, Box, SimpleGrid } from '@mantine/core';
import { IconDroplet, IconTemperature, IconTruckDelivery } from '@tabler/icons-react';
import type { Tank, TankStatus } from '@/types/tanks';
import { TankTrendChart } from './TankTrendChart';
import { getMockTankTrend } from '@/mocks';

interface TankCardProps {
  tank: Tank;
}

const statusColors: Record<TankStatus, string> = {
  normal: 'green',
  low: 'orange',
  critical: 'red',
  overfill: 'violet',
  offline: 'gray',
  sensor_fault: 'orange',
  water_detected: 'orange',
};

const statusLabels: Record<TankStatus, string> = {
  normal: 'NORMAL',
  low: 'LOW',
  critical: 'CRITICAL',
  overfill: 'OVERFILL',
  offline: 'OFFLINE',
  sensor_fault: 'SENSOR FAULT',
  water_detected: 'WATER DETECTED',
};

function formatNum(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function getGaugeColor(fuelTypeId: string): string {
  return fuelTypeId === 'diesel' ? '#3b82f6' : '#22c55e';
}

export function TankCard({ tank }: TankCardProps) {
  const gaugeColor = getGaugeColor(tank.fuelTypeId);
  const fillPercent = Math.min(100, Math.max(0, tank.currentLevel));
  const waterWarning = tank.waterHeight > 0;

  // Water height as a percentage of the gauge
  const waterPercent = tank.capacity > 0
    ? Math.min(fillPercent, (tank.waterHeight / (tank.capacity * 0.01)) * 0.5)
    : 0;

  const trendData = getMockTankTrend(tank.id);
  const latestDelivery = tank.deliveries.length > 0
    ? tank.deliveries[tank.deliveries.length - 1]
    : null;

  return (
    <Paper p="lg" radius="md" withBorder>
      {/* Header: Tank name + fuel type + status */}
      <Group justify="space-between" align="flex-start" mb="md">
        <div>
          <Group gap={8} align="baseline">
            <Text fw={700} size="lg">{tank.name}</Text>
            <Text c="dimmed" size="sm">— {tank.fuelType}</Text>
          </Group>
          <Text size="xs" c="dimmed" mt={2} ff="monospace">
            ATG: {tank.atgSource}
          </Text>
        </div>
        <Badge
          color={statusColors[tank.status]}
          variant="filled"
          size="lg"
          styles={{ root: { textTransform: 'uppercase', fontWeight: 700 } }}
        >
          {statusLabels[tank.status]}
        </Badge>
      </Group>

      {/* Main content: Gauge + Stats */}
      <Group align="flex-start" gap="lg" wrap="nowrap">
        {/* Tank gauge visual */}
        <Box style={{ flexShrink: 0 }}>
          <Box
            style={{
              position: 'relative',
              width: 80,
              height: 200,
              borderRadius: 12,
              border: '2px solid #e0e0e0',
              overflow: 'hidden',
              background: '#f5f5f5',
            }}
          >
            {/* Fuel fill */}
            <Box
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${fillPercent}%`,
                background: gaugeColor,
                borderRadius: '0 0 10px 10px',
                transition: 'height 300ms ease',
              }}
            />
            {/* Water layer (blue band at bottom) */}
            {waterWarning && waterPercent > 0 && (
              <Box
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: `${waterPercent}%`,
                  background: 'rgba(59, 130, 246, 0.6)',
                  borderRadius: '0 0 10px 10px',
                  zIndex: 1,
                }}
              />
            )}
            {/* Percentage badge */}
            <Box
              style={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'white',
                border: `2px solid ${gaugeColor}`,
                display: 'grid',
                placeItems: 'center',
                zIndex: 2,
              }}
            >
              <Text fw={700} size="xs" c={gaugeColor}>
                {fillPercent}%
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Stats side */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          {/* Volume + Ullage boxes */}
          <SimpleGrid cols={2} spacing="xs" mb="sm">
            <Paper p="xs" withBorder radius="sm">
              <Text size="xs" c="dimmed">Volume</Text>
              <Text fw={700} size="md">{formatNum(tank.currentVolume)}</Text>
              <Text size="xs" c="dimmed">L</Text>
            </Paper>
            <Paper p="xs" withBorder radius="sm">
              <Text size="xs" c="dimmed">Ullage</Text>
              <Text fw={700} size="md">{formatNum(tank.ullage)}</Text>
              <Text size="xs" c="dimmed">L</Text>
            </Paper>
          </SimpleGrid>

          {/* Capacity + Temperature */}
          <Group gap="lg" mb="sm">
            <div>
              <Group gap={4} align="center">
                <IconDroplet size={14} color="#999" />
                <Text size="xs" c="dimmed">Capacity</Text>
              </Group>
              <Text fw={700}>{formatNum(tank.capacity)} L</Text>
            </div>
            <div>
              <Group gap={4} align="center">
                <IconTemperature size={14} color="#999" />
                <Text size="xs" c="dimmed">Temperature</Text>
              </Group>
              <Text fw={700}>{tank.temperature.toFixed(1)}°C</Text>
            </div>
          </Group>

          {/* Product Height + Water Height */}
          <Group gap="lg">
            <div>
              <Text size="xs" c="dimmed">Product Height</Text>
              <Text fw={700}>{tank.productHeight} mm</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Water Height</Text>
              <Text fw={700} c={waterWarning ? 'orange' : undefined}>
                {tank.waterHeight} mm
              </Text>
            </div>
          </Group>
        </Box>
      </Group>

      {/* 24h Volume Trend Chart */}
      {trendData.length > 0 && (
        <Box mt="md">
          <Text size="xs" c="dimmed" mb={4}>24h Volume Trend</Text>
          <TankTrendChart
            data={trendData}
            deliveries={tank.deliveries}
            capacity={tank.capacity}
            fuelTypeId={tank.fuelTypeId}
            height={180}
          />
        </Box>
      )}

      {/* Latest Delivery Info */}
      {latestDelivery && (
        <Paper p="xs" withBorder radius="sm" mt="sm" bg="gray.0">
          <Group gap={6} align="center" mb={2}>
            <IconTruckDelivery size={14} color="#f97316" />
            <Text size="xs" fw={600}>Latest Delivery</Text>
          </Group>
          <Text size="sm" fw={700}>
            +{formatNum(latestDelivery.volumeDelivered)} L
          </Text>
          <Text size="xs" c="dimmed">
            {formatDate(latestDelivery.startTime)}
          </Text>
        </Paper>
      )}

      {/* Last updated */}
      <Text size="xs" c="dimmed" ta="right" mt="md">
        Last updated: {formatDate(tank.lastUpdated)}
      </Text>
    </Paper>
  );
}
