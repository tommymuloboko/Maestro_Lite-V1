import { Stack, Select, Button, Text, Alert, Paper, Group } from '@mantine/core';
import { IconPrinter, IconInfoCircle, IconRefresh } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { getAvailablePrinters } from '@/lib/utils/print';
import { getSetting, setSetting } from '@/lib/storage/settings';

export function PrintersPanel() {
  const [defaultPrinter, setDefaultPrinter] = useState<string | null>(
    () => getSetting<string | null>('printer_default', null)
  );
  const [receiptPrinter, setReceiptPrinter] = useState<string | null>(
    () => getSetting<string | null>('printer_receipt', null)
  );
  const [availablePrinters, setAvailablePrinters] = useState<{ value: string; label: string }[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const printers = await getAvailablePrinters();
      setAvailablePrinters(printers.map((name) => ({ value: name, label: name })));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void handleRefresh();
  }, [handleRefresh]);

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
          loading={isRefreshing}
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

      <Button
        onClick={() => {
          setSetting('printer_default', defaultPrinter);
          setSetting('printer_receipt', receiptPrinter);
          notifications.show({
            color: 'green',
            title: 'Printer settings saved',
            message: 'Default and receipt printer preferences were updated.',
          });
        }}
      >
        Save Printer Settings
      </Button>
    </Stack>
  );
}
