import { Modal, Stack, Button, Textarea, Text } from '@mantine/core';
import { useForm } from '@mantine/form';

interface EndShiftModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: EndShiftValues) => void;
  isLoading?: boolean;
}

export interface EndShiftValues {
  notes?: string;
}

export function EndShiftModal({ opened, onClose, onSubmit, isLoading }: EndShiftModalProps) {
  const form = useForm<EndShiftValues>({
    initialValues: {
      notes: '',
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="End Shift" centered radius="lg">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Ending a shift will lock pump operations for the attendant and mark the shift as pending verification.
          </Text>

          <Textarea
            label="Notes (optional)"
            placeholder="Any notes about this shift..."
            {...form.getInputProps('notes')}
          />

          <Button type="submit" fullWidth loading={isLoading}>
            End Shift
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
