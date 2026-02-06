import { Modal, Stack, Select, MultiSelect, Button } from '@mantine/core';
import { useForm } from '@mantine/form';

interface StartShiftModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: { attendantId: string; pumpIds: string[] }) => void;
  isLoading?: boolean;
}

export function StartShiftModal({ opened, onClose, onSubmit, isLoading }: StartShiftModalProps) {
  const form = useForm({
    initialValues: {
      attendantId: '',
      pumpIds: [] as string[],
    },
    validate: {
      attendantId: (value) => (value ? null : 'Attendant is required'),
      pumpIds: (value) => (value.length > 0 ? null : 'Select at least one pump'),
    },
  });

  // TODO: Replace with real data from hooks
  const attendants = [
    { value: '1', label: 'John Mwamba' },
    { value: '2', label: 'Mary Banda' },
  ];

  const pumps = [
    { value: '1', label: 'Pump 1' },
    { value: '2', label: 'Pump 2' },
    { value: '3', label: 'Pump 3' },
    { value: '4', label: 'Pump 4' },
  ];

  return (
    <Modal opened={opened} onClose={onClose} title="Start New Shift">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Select
            label="Attendant"
            placeholder="Select attendant"
            data={attendants}
            searchable
            {...form.getInputProps('attendantId')}
          />

          <MultiSelect
            label="Pumps"
            placeholder="Select pumps"
            data={pumps}
            {...form.getInputProps('pumpIds')}
          />

          <Button type="submit" fullWidth loading={isLoading}>
            Start Shift
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
