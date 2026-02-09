import { Stack, TextInput, Button, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle } from '@tabler/icons-react';
import { useStationConfig } from '@/hooks/useStationConfig';

interface StationConfigFormData {
  stationId: string;
  stationName: string;
}

export function StationConfigPanel() {
  const { stationId, stationName, updateConfig } = useStationConfig();

  const form = useForm<StationConfigFormData>({
    initialValues: {
      stationId: stationId ?? '',
      stationName: stationName ?? '',
    },
    validate: {
      stationId: (value) => (value ? null : 'Station ID is required'),
      stationName: (value) => (value ? null : 'Station name is required'),
    },
  });

  const handleSubmit = (values: StationConfigFormData) => {
    updateConfig(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md" maw={500}>
        <Alert icon={<IconInfoCircle size={16} />} color="blue">
          Configure your station settings. The API connection is configured via environment variables.
        </Alert>

        <TextInput
          label="Station ID"
          description="Unique identifier for your station"
          placeholder="e.g., station-001"
          {...form.getInputProps('stationId')}
        />

        <TextInput
          label="Station Name"
          description="Display name for your station"
          placeholder="e.g., Main Street Station"
          {...form.getInputProps('stationName')}
        />

        <Button type="submit">Save Configuration</Button>
      </Stack>
    </form>
  );
}
