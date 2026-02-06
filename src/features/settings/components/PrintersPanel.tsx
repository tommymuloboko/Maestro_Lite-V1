import { Stack, Select, Button, Text, Alert, Paper, Group } from '@mantine/core';
import { IconPrinter, IconInfoCircle, IconRefresh } from '@tabler/icons-react';
import { useState } from 'react';

export function PrintersPanel() {
  const [defaultPrinter, setDefaultPrinter] = useState<string | null>(null);
  const [receiptPrinter, setReceiptPrinter] = useState<string | null>(null);

  // TODO: Replace with useAvailablePrinters hook
  const availablePrinters = [
    { value: 'printer1', label: 'HP LaserJet Pro' },
    { value: 'printer2', label: 'Epson TM-T88VI (Receipt)' },
  ];

  const handleRefresh = () => {
    // TODO: Refresh printer list
  };

  return (
    <Stack gap="md" maw={500}>
      <Alert icon={<IconInfoCircle size={16} />} color="blue">
        Configure printers for reports and receipts. Printer selection requires desktop app integration.
      </Alert>

      <Group justify="space-between">
        <Text fw={600}>Available Printers</Text>
        <Button
          size="xs"
          variant="subtle"
          leftSection={<IconRefresh size={14} />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Group>

      <Select
        label="Default Printer"
        description="Used for reports and general printing"
        placeholder="Select printer"
        data={availablePrinters}
        value={defaultPrinter}
        onChange={setDefaultPrinter}
        leftSection={<IconPrinter size={16} />}
      />

      <Select
        label="Receipt Printer"
        description="Used for transaction receipts"
        placeholder="Select printer"
        data={availablePrinters}
        value={receiptPrinter}
        onChange={setReceiptPrinter}
        leftSection={<IconPrinter size={16} />}
      />

      <Paper p="sm" bg="gray.0" radius="md">
        <Text size="sm" fw={500} mb="xs">Test Print</Text>
        <Group gap="sm">
          <Button size="xs" variant="light" disabled={!defaultPrinter}>
            Test Default
          </Button>
          <Button size="xs" variant="light" disabled={!receiptPrinter}>
            Test Receipt
          </Button>
        </Group>
      </Paper>

      <Button>Save Printer Settings</Button>
    </Stack>
  );
}
