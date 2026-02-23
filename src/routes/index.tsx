import { createBrowserRouter, Navigate } from 'react-router-dom';
import { paths } from './paths';
import { RequireAuth } from './guards/RequireAuth';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import DashboardScreen from '@/features/dashboard/screens/DashboardScreen';
import AppShellLayout from '@/layouts/AppShellLayout';
import { MonitoringScreen } from '@/features/monitoring/screens/MonitoringScreen';
import { MonitoringOverview } from '@/features/monitoring/components/MonitoringOverview';
import { ShiftsScreen } from '@/features/shifts/screens/ShiftsScreen';
import { ShiftDetailsScreen } from '@/features/shifts/screens/ShiftDetailsScreen';
import { PumpsScreen } from '@/features/pumps/screens/PumpsScreen';
import { PumpTransactionsScreen } from '@/features/pumps/screens/PumpTransactionsScreen';
import { TanksScreen } from '@/features/tanks/screens/TanksScreen';
import { TankDetailsScreen } from '@/features/tanks/screens/TankDetailsScreen';
import { FuelSalesScreen } from '@/features/fuelSales/screens/FuelSalesScreen';
import { DebtorsScreen } from '@/features/debtors/screens/DebtorsScreen';
import { ReportsScreen } from '@/features/reports/screens/ReportsScreen';
import { SettingsScreen } from '@/features/settings/screens/SettingsScreen';

export const router = createBrowserRouter([
  {
    path: paths.root,
    element: <Navigate to={paths.dashboard} replace />,
  },
  {
    path: paths.login,
    element: <LoginScreen />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShellLayout />,
        children: [
          {
            path: paths.dashboard,
            element: <DashboardScreen />,
          },
          {
            path: 'monitoring',
            children: [
              {
                element: <MonitoringScreen />,
                children: [
                  { index: true, element: <MonitoringOverview /> },
                  { path: 'shifts', element: <ShiftsScreen /> },
                  { path: 'pumps', element: <PumpsScreen /> },
                  { path: 'tanks', element: <TanksScreen /> },
                ],
              },
              { path: 'shifts/:id', element: <ShiftDetailsScreen /> },
              { path: 'pumps/:id/transactions', element: <PumpTransactionsScreen /> },
              { path: 'tanks/:id', element: <TankDetailsScreen /> },
            ],
          },
          {
            path: paths.fuelSales,
            element: <FuelSalesScreen />,
          },
          {
            path: paths.debtors,
            element: <DebtorsScreen />,
          },
          {
            path: paths.reports,
            element: <ReportsScreen />,
          },
          {
            path: paths.settings,
            element: <SettingsScreen />,
          },
        ],
      },
    ],
  },
]);
