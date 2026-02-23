import { Tabs, Paper } from '@mantine/core';
import { Screen } from '@/layouts/Screen';
import { StationConfigPanel } from '../components/StationConfigPanel';
import { FuelPricePanel } from '../components/FuelPricePanel';
import { AttendantsTagsPanel } from '../components/AttendantsTagsPanel';
import { PaymentTypesPanel } from '../components/PaymentTypesPanel';
import { PrintersPanel } from '../components/PrintersPanel';

export function SettingsScreen() {
  return (
    <Screen title="Settings">
      <Paper p="md" radius="md" withBorder>
        <Tabs defaultValue="station">
          <Tabs.List>
            <Tabs.Tab value="station">Station Config</Tabs.Tab>
            <Tabs.Tab value="fuelprices">Fuel Prices</Tabs.Tab>
            <Tabs.Tab value="attendants">Attendants & Tags</Tabs.Tab>
            <Tabs.Tab value="payments">Payment Types</Tabs.Tab>
            <Tabs.Tab value="printers">Printers</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="station" pt="md">
            <StationConfigPanel />
          </Tabs.Panel>

          <Tabs.Panel value="fuelprices" pt="md">
            <FuelPricePanel />
          </Tabs.Panel>

          <Tabs.Panel value="attendants" pt="md">
            <AttendantsTagsPanel />
          </Tabs.Panel>

          <Tabs.Panel value="payments" pt="md">
            <PaymentTypesPanel />
          </Tabs.Panel>

          <Tabs.Panel value="printers" pt="md">
            <PrintersPanel />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Screen>
  );
}

