export const mockDashboardStats = [
  { label: 'Total sales', value: 'ZMW 4.8M', trend: { value: 12.4, isPositive: true } },
  { label: 'Transactions', value: '1,240', trend: { value: 6.2, isPositive: true } },
  { label: 'Avg. sale value', value: 'ZMW 3,870', trend: { value: 3.1, isPositive: true } },
  { label: 'Active pumps', value: '8', trend: { value: 0, isPositive: true } },
];

export const mockDashboardTasks = [
  {
    id: 1,
    title: 'Verify morning shift',
    description: 'Review and verify transactions from the morning shift',
    badge: { label: 'Pending verification', color: 'yellow' },
    date: '06.02.2026',
    assignee: 'John Mwale',
  },
  {
    id: 2,
    title: 'Tank level check',
    description: 'Record tank meter readings for all underground tanks',
    badge: { label: 'Meter readings', color: 'blue' },
    date: '06.02.2026',
    assignee: 'Peter Banda',
  },
  {
    id: 3,
    title: 'Cash reconciliation',
    description: 'Reconcile cash payments with POS totals',
    badge: { label: 'Finance', color: 'green' },
    date: '05.02.2026',
    assignee: 'Mary Zulu',
  },
  {
    id: 4,
    title: 'Pump maintenance',
    description: 'Schedule maintenance for Pump 3 - slow dispensing reported',
    badge: { label: 'Maintenance', color: 'orange' },
    date: '07.02.2026',
    assignee: 'James Phiri',
  },
];

export const mockRecentShifts = [
  { id: 'SH-24051', attendant: 'John Mwale', amount: 'ZMW 128,400', status: 'Verified', date: 'Today, 11:45' },
  { id: 'SH-24050', attendant: 'Peter Banda', amount: 'ZMW 86,900', status: 'Pending', date: 'Today, 09:10' },
  { id: 'SH-24049', attendant: 'Mary Zulu', amount: 'ZMW 42,750', status: 'Verified', date: 'Yesterday, 16:30' },
  { id: 'SH-24048', attendant: 'James Phiri', amount: 'ZMW 61,200', status: 'Variance', date: 'Yesterday, 10:05' },
];
