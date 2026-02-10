import { useEffect, useMemo, useState } from 'react';
import { Modal, Stack, Select, Button, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { attendantShiftsApi } from '../api/attendantShiftsApi';
import type { Attendant, AttendantTag } from '../types/attendantShifts';

interface StartShiftModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: { attendantId: string; tagId: string }) => void;
  isLoading?: boolean;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Failed to load attendants/tags';
}

export function StartShiftModal({ opened, onClose, onSubmit, isLoading }: StartShiftModalProps) {
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [tags, setTags] = useState<AttendantTag[]>([]);
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      attendantId: '',
      tagId: '',
    },
    validate: {
      attendantId: (value) => (value ? null : 'Attendant is required'),
      tagId: (value) => (value ? null : 'Tag is required'),
    },
  });

  useEffect(() => {
    if (!opened) return;
    let cancelled = false;

    async function loadMasters() {
      setLoadingMasters(true);
      setError(null);
      try {
        const [aRes, tRes] = await Promise.all([
          attendantShiftsApi.getAttendants({ limit: 100, offset: 0 }),
          attendantShiftsApi.getAttendantTags(),
        ]);
        if (cancelled) return;
        setAttendants(aRes.attendants ?? []);
        setTags(tRes.data ?? []);
      } catch (e: unknown) {
        if (cancelled) return;
        setError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoadingMasters(false);
      }
    }

    loadMasters();
    return () => {
      cancelled = true;
    };
  }, [opened]);

  const attendantOptions = attendants
    .filter((a) => a.is_active)
    .map((a) => ({
      value: a.id,
      label: a.attendant_name ? `${a.attendant_name} (${a.attendant_no})` : a.attendant_no,
    }));

  const tagOptions = useMemo(() => {
    const attendantId = form.values.attendantId;
    const filtered = tags.filter((t) => t.is_active && (!attendantId || t.attendant_id === attendantId));
    return filtered.map((t) => ({
      value: t.id,
      label: t.attendant_name
        ? `${t.tag_number} • ${t.attendant_name} (${t.attendant_no ?? ''})`.trim()
        : t.tag_number,
    }));
  }, [tags, form.values.attendantId]);

  // Keep tag in sync: if attendant changes, clear tag selection to avoid mismatch
  useEffect(() => {
    form.setFieldValue('tagId', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.attendantId]);

  return (
    <Modal opened={opened} onClose={onClose} title="Start Shift" centered radius="lg">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          {error ? (
            <Text size="sm" c="red" fw={600}>
              {error}
            </Text>
          ) : null}

          <Select
            label="Attendant"
            placeholder="Select attendant"
            data={attendantOptions}
            searchable
            disabled={loadingMasters}
            {...form.getInputProps('attendantId')}
          />

          <Select
            label="RFID Tag"
            placeholder={form.values.attendantId ? 'Select tag for attendant' : 'Select attendant first (optional)'}
            data={tagOptions}
            searchable
            disabled={loadingMasters || tagOptions.length === 0}
            {...form.getInputProps('tagId')}
          />

          <Button type="submit" fullWidth loading={isLoading} disabled={loadingMasters}>
            Start Shift
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
