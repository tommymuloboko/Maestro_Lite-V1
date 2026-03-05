import { Group, Paper, Text, ThemeIcon } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';

interface SalesMetricCardProps {
  label: string;
  value: string;
  icon: TablerIcon;
  color: 'teal' | 'blue' | 'orange' | 'red';
  helper?: string;
}

const toneStyles: Record<SalesMetricCardProps['color'], { background: string; border: string; iconBg: string; iconColor: string }> = {
  teal: {
    background: 'linear-gradient(135deg, #f0fdfa 0%, #e6fffb 100%)',
    border: '#b6efe4',
    iconBg: '#14b8a6',
    iconColor: '#ffffff',
  },
  blue: {
    background: 'linear-gradient(135deg, #eff6ff 0%, #eaf3ff 100%)',
    border: '#bfdcff',
    iconBg: '#3b82f6',
    iconColor: '#ffffff',
  },
  orange: {
    background: 'linear-gradient(135deg, #fff7ed 0%, #fff4e8 100%)',
    border: '#ffd5b0',
    iconBg: '#2ca01c',
    iconColor: '#ffffff',
  },
  red: {
    background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f1 100%)',
    border: '#fecaca',
    iconBg: '#ef4444',
    iconColor: '#ffffff',
  },
};

export function SalesMetricCard({ label, value, icon: Icon, color, helper }: SalesMetricCardProps) {
  const tone = toneStyles[color];

  return (
    <Paper
      p="md"
      radius="md"
      withBorder
      style={{
        background: tone.background,
        borderColor: tone.border,
        minHeight: 122,
        height: '100%',
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb={6}>
        <div>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: 0.45 }}>
            {label}
          </Text>
          <Text size="1.9rem" fw={800} lh={1.15}>
            {value}
          </Text>
          {helper ? (
            <Text size="xs" c="dimmed" mt={2}>
              {helper}
            </Text>
          ) : null}
        </div>
        <ThemeIcon
          size={44}
          radius="md"
          variant="filled"
          style={{ background: tone.iconBg, color: tone.iconColor }}
        >
          <Icon size={22} stroke={2} />
        </ThemeIcon>
      </Group>
    </Paper>
  );
}
