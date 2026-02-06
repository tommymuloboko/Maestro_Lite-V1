import { Stack, Text, ThemeIcon, Button } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <Stack align="center" gap="md" py="xl">
      <ThemeIcon size={64} radius="xl" variant="light" color="red">
        <IconAlertCircle size={32} />
      </ThemeIcon>
      <Text size="lg" fw={500}>
        {title}
      </Text>
      <Text size="sm" c="dimmed" ta="center" maw={400}>
        {message}
      </Text>
      {onRetry && (
        <Button variant="light" color="red" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Stack>
  );
}
