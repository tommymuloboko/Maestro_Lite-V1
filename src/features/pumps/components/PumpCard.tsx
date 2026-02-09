import { Paper, Stack, Group, Text, Badge, Box, Button, Divider } from '@mantine/core';
import { IconGasStation, IconHistory, IconBolt } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { Pump, PumpStatus } from '@/types/pumps';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { paths } from '@/routes/paths';

interface PumpCardProps {
  pump: Pump;
}

const statusColors: Record<PumpStatus, string> = {
  idle: 'gray',
  authorized: 'blue',
  fueling: 'green',
  offline: 'gray',
  error: 'orange',
};

const statusLabels: Record<PumpStatus, string> = {
  idle: 'IDLE',
  authorized: 'AUTHORIZED',
  fueling: 'FUELING',
  offline: 'OFFLINE',
  error: 'ERROR',
};

function fuelAccent(fuelType: string): string {
  const t = fuelType.toLowerCase();
  if (t.includes('diesel')) return '#3b82f6';
  if (t.includes('petrol') || t.includes('gasoline') || t.includes('unleaded')) return '#f97316'; // fuel-vibe orange
  return '#22c55e';
}

function statusDotColor(status: PumpStatus): string {
  switch (status) {
    case 'fueling':
      return '#22c55e';
    case 'authorized':
      return '#3b82f6';
    case 'error':
      return '#f59e0b';
    case 'offline':
      return '#9ca3af';
    default:
      return '#94a3b8';
  }
}

export function PumpCard({ pump }: PumpCardProps) {
  const navigate = useNavigate();

  const isFueling = pump.status === 'fueling';
  const isOffline = pump.status === 'offline';

  const txFuel = pump.currentTransaction?.fuelType ?? (pump.nozzles?.[0]?.fuelType ?? '—');
  const accent = fuelAccent(txFuel);
  const dot = statusDotColor(pump.status);

  const amount = pump.currentTransaction ? formatMoney(pump.currentTransaction.amount) : '—';
  const volume = pump.currentTransaction ? formatVolume(pump.currentTransaction.volume) : '—';

  const activeFuel = pump.currentTransaction?.fuelType?.toLowerCase() ?? '';

  return (
    <Paper
      p="md"
      radius="lg"
      withBorder
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #fbfbfc 100%)',
        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden',
      }}
    >
      {/* compact animations + responsive stacking */}
      <style>
        {`
          @keyframes pumpBlink { 0%, 60% { opacity: 1; } 61%, 100% { opacity: 0.25; } }

          @media (max-width: 980px) {
            .pump-body-grid { grid-template-columns: 1fr !important; }
          }
        `}
      </style>

      <Stack gap={10}>
        {/* Header (compact) */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="sm" align="center" style={{ minWidth: 0 }}>
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: 'linear-gradient(180deg, #f8fafc, #eef2f7)',
                border: '1px solid rgba(0,0,0,0.08)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <IconGasStation size={18} />
            </Box>

            <Box style={{ minWidth: 0 }}>
              <Group gap={8} align="center" wrap="nowrap">
                <Text fw={800} size="lg" style={{ whiteSpace: 'nowrap' }}>
                  {pump.name}
                </Text>
                <Box
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: dot,
                    boxShadow: '0 0 0 4px rgba(15, 23, 42, 0.06)',
                    flexShrink: 0,
                  }}
                />
              </Group>

              <Badge
                size="sm"
                color={statusColors[pump.status]}
                variant={pump.status === 'idle' ? 'light' : 'filled'}
                styles={{ root: { fontWeight: 800, letterSpacing: 0.4 } }}
              >
                {statusLabels[pump.status]}
              </Badge>
            </Box>
          </Group>

          {/* Only show LIVE when fueling (no reserved empty space -> more room) */}
          {isFueling && (
            <Badge
              variant="light"
              color="green"
              leftSection={<IconBolt size={12} />}
              styles={{ root: { fontWeight: 800 } }}
            >
              LIVE
            </Badge>
          )}
        </Group>

        {/* Pump body (compact) */}
        <Box
          style={{
            borderRadius: 16,
            border: '1px solid rgba(0,0,0,0.08)',
            background: 'linear-gradient(180deg, #f7f8fb 0%, #ffffff 100%)',
            padding: 10, // smaller padding
          }}
        >
          <Box
            className="pump-body-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '108px minmax(0, 1fr)', // narrower nozzle rack
              gap: 10,
              alignItems: 'stretch',
            }}
          >
            {/* Nozzles (minimal: max 2) */}
            <Stack gap={10}>
              {(pump.nozzles ?? []).slice(0, 2).map((nozzle) => {
                const nFuel = nozzle.fuelType ?? 'Fuel';
                const nAccent = fuelAccent(nFuel);
                const isActive =
                  isFueling &&
                  activeFuel &&
                  (nFuel.toLowerCase().includes(activeFuel) || activeFuel.includes(nFuel.toLowerCase()));

                return (
                  <Box key={nozzle.id} style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                    <Box
                      style={{
                        width: 22,
                        height: 54,
                        borderRadius: 12,
                        background: isActive
                          ? `linear-gradient(180deg, ${nAccent}, rgba(0,0,0,0.18))`
                          : 'linear-gradient(180deg, #ffffff, #e5e7eb)',
                        border: '1px solid rgba(0,0,0,0.10)',
                        boxShadow: isActive ? `0 0 0 3px ${nAccent}22` : 'none',
                        position: 'relative',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        style={{
                          position: 'absolute',
                          right: -10,
                          top: 20,
                          width: 16,
                          height: 6,
                          borderRadius: 6,
                          background: 'rgba(15,23,42,0.18)',
                        }}
                      />
                    </Box>

                    <Box style={{ minWidth: 0, flex: 1 }}>
                      <Text size="xs" fw={800} truncate style={{ lineHeight: 1.1 }}>
                        {nFuel}
                      </Text>
                      {/* Keep totalizer, but smaller + no extra label */}
                      <Text size="xs" c="dimmed" style={{ lineHeight: 1.1 }}>
                        {(nozzle.totalizer ?? 0).toLocaleString()} L
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </Stack>

            {/* LCD (smaller + fixed, so it never overflows) */}
            <Box style={{ minWidth: 0 }}>
              <Box
                style={{
                  position: 'relative',
                  borderRadius: 14,
                  border: '1px solid rgba(0,0,0,0.14)',
                  background: isOffline
                    ? 'linear-gradient(180deg, #0f172a, #111827)'
                    : 'linear-gradient(180deg, #08131f, #0b1220)',
                  padding: 12,
                  overflow: 'hidden',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
                  height: 200, // slightly smaller than before
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* scanline */}
                <Box
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'repeating-linear-gradient(0deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 1px, rgba(255,255,255,0) 3px, rgba(255,255,255,0) 6px)',
                    pointerEvents: 'none',
                  }}
                />

                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Box style={{ minWidth: 0 }}>
                    <Text size="xs" c="rgba(255,255,255,0.65)" fw={800}>
                      {isFueling ? 'CURRENT SALE' : pump.status === 'authorized' ? 'AUTHORIZED' : 'READY'}
                    </Text>
                    <Text size="xs" c="rgba(255,255,255,0.55)" mt={2} truncate>
                      {txFuel}
                    </Text>
                  </Box>

                  <Box
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: isFueling ? accent : 'rgba(148,163,184,0.7)',
                      animation: isFueling ? 'pumpBlink 1.2s infinite' : undefined,
                      boxShadow: isFueling ? `0 0 0 6px ${accent}18` : 'none',
                      flexShrink: 0,
                    }}
                  />
                </Group>

                <Divider my="sm" color="rgba(255,255,255,0.10)" />

                <Group justify="space-between" align="flex-end" wrap="nowrap" style={{ marginTop: 'auto' }}>
                  <Box>
                    <Text size="xs" c="rgba(255,255,255,0.55)" fw={800}>
                      LITERS
                    </Text>
                    <Text
                      size="xl"
                      c="white"
                      fw={900}
                      ff="monospace"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {volume}
                    </Text>
                    <Text size="xs" c="rgba(255,255,255,0.55)" fw={800} mt={6}>
                      AMOUNT
                    </Text>
                    <Text
                      size="xl"
                      fw={900}
                      ff="monospace"
                      style={{ color: isFueling ? accent : 'white', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {amount}
                    </Text>
                  </Box>
                </Group>

                {isOffline && (
                  <Text size="xs" c="rgba(255,255,255,0.55)" mt="sm">
                    Communication lost
                  </Text>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer: only 1 action to save space */}
        <Group justify="flex-end">
          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconHistory size={14} />}
            onClick={() => navigate(paths.pumpTransactions(pump.id))}
          >
            View Transactions
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
