import { paths } from '@/routes/paths';
import {
  IconDashboard,
  IconActivity,
  IconGasStation,
  IconReportAnalytics,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';

export const appName = 'Maestro-Lite';

export const navItems = [
  { label: 'Dashboard', icon: IconDashboard, path: paths.dashboard },
  { label: 'Monitoring', icon: IconActivity, path: paths.monitoring },
  { label: 'Fuel Sales', icon: IconGasStation, path: paths.fuelSales },
  { label: 'Debtors', icon: IconUsers, path: paths.debtors },
  { label: 'Reports', icon: IconReportAnalytics, path: paths.reports },
  { label: 'Settings', icon: IconSettings, path: paths.settings },
] as const;

export const limits = {
  maxTransactionsPerPage: 50,
  maxShiftsPerPage: 20,
  maxReportsPerPage: 100,
} as const;

export const pollingIntervals = {
  pumps: 5000, // 5 seconds
  tanks: 30000, // 30 seconds
  connectivity: 10000, // 10 seconds
} as const;
