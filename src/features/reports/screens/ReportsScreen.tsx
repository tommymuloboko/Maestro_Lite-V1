import { useState } from 'react';
import { Paper, Group, Button } from '@mantine/core';
import { IconDownload, IconPrinter } from '@tabler/icons-react';
import { Screen } from '@/layouts/Screen';
import { ReportPicker } from '../components/ReportPicker';
import { ShiftSummaryReport } from '../components/ShiftSummaryReport';
import { DailySalesByPaymentReport } from '../components/DailySalesByPaymentReport';
import { AttendantPerformanceReport } from '../components/AttendantPerformanceReport';
import { PumpTotalsReport } from '../components/PumpTotalsReport';
import type { ReportType } from '@/types/reports';

export function ReportsScreen() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('shift-summary');

  const renderReport = () => {
    switch (selectedReport) {
      case 'shift-summary':
        return <ShiftSummaryReport />;
      case 'daily-sales-by-payment':
        return <DailySalesByPaymentReport />;
      case 'attendant-performance':
        return <AttendantPerformanceReport />;
      case 'pump-totals':
        return <PumpTotalsReport />;
      default:
        return null;
    }
  };

  return (
    <Screen
      title="Reports"
      actions={
        <Group gap="sm">
          <Button variant="light" leftSection={<IconDownload size={16} />}>
            Export
          </Button>
          <Button variant="light" leftSection={<IconPrinter size={16} />}>
            Print
          </Button>
        </Group>
      }
    >
      <ReportPicker value={selectedReport} onChange={setSelectedReport} />

      <Paper p="md" radius="md" withBorder mt="md">
        {renderReport()}
      </Paper>
    </Screen>
  );
}
