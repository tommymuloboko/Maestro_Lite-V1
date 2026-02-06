import { Modal, Button, Group, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface ConfirmDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'red',
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Group gap="sm" mb="md">
        <IconAlertTriangle size={24} color="var(--mantine-color-orange-6)" />
        <Text>{message}</Text>
      </Group>

      <Group justify="flex-end" gap="sm">
        <Button variant="default" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button color={confirmColor} onClick={onConfirm} loading={isLoading}>
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
}
