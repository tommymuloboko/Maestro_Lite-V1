import { Modal, Stack, Button, Textarea, NumberInput, Text, Table } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { PaymentType } from '@/types/common';

interface EndShiftModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: EndShiftValues) => void;
  isLoading?: boolean;
  pumpIds: string[];
}

interface EndShiftValues {
  payments: { paymentType: PaymentType; declaredAmount: number; countedAmount: number }[];
  notes: string;
}

export function EndShiftModal({ opened, onClose, onSubmit, isLoading }: EndShiftModalProps) {
  const form = useForm<EndShiftValues>({
    initialValues: {
      payments: [
        { paymentType: 'cash', declaredAmount: 0, countedAmount: 0 },
        { paymentType: 'card', declaredAmount: 0, countedAmount: 0 },
        { paymentType: 'mobile', declaredAmount: 0, countedAmount: 0 },
      ],
      notes: '',
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="End Shift" size="lg">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Text fw={500}>Payment Reconciliation</Text>
          
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Payment Type</Table.Th>
                <Table.Th>Declared</Table.Th>
                <Table.Th>Counted</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {form.values.payments.map((payment, index) => (
                <Table.Tr key={payment.paymentType}>
                  <Table.Td style={{ textTransform: 'capitalize' }}>
                    {payment.paymentType}
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      min={0}
                      {...form.getInputProps(`payments.${index}.declaredAmount`)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      min={0}
                      {...form.getInputProps(`payments.${index}.countedAmount`)}
                    />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Textarea
            label="Notes"
            placeholder="Any notes about this shift..."
            {...form.getInputProps('notes')}
          />

          <Button type="submit" fullWidth loading={isLoading}>
            End Shift
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
