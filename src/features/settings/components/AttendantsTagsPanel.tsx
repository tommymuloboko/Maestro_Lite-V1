import { useState, useEffect, useCallback } from 'react';
import {
  Stack, Table, Button, Group, Text, Badge, ActionIcon,
  Loader, Center, Modal, TextInput, Select,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconTag, IconTagOff } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { attendantShiftsApi } from '@/features/shifts/api/attendantShiftsApi';
import { getStoredUser, getStoredStationId } from '@/lib/storage/secureStore';
import {
  createAttendant,
  updateAttendant,
  deleteAttendant,
} from '@/features/settings/api/settings.api';
import type { Attendant, AttendantTag } from '@/features/shifts/type/attendantShift';

function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Unknown error';
}

export function AttendantsTagsPanel() {
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [tags, setTags] = useState<AttendantTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Modal state ─────────────────────────────────────────────
  const [addAttendantOpen, setAddAttendantOpen] = useState(false);
  const [editingAttendant, setEditingAttendant] = useState<Attendant | null>(null);
  const [assignTagOpen, setAssignTagOpen] = useState(false);

  // Form fields: Add / Edit attendant
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');

  // Form fields: Assign tag
  const [tagNumber, setTagNumber] = useState('');
  const [tagAttendantId, setTagAttendantId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // ── Load data ───────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [attendantsRes, tagsRes] = await Promise.all([
        attendantShiftsApi.getAttendants({ limit: 100, offset: 0 }),
        attendantShiftsApi.getAttendantTags(),
      ]);
      setAttendants(attendantsRes.attendants ?? []);
      setTags(tagsRes.data ?? []);
    } catch (error) {
      console.error('Failed to load attendants:', error);
      notifications.show({
        color: 'red',
        title: 'Failed to load data',
        message: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ── Handlers ────────────────────────────────────────────────

  const handleAddAttendant = async () => {
    if (!formName.trim()) return;
    setSubmitting(true);
    try {
      await createAttendant({ name: formName.trim(), phone: formPhone.trim() || undefined } as any);
      notifications.show({ color: 'green', title: 'Success', message: 'Attendant created.' });
      setAddAttendantOpen(false);
      setFormName('');
      setFormPhone('');
      await loadData();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Failed', message: getErrorMessage(e) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAttendant = async () => {
    if (!editingAttendant || !formName.trim()) return;
    setSubmitting(true);
    try {
      await updateAttendant(editingAttendant.id, { name: formName.trim(), phone: formPhone.trim() } as any);
      notifications.show({ color: 'green', title: 'Updated', message: 'Attendant updated.' });
      setEditingAttendant(null);
      setFormName('');
      setFormPhone('');
      await loadData();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Failed', message: getErrorMessage(e) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAttendant = async (att: Attendant) => {
    if (!confirm(`Delete attendant ${att.attendant_name ?? att.attendant_no}?`)) return;
    try {
      await deleteAttendant(att.id);
      notifications.show({ color: 'green', title: 'Deleted', message: 'Attendant removed.' });
      await loadData();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Failed', message: getErrorMessage(e) });
    }
  };

  const handleAssignTag = async () => {
    if (!tagNumber.trim() || !tagAttendantId) return;
    setSubmitting(true);
    try {
      const user = getStoredUser();
      const stationId = user?.stationId || getStoredStationId() || '';
      if (!stationId) throw new Error('No station configured');

      await attendantShiftsApi.createTag({
        attendant_id: tagAttendantId,
        station_id: stationId,
        tag_number: tagNumber.trim(),
      });
      notifications.show({ color: 'green', title: 'Success', message: 'Tag assigned.' });
      setAssignTagOpen(false);
      setTagNumber('');
      setTagAttendantId(null);
      await loadData();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Failed', message: getErrorMessage(e) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeTag = async (tag: AttendantTag) => {
    if (!confirm(`Revoke tag ${tag.tag_number}?`)) return;
    try {
      await attendantShiftsApi.revokeTag(tag.id);
      notifications.show({ color: 'green', title: 'Revoked', message: `Tag ${tag.tag_number} revoked.` });
      await loadData();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Failed', message: getErrorMessage(e) });
    }
  };

  const handleActivateTag = async (tag: AttendantTag) => {
    try {
      await attendantShiftsApi.activateTag(tag.id);
      notifications.show({ color: 'green', title: 'Activated', message: `Tag ${tag.tag_number} activated.` });
      await loadData();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Failed', message: getErrorMessage(e) });
    }
  };

  // ── Render ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Center h={200}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      {/* ── Attendants ── */}
      <div>
        <Group justify="space-between" mb="md">
          <Text fw={600}>Attendants</Text>
          <Button
            size="sm"
            leftSection={<IconPlus size={14} />}
            onClick={() => {
              setFormName('');
              setFormPhone('');
              setAddAttendantOpen(true);
            }}
          >
            Add Attendant
          </Button>
        </Group>

        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>No.</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Phone</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {attendants.map((att) => (
              <Table.Tr key={att.id}>
                <Table.Td>{att.attendant_no}</Table.Td>
                <Table.Td>{att.attendant_name ?? att.attendant_no}</Table.Td>
                <Table.Td>{att.phone ?? '—'}</Table.Td>
                <Table.Td>
                  <Badge color={att.is_active ? 'green' : 'gray'}>
                    {att.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        setEditingAttendant(att);
                        setFormName(att.attendant_name ?? att.attendant_no ?? '');
                        setFormPhone(att.phone ?? '');
                      }}
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="red"
                      onClick={() => handleDeleteAttendant(att)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {attendants.length === 0 && (
          <Text size="sm" c="dimmed" ta="center" py="md">
            No attendants configured
          </Text>
        )}
      </div>

      {/* ── RFID Tags ── */}
      <div>
        <Group justify="space-between" mb="md">
          <Text fw={600}>RFID Tags</Text>
          <Button
            size="sm"
            leftSection={<IconPlus size={14} />}
            onClick={() => {
              setTagNumber('');
              setTagAttendantId(null);
              setAssignTagOpen(true);
            }}
          >
            Assign Tag
          </Button>
        </Group>

        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Tag Number</Table.Th>
              <Table.Th>Attendant</Table.Th>
              <Table.Th>Issued</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tags.map((tag) => (
              <Table.Tr key={tag.id}>
                <Table.Td ff="monospace">{tag.tag_number}</Table.Td>
                <Table.Td>{tag.attendant_name ?? tag.attendant_no ?? '—'}</Table.Td>
                <Table.Td>
                  {new Date(tag.issued_at).toLocaleDateString()}
                </Table.Td>
                <Table.Td>
                  <Badge color={tag.is_active ? 'green' : 'red'}>
                    {tag.is_active ? 'Active' : 'Revoked'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {tag.is_active ? (
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="red"
                      title="Revoke tag"
                      onClick={() => handleRevokeTag(tag)}
                    >
                      <IconTagOff size={14} />
                    </ActionIcon>
                  ) : (
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      color="green"
                      title="Activate tag"
                      onClick={() => handleActivateTag(tag)}
                    >
                      <IconTag size={14} />
                    </ActionIcon>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {tags.length === 0 && (
          <Text size="sm" c="dimmed" ta="center" py="md">
            No RFID tags assigned
          </Text>
        )}
      </div>

      {/* ── Add Attendant Modal ── */}
      <Modal
        opened={addAttendantOpen}
        onClose={() => setAddAttendantOpen(false)}
        title="Add Attendant"
        centered
      >
        <Stack gap="sm">
          <TextInput
            label="Name"
            placeholder="Full name"
            value={formName}
            onChange={(e) => setFormName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Phone"
            placeholder="0977..."
            value={formPhone}
            onChange={(e) => setFormPhone(e.currentTarget.value)}
          />
          <Button
            fullWidth
            loading={submitting}
            onClick={handleAddAttendant}
            disabled={!formName.trim()}
          >
            Create Attendant
          </Button>
        </Stack>
      </Modal>

      {/* ── Edit Attendant Modal ── */}
      <Modal
        opened={!!editingAttendant}
        onClose={() => setEditingAttendant(null)}
        title="Edit Attendant"
        centered
      >
        <Stack gap="sm">
          <TextInput
            label="Name"
            placeholder="Full name"
            value={formName}
            onChange={(e) => setFormName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Phone"
            placeholder="0977..."
            value={formPhone}
            onChange={(e) => setFormPhone(e.currentTarget.value)}
          />
          <Button
            fullWidth
            loading={submitting}
            onClick={handleEditAttendant}
            disabled={!formName.trim()}
          >
            Save Changes
          </Button>
        </Stack>
      </Modal>

      {/* ── Assign Tag Modal ── */}
      <Modal
        opened={assignTagOpen}
        onClose={() => setAssignTagOpen(false)}
        title="Assign RFID Tag"
        centered
      >
        <Stack gap="sm">
          <Select
            label="Attendant"
            placeholder="Select attendant"
            data={attendants.map((a) => ({
              value: a.id,
              label: `${a.attendant_no} – ${a.attendant_name ?? a.attendant_no}`,
            }))}
            value={tagAttendantId}
            onChange={setTagAttendantId}
            required
          />
          <TextInput
            label="Tag Number"
            placeholder="e.g. 4B00B690"
            value={tagNumber}
            onChange={(e) => setTagNumber(e.currentTarget.value)}
            required
          />
          <Button
            fullWidth
            loading={submitting}
            onClick={handleAssignTag}
            disabled={!tagNumber.trim() || !tagAttendantId}
          >
            Assign Tag
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
