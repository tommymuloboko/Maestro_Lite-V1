import { Tabs } from '@mantine/core';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { IconEye, IconClock, IconGasStation, IconBarrel } from '@tabler/icons-react';
import { Screen } from '@/layouts/Screen';
import { paths } from '@/routes/paths';

const tabs = [
  { value: paths.monitoring, label: 'Overview', icon: IconEye },
  { value: paths.monitoringShifts, label: 'Shifts', icon: IconClock },
  { value: paths.monitoringPumps, label: 'Pumps', icon: IconGasStation },
  { value: paths.monitoringTanks, label: 'Tanks', icon: IconBarrel },
];

export function MonitoringScreen() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL
  const activeTab = tabs.find(
    (t) => t.value === pathname || (t.value !== paths.monitoring && pathname.startsWith(t.value))
  )?.value ?? paths.monitoring;

  return (
    <Screen title="Monitoring">
      <Tabs
        value={activeTab}
        onChange={(value) => {
          if (value) navigate(value);
        }}
      >
        <Tabs.List mb="md">
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={16} />}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      <Outlet />
    </Screen>
  );
}
