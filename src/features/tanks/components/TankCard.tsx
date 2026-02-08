import { useState, useEffect } from 'react';
import { Paper, Group, Text, Badge, Box, SimpleGrid, Loader, Center } from '@mantine/core';
import { IconDroplet, IconTemperature, IconTruckDelivery } from '@tabler/icons-react';
import type { Tank, TankStatus, TankTrendPoint } from '@/types/tanks';
import { TankTrendChart } from './TankTrendChart';
import { getApiService } from '@/lib/api/apiAdapter';
import { buildSimTankTrend } from '@/features/monitoring/simulators/tankSimulator';

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

function getFuelColor(fuelTypeId: string): string {
  // You can swap petrol to your “fuel vibe” orange later if you want:
  // petrol -> '#f97316'
  return fuelTypeId === 'diesel' ? '#3b82f6' : '#22c55e';
}

function getStatusDotColor(status: TankStatus): string {
  switch (status) {
    case 'normal': return '#22c55e';
    case 'low': return '#f59e0b';
    case 'critical': return '#ef4444';
    case 'overfill': return '#8b5cf6';
    case 'offline': return '#9ca3af';
    case 'sensor_fault': return '#f59e0b';
    case 'water_detected': return '#f59e0b';
    default: return '#9ca3af';
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Horizontal underground ATG tank visual:
 * - metal shell + inner cavity
 * - product fill + water layer
 * - ATG probe + riser
 * - offline hatch overlay
 */
function AtgTankVisual({
  fillPercent,
  waterMm,
  productMm,
  capacityLiters,
  fuelColor,
  isOffline,
  status,
}: {
  fillPercent: number;
  waterMm: number;
  productMm: number;
  capacityLiters: number;
  fuelColor: string;
  isOffline: boolean;
  status: TankStatus;
}) {
  const pct = clamp(fillPercent, 0, 100);
  const hasWater = waterMm > 0;

  // Visual-only mapping:
  // Water band height should be subtle; we cap it so it never looks crazy.
  // If you later add tankHeightMm, you can do exact scaling.
  const waterBandPct = hasWater ? clamp((waterMm / Math.max(productMm + waterMm, 1)) * pct, 1, 8) : 0;

  const statusDot = getStatusDotColor(status);

  return (
    <Box style={{ width: '100%', maxWidth: 280, flexShrink: 0 }}>
      {/* Small hardware row (riser + probe head + status dot) */}
      <Group gap={10} align="center" mb={10}>
        <Box
          style={{
            width: 10,
            height: 22,
            borderRadius: 4,
            background: 'linear-gradient(180deg, #f3f4f6, #cbd5e1)',
            border: '1px solid #d1d5db',
          }}
        />
        <Box
          style={{
            width: 44,
            height: 22,
            borderRadius: 6,
            background: 'linear-gradient(180deg, #ffffff, #e5e7eb)',
            border: '1px solid #d1d5db',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          }}
        />
        <Group gap={6} align="center">
          <Box
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: statusDot,
              boxShadow: `0 0 0 3px rgba(0,0,0,0.04)`,
            }}
          />
          <Text size="xs" c="dimmed" fw={600}>
            ATG
          </Text>
        </Group>
      </Group>

      {/* Tank body */}
      <Box
        style={{
          position: 'relative',
          width: '100%',
          height: 120,
          borderRadius: 999,
          background: 'linear-gradient(180deg, #f8fafc 0%, #e5e7eb 45%, #f8fafc 100%)',
          border: '1px solid #d1d5db',
          boxShadow:
            'inset 0 10px 18px rgba(255,255,255,0.9), inset 0 -10px 18px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Inner cavity */}
        <Box
          style={{
            position: 'absolute',
            inset: 10,
            borderRadius: 999,
            background: 'linear-gradient(180deg, #ffffff, #f3f4f6)',
            border: '1px solid rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          {/* Ullage (empty space) is just the cavity background */}

          {/* Product fill (left-to-right) */}
          <Box
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct}%`,
              background: `linear-gradient(180deg, ${fuelColor} 0%, rgba(0,0,0,0.08) 120%)`,
              transition: 'width 350ms ease',
            }}
          >
            {/* Meniscus highlight */}
            <Box
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: 2,
                background: 'rgba(255,255,255,0.55)',
                opacity: 0.55,
              }}
            />
          </Box>

          {/* Water layer (thin band at bottom, only within filled region) */}
          {hasWater && waterBandPct > 0 && (
            <Box
              style={{
                position: 'absolute',
                left: 0,
                width: `${pct}%`,
                bottom: 0,
                height: `${waterBandPct}%`,
                background: 'rgba(59, 130, 246, 0.55)',
              }}
            />
          )}

          {/* Probe (from top down) */}
          <Box
            style={{
              position: 'absolute',
              left: '58%',
              top: -6,
              bottom: -6,
              width: 2,
              background: 'rgba(15, 23, 42, 0.35)',
            }}
          />
          {/* Probe tip marker */}
          <Box
            style={{
              position: 'absolute',
              left: '58%',
              top: '70%',
              transform: 'translateX(-50%)',
              width: 8,
              height: 8,
              borderRadius: 999,
              background: 'rgba(15, 23, 42, 0.35)',
            }}
          />

          {/* Tick marks (mm scale vibe) */}
          {Array.from({ length: 9 }).map((_, i) => (
            <Box
              key={i}
              style={{
                position: 'absolute',
                right: 10,
                top: 10 + i * 10,
                width: i % 2 === 0 ? 10 : 6,
                height: 1,
                background: 'rgba(15, 23, 42, 0.12)',
              }}
            />
          ))}

          {/* Offline hatch overlay */}
          {isOffline && (
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'repeating-linear-gradient(45deg, rgba(148,163,184,0.18), rgba(148,163,184,0.18) 8px, rgba(148,163,184,0.28) 8px, rgba(148,163,184,0.28) 16px)',
              }}
            />
          )}
        </Box>

        {/* Percent bubble (like a gauge label) */}
        <Box
          style={{
            position: 'absolute',
            right: 14,
            top: 14,
            padding: '6px 10px',
            borderRadius: 999,
            background: 'white',
            border: `1px solid rgba(0,0,0,0.12)`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <Text fw={800} size="xs" style={{ letterSpacing: 0.2 }}>
            {pct}%
          </Text>
        </Box>

        {/* Water callout */}
        {hasWater && (
          <Box
            style={{
              position: 'absolute',
              left: 14,
              bottom: 12,
              padding: '4px 8px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(0,0,0,0.10)',
            }}
          >
            <Text size="xs" fw={700} c="orange">
              WATER
            </Text>
          </Box>
        )}
      </Box>

      {/* Small caption row */}
      <Group justify="space-between" mt={10}>
        <Text size="xs" c="dimmed">Product</Text>
        <Text size="xs" c="dimmed">{capacityLiters > 0 ? `${pct}% full` : '—'}</Text>
      </Group>
    </Box>
  );
}

export function TankCard({ tank }: TankCardProps) {
  const [trendData, setTrendData] = useState<TankTrendPoint[]>([]);
  const [isLoadingTrend, setIsLoadingTrend] = useState(true);

  useEffect(() => {
    if (tank.atgSource === 'SIMULATOR') {
      setTrendData(buildSimTankTrend(tank));
      setIsLoadingTrend(false);
      return;
    }

    async function loadTrend() {
      try {
        const api = await getApiService();
        const data = await api.getTankTrend(tank.id);
        setTrendData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load tank trend:', error);
        setTrendData([]);
      } finally {
        setIsLoadingTrend(false);
      }
    }
    loadTrend();
  }, [tank]);

  const fuelColor = getFuelColor(tank.fuelTypeId);
  const fillPercent = clamp(tank.currentLevel, 0, 100);
  const waterWarning = tank.waterHeight > 0;
  const isOffline = tank.status === 'offline';

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

      {/* Main content: ATG Tank visual + Stats */}
      <Group align="flex-start" gap="lg" wrap="wrap">
        {/* Realistic ATG tank */}
        <AtgTankVisual
          fillPercent={fillPercent}
          waterMm={tank.waterHeight}
          productMm={tank.productHeight}
          capacityLiters={tank.capacity}
          fuelColor={fuelColor}
          isOffline={isOffline}
          status={tank.status}
        />

        {/* Stats side */}
        <Box style={{ flex: 1, minWidth: 220 }}>
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
      {isLoadingTrend ? (
        <Center h={180} mt="md">
          <Loader size="sm" />
        </Center>
      ) : trendData.length > 0 && (
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

      <Text size="xs" c="dimmed" ta="right" mt="md">
        Last updated: {formatDate(tank.lastUpdated)}
      </Text>
    </Paper>
  );
}
