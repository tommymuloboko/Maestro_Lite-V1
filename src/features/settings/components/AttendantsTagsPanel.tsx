import { useState, useEffect } from 'react';
import { Stack, Table, Button, Group, Text, Badge, ActionIcon, Loader, Center } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import type { Attendant } from '@/types/attendants';
import { getApiService } from '@/lib/api/apiAdapter';

export function AttendantsTagsPanel() {
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const api = await getApiService();
        const data = await api.getAttendants();
        setAttendants(data);
      } catch (error) {
        console.error('Failed to load attendants:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <Center h={200}>
        <Loader size="lg" />
      </Center>
    );
  }

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
              <Table.Th>Status</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {attendants.map((attendant) => (
              <Table.Tr key={attendant.id}>
                <Table.Td>{attendant.name}</Table.Td>
                <Table.Td>{attendant.employeeCode}</Table.Td>
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
    </Stack>
  );
}
