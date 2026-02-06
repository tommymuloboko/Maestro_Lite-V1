import { Stack, Text, ThemeIcon, Button } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Stack align="center" gap="md" py="xl">
      <ThemeIcon size={64} radius="xl" variant="light" color="gray">
        {icon ?? <IconInbox size={32} />}
      </ThemeIcon>
      <Text size="lg" fw={500}>
        {title}
      </Text>
      {description && (
        <Text size="sm" c="dimmed" ta="center" maw={400}>
          {description}
        </Text>
      )}
      {action && (
        <Button variant="light" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Stack>
  );
}
