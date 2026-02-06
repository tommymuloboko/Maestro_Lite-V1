import { Stack, Table, Button, Group, Text, Badge, ActionIcon } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import type { Attendant, AttendantTag } from '@/types/attendants';
import { mockAttendants, mockAttendantTags } from '@/mocks';

export function AttendantsTagsPanel() {
  const attendants: Attendant[] = mockAttendants;
  const tags: AttendantTag[] = mockAttendantTags;

  return (
    <Stack gap="xl">
      <div>
        <Group justify="space-between" mb="md">
          <Text fw={600}>Attendants</Text>
          <Button size="sm" leftSection={<IconPlus size={14} />}>
            Add Attendant
          </Button>
        </Group>

        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Employee Code</Table.Th>
              <Table.Th>Tag</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {attendants.map((attendant) => (
              <Table.Tr key={attendant.id}>
                <Table.Td>{attendant.name}</Table.Td>
                <Table.Td>{attendant.employeeCode}</Table.Td>
                <Table.Td>{attendant.tag ?? '-'}</Table.Td>
                <Table.Td>
                  <Badge color={attendant.isActive ? 'green' : 'gray'}>
                    {attendant.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" size="sm">
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" size="sm" color="red">
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

      <div>
        <Group justify="space-between" mb="md">
          <Text fw={600}>Tags</Text>
          <Button size="sm" variant="light" leftSection={<IconPlus size={14} />}>
            Add Tag
          </Button>
        </Group>

        <Group gap="sm">
          {tags.map((tag) => (
            <Badge key={tag.id} color={tag.color} size="lg">
              {tag.name}
            </Badge>
          ))}
          {tags.length === 0 && (
            <Text size="sm" c="dimmed">No tags configured</Text>
          )}
        </Group>
      </div>
    </Stack>
  );
}
