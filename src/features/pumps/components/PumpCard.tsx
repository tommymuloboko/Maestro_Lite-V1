import { Paper, Stack, Group, Text, Badge, Box, UnstyledButton } from '@mantine/core';
import { IconDroplet, IconHistory, IconBolt } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { Pump, PumpStatus } from '@/types/pumps';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { paths } from '@/routes/paths';

interface PumpCardProps {
  pump: Pump;
}

// ─── Status config ──────────────────────────────────────────

const statusConfig: Record<PumpStatus, { color: string; bg: string; label: string }> = {
  idle: { color: '#64748b', bg: 'rgba(100,116,139,0.10)', label: 'IDLE' },
  authorized: { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', label: 'AUTH' },
  fueling: { color: '#22c55e', bg: 'rgba(34,197,94,0.10)', label: 'FUELING' },
  offline: { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', label: 'OFFLINE' },
  error: { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', label: 'ERROR' },
};

function fuelColor(fuelType: string): string {
  const t = fuelType.toLowerCase();
  if (t.includes('diesel')) return '#3b82f6';
  if (t.includes('petrol') || t.includes('gasoline') || t.includes('unleaded')) return '#f97316';
  return '#22c55e';
}

// ─── Component ──────────────────────────────────────────────

export function PumpCard({ pump }: PumpCardProps) {
  const navigate = useNavigate();
  const cfg = statusConfig[pump.status];
  const isFueling = pump.status === 'fueling';
  const isOffline = pump.status === 'offline';
  const nozzles = pump.nozzles ?? [];

  const txFuel = pump.currentTransaction?.fuelType ?? nozzles[0]?.fuelType ?? '—';
  const accent = fuelColor(txFuel);
  const hasTransaction = pump.currentTransaction != null;

  return (
    <Paper
      radius="md"
      withBorder
      style={{
        overflow: 'hidden',
        opacity: isOffline ? 0.6 : 1,
        transition: 'opacity 0.2s, box-shadow 0.2s',
        boxShadow: isFueling
          ? `0 0 0 2px ${cfg.color}40, 0 4px 16px rgba(0,0,0,0.08)`
          : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* ── Accent top stripe ── */}
      <Box style={{ height: 3, background: cfg.color }} />

      <Stack gap={0} p="sm">
        {/* ── Header: Pump name + status ── */}
        <Group justify="space-between" align="center" wrap="nowrap" mb={8}>
          <Group gap={8} align="center" wrap="nowrap" style={{ minWidth: 0 }}>
            <Text fw={700} size="md" truncate>
              {pump.name}
            </Text>
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: cfg.color,
                flexShrink: 0,
                animation: isFueling ? 'pumpPulse 1.5s ease-in-out infinite' : undefined,
              }}
            />
          </Group>

          <Badge
            size="xs"
            variant="light"
            color={cfg.color}
            styles={{
              root: {
                background: cfg.bg,
                color: cfg.color,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: 0.5,
                flexShrink: 0,
              },
            }}
          >
            {isFueling && <IconBolt size={10} style={{ marginRight: 2 }} />}
            {cfg.label}
          </Badge>
        </Group>

        {/* ── Fuel type chips ── */}
        {nozzles.length > 0 ? (
          <Group gap={6} mb={10} wrap="wrap">
            {nozzles.slice(0, 3).map((n) => {
              const c = fuelColor(n.fuelType);
              const isActive = hasTransaction && pump.currentTransaction?.fuelType === n.fuelType;
              return (
                <Badge
                  key={n.id}
                  size="sm"
                  variant="dot"
                  styles={{
                    root: {
                      color: isActive ? c : '#64748b',
                      borderColor: isActive ? c : 'rgba(0,0,0,0.08)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 11,
                    },
                  }}
                >
                  <IconDroplet size={10} style={{ marginRight: 3, color: c }} />
                  {n.fuelType}
                </Badge>
              );
            })}
          </Group>
        ) : (
          <Text size="xs" c="dimmed" mb={10}>No nozzles configured</Text>
        )}

        {/* ── Metrics row ── */}
        <Box
          style={{
            borderRadius: 8,
            background: 'var(--mantine-color-dark-8, #1e293b)',
            padding: '10px 12px',
          }}
        >
          {hasTransaction ? (
            <Group justify="space-between" align="flex-end" wrap="nowrap" gap="xs">
              <Box style={{ minWidth: 0 }}>
                <Text size="10px" tt="uppercase" fw={600} c="rgba(255,255,255,0.5)" style={{ letterSpacing: 0.5 }}>
                  Liters
                </Text>
                <Text
                  fw={800}
                  ff="monospace"
                  c="white"
                  style={{ fontSize: 18, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatVolume(pump.currentTransaction!.volume)}
                </Text>
              </Box>

              <Box style={{ minWidth: 0, textAlign: 'right' }}>
                <Text size="10px" tt="uppercase" fw={600} c="rgba(255,255,255,0.5)" style={{ letterSpacing: 0.5 }}>
                  Amount
                </Text>
                <Text
                  fw={800}
                  ff="monospace"
                  style={{
                    fontSize: 18,
                    lineHeight: 1.2,
                    fontVariantNumeric: 'tabular-nums',
                    color: isFueling ? accent : 'white',
                  }}
                >
                  {formatMoney(pump.currentTransaction!.amount)}
                </Text>
              </Box>
            </Group>
          ) : (
            <Text size="xs" c="rgba(255,255,255,0.4)" ta="center">
              {isOffline ? 'Offline' : 'No recent transaction'}
            </Text>
          )}
        </Box>

        {/* ── Footer ── */}
        <UnstyledButton
          onClick={() => navigate(paths.pumpTransactions(pump.id))}
          mt={8}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '6px 0',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--mantine-color-brand-6, #3b82f6)',
            transition: 'background 0.15s',
          }}
          styles={{
            root: {
              '&:hover': { background: 'rgba(59,130,246,0.06)' },
            },
          }}
        >
          <IconHistory size={14} />
          Transactions
        </UnstyledButton>
      </Stack>

      {/* Keyframes */}
      <style>{`
        @keyframes pumpPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { opacity: 0.6; box-shadow: 0 0 0 4px rgba(34,197,94,0); }
        }
      `}</style>
    </Paper>
  );
}
