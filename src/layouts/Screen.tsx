import { type ReactNode } from 'react';
import { Title, Group, Stack, ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface ScreenProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  /** Show a back button before the title. Defaults to true. */
  showBack?: boolean;
}

export function Screen({ title, actions, children, showBack = true }: ScreenProps) {
  const navigate = useNavigate();

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Group gap="sm" align="center">
          {showBack && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
          )}
          <Title order={2}>{title}</Title>
        </Group>
        {actions && <Group gap="sm">{actions}</Group>}
      </Group>
      {children}
    </Stack>
  );
}
