import { type ReactNode } from 'react';
import { Title, Group, Stack } from '@mantine/core';

interface ScreenProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Screen({ title, actions, children }: ScreenProps) {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={2}>{title}</Title>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>
      {children}
    </Stack>
  );
}
