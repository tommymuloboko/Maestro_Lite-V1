import { Modal, Stack, Select, MultiSelect, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAttendants } from '@/features/settings/api/settings.hooks';
import { usePumps } from '@/features/pumps/api/pumps.hooks';

interface StartShiftModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: { attendantId: string; pumpIds: string[] }) => void;
  isLoading?: boolean;
}

export function StartShiftModal({ opened, onClose, onSubmit, isLoading }: StartShiftModalProps) {
  const { data: attendantsData = [], isLoading: isLoadingAttendants } = useAttendants();
  const { data: pumpsData = [], isLoading: isLoadingPumps } = usePumps();

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

  const attendants = attendantsData.map((attendant) => ({
    value: attendant.id,
    label: `${attendant.name} (${attendant.employeeCode})`,
  }));

  const pumps = pumpsData.map((pump) => ({
    value: pump.id,
    label: pump.name,
  }));

  return (
    <Modal opened={opened} onClose={onClose} title="Start New Shift">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Select
            label="Attendant"
            placeholder="Select attendant"
            data={attendants}
            searchable
            disabled={isLoadingAttendants}
            {...form.getInputProps('attendantId')}
          />

          <MultiSelect
            label="Pumps"
            placeholder="Select pumps"
            data={pumps}
            disabled={isLoadingPumps}
            {...form.getInputProps('pumpIds')}
          />

          <Button type="submit" fullWidth loading={isLoading} disabled={isLoadingAttendants || isLoadingPumps}>
            Start Shift
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
