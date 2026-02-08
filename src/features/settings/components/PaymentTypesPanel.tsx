import { Stack, Table, Button, Group, Text, Badge, Switch, ActionIcon } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import type { PaymentType } from '@/types/common';
import { usePaymentTypes } from '../api/settings.hooks';
import { paymentTypeLabels } from '@/config/stationDefaults';

interface ConfiguredPaymentType {
  id: string;
  code: PaymentType;
  name: string;
  isActive: boolean;
}

export function PaymentTypesPanel() {
  const { data: paymentTypesData = [], isLoading } = usePaymentTypes();
  const paymentTypes: ConfiguredPaymentType[] = paymentTypesData.map((code) => ({
    id: code,
    code,
    name: paymentTypeLabels[code],
    isActive: true,
  }));

  if (isLoading) {
    return (
      <Text size="sm" c="dimmed">
        Loading payment types...
      </Text>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600}>Payment Types</Text>
        <Button size="sm" leftSection={<IconPlus size={14} />}>
          Add Payment Type
        </Button>
      </Group>

      <Table striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Code</Table.Th>
            <Table.Th>Active</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {paymentTypes.map((pt) => (
            <Table.Tr key={pt.id}>
              <Table.Td>{pt.name}</Table.Td>
              <Table.Td>
                <Badge variant="outline">{pt.code}</Badge>
              </Table.Td>
              <Table.Td>
                <Switch checked={pt.isActive} readOnly />
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
    </Stack>
  );
}
