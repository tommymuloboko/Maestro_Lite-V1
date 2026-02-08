export type SalesMetricKey = 'todayRevenue' | 'salesToday' | 'averageSale' | 'unsynced';
export type SalesMetricTone = 'teal' | 'blue' | 'orange' | 'purple';
export type SalesMetricIcon = 'wallet' | 'receipt' | 'average' | 'unsynced';

export interface SalesDashboardMetric {
  key: SalesMetricKey;
  label: string;
  value: string;
  tone: SalesMetricTone;
  icon: SalesMetricIcon;
}

export type SalesQuickActionKey = 'viewAllSales' | 'salesReports';
export type SalesQuickActionIcon = 'sales' | 'report';
export type SalesQuickActionTarget = 'fuelSales' | 'reports';

export interface SalesDashboardQuickAction {
  key: SalesQuickActionKey;
  label: string;
  icon: SalesQuickActionIcon;
  target: SalesQuickActionTarget;
}

export type RecentSalePayment = 'cash' | 'card' | 'mobile';
export type RecentSaleStatus = 'completed' | 'pending' | 'failed';

export interface RecentSaleRow {
  id: string;
  time: string;
  reference: string;
  amount: number;
  payment: RecentSalePayment;
  status: RecentSaleStatus;
}

export interface SalesDashboardViewModel {
  metrics: SalesDashboardMetric[];
  quickActions: SalesDashboardQuickAction[];
  recentSales: RecentSaleRow[];
}

export const salesDashboardMock: SalesDashboardViewModel = {
  metrics: [
    {
      key: 'todayRevenue',
      label: "Today's Revenue",
      value: 'K149.00',
      tone: 'teal',
      icon: 'wallet',
    },
    {
      key: 'salesToday',
      label: 'Sales Today',
      value: '4',
      tone: 'blue',
      icon: 'receipt',
    },
    {
      key: 'averageSale',
      label: 'Average Sale',
      value: 'K37.25',
      tone: 'orange',
      icon: 'average',
    },
    {
      key: 'unsynced',
      label: 'Unsynced',
      value: '0',
      tone: 'purple',
      icon: 'unsynced',
    },
  ],
  quickActions: [
    { key: 'viewAllSales', label: 'View All Sales', icon: 'sales', target: 'fuelSales' },
    { key: 'salesReports', label: 'Sales Reports', icon: 'report', target: 'reports' },
  ],
  recentSales: [
    {
      id: 'row-1',
      time: '27 Jan, 10:40 pm',
      reference: 'e701b400',
      amount: 80,
      payment: 'cash',
      status: 'completed',
    },
    {
      id: 'row-2',
      time: '27 Jan, 09:34 pm',
      reference: 'ebc4af9d',
      amount: 15,
      payment: 'cash',
      status: 'completed',
    },
    {
      id: 'row-3',
      time: '27 Jan, 03:26 pm',
      reference: '4723542e',
      amount: 54,
      payment: 'cash',
      status: 'completed',
    },
    {
      id: 'row-4',
      time: '27 Jan, 04:26 am',
      reference: '31c4ca65',
      amount: 0,
      payment: 'cash',
      status: 'completed',
    },
    {
      id: 'row-5',
      time: '16 Jan, 02:52 pm',
      reference: '9302da23',
      amount: 425.5,
      payment: 'cash',
      status: 'completed',
    },
    {
      id: 'row-6',
      time: '11 Jan, 12:06 am',
      reference: '2b3ef5ff',
      amount: 27,
      payment: 'cash',
      status: 'completed',
    },
  ],
};
