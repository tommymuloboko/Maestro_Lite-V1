import { Drawer, Stack, Group, Text, Badge, Divider, Button } from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';
import type { FuelTransaction } from '@/types/fuel';
import { formatMoney, formatVolume } from '@/lib/utils/money';
import { formatDateTime } from '@/lib/utils/dates';
import { paymentTypeLabels } from '@/config/stationDefaults';

interface TxDetailsDrawerProps {
  transaction: FuelTransaction | null;
  opened: boolean;
  onClose: () => void;
}

export function TxDetailsDrawer({ transaction, opened, onClose }: TxDetailsDrawerProps) {
  if (!transaction) return null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Transaction Details"
      position="right"
      size="md"
    >
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">Transaction #</Text>
          <Text fw={500}>{transaction.transactionNumber}</Text>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">Time</Text>
          <Text>{formatDateTime(transaction.timestamp)}</Text>
        </Group>

        <Divider />

        <Group justify="space-between">
          <Text size="sm" c="dimmed">Pump</Text>
          <Text>{transaction.pumpId}</Text>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">Fuel Type</Text>
          <Text>{transaction.fuelType}</Text>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">Volume</Text>
          <Text>{formatVolume(transaction.volume)}</Text>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">Unit Price</Text>
          <Text>{formatMoney(transaction.unitPrice)}/L</Text>
        </Group>

        <Divider />

        <Group justify="space-between">
          <Text size="sm" c="dimmed">Amount</Text>
          <Text size="lg" fw={700}>{formatMoney(transaction.amount)}</Text>
        </Group>

        <Group justify="space-between">
          <Text size="sm" c="dimmed">Payment</Text>
          <Badge>{transaction.paymentType ? paymentTypeLabels[transaction.paymentType] : 'Unassigned'}</Badge>
        </Group>

        {transaction.isVoided && (
          <>
            <Divider />
            <Badge color="red" size="lg">VOIDED</Badge>
            {transaction.voidReason && (
              <Text size="sm" c="dimmed">Reason: {transaction.voidReason}</Text>
            )}
          </>
        )}

        <Divider />

        <Button variant="light" leftSection={<IconPrinter size={16} />}>
          Print Receipt
        </Button>
      </Stack>
    </Drawer>
  );
}
