import { Stack, TextInput, Button, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconInfoCircle } from '@tabler/icons-react';
import { useStationConfig } from '@/hooks/useStationConfig';
import type { StationConfigFormData } from '@/lib/validators/settings.schema';

export function StationConfigPanel() {
  const { stationId, stationName, pts2Url, apiBaseUrl, updateConfig } = useStationConfig();

  const form = useForm<StationConfigFormData>({
    initialValues: {
      stationId: stationId ?? '',
      stationName: stationName ?? '',
      pts2Url: pts2Url ?? '',
      apiBaseUrl: apiBaseUrl ?? '',
    },
    validate: {
      stationId: (value) => (value ? null : 'Station ID is required'),
      stationName: (value) => (value ? null : 'Station name is required'),
      pts2Url: (value) => {
        if (!value) return 'PT S2 URL is required';
        try {
          new URL(value);
          return null;
        } catch {
          return 'Must be a valid URL';
        }
      },
      apiBaseUrl: (value) => {
        if (!value) return 'API Base URL is required';
        try {
          new URL(value);
          return null;
        } catch {
          return 'Must be a valid URL';
        }
      },
    },
  });

  const handleSubmit = (values: StationConfigFormData) => {
    updateConfig(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md" maw={500}>
        <Alert icon={<IconInfoCircle size={16} />} color="blue">
          Configure your station connection settings. These are required for the app to function.
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

        <TextInput
          label="PT S2 URL"
          description="URL of your Petrosoft PT S2 server"
          placeholder="http://localhost:8080"
          {...form.getInputProps('pts2Url')}
        />

        <TextInput
          label="API Base URL"
          description="URL of your Maestro API server"
          placeholder="http://localhost:3000/api"
          {...form.getInputProps('apiBaseUrl')}
        />

        <Button type="submit">Save Configuration</Button>
      </Stack>
    </form>
  );
}
