import { Stack, Text, Table, Select, Button, Group } from '@mantine/core';
import { useState } from 'react';
import type { FuelTransaction } from '@/types/fuel';
import type { PaymentType } from '@/types/common';
import { paymentTypeLabels } from '@/config/stationDefaults';
import { formatMoney } from '@/lib/utils/money';

interface BulkPaymentAllocatorProps {
  transactions: FuelTransaction[];
  onAllocate: (allocations: { transactionId: string; paymentType: PaymentType }[]) => void;
}

export function BulkPaymentAllocator({ transactions, onAllocate }: BulkPaymentAllocatorProps) {
  const unallocated = transactions.filter((tx) => !tx.paymentType);
  const [allocations, setAllocations] = useState<Record<string, PaymentType | undefined>>({});

  if (unallocated.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        All transactions have payment types allocated
      </Text>
    );
  }

  return (
    <Stack gap="md">
      <Text size="sm">
        {unallocated.length} transaction(s) need payment type allocation
      </Text>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Transaction</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Payment Type</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {unallocated.slice(0, 10).map((tx) => (
            <Table.Tr key={tx.id}>
              <Table.Td>{tx.transactionNumber}</Table.Td>
              <Table.Td>{formatMoney(tx.amount)}</Table.Td>
              <Table.Td>
                <Select
                  placeholder="Select"
                  size="xs"
                  value={allocations[tx.id] ?? null}
                  onChange={(value) => {
                    setAllocations((prev) => ({
                      ...prev,
                      [tx.id]: value ? (value as PaymentType) : undefined,
                    }));
                  }}
                  data={Object.entries(paymentTypeLabels).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Group justify="flex-end">
        <Button
          size="sm"
          onClick={() => {
            const selected = Object.entries(allocations)
              .filter(([, paymentType]) => !!paymentType)
              .map(([transactionId, paymentType]) => ({
                transactionId,
                paymentType: paymentType as PaymentType,
              }));
            onAllocate(selected);
          }}
          disabled={Object.values(allocations).every((v) => !v)}
        >
          Apply Allocations
        </Button>
      </Group>
    </Stack>
  );
}
