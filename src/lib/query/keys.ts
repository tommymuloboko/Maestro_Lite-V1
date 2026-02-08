export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    summary: () => [...queryKeys.dashboard.all, 'summary'] as const,
    alerts: () => [...queryKeys.dashboard.all, 'alerts'] as const,
  },

  // Shifts
  shifts: {
    all: ['shifts'] as const,
    lists: () => [...queryKeys.shifts.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.shifts.lists(), filters] as const,
    details: () => [...queryKeys.shifts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.shifts.details(), id] as const,
  },

  // Fuel Sales
  fuelSales: {
    all: ['fuelSales'] as const,
    lists: () => [...queryKeys.fuelSales.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.fuelSales.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.fuelSales.all, 'detail', id] as const,
    summary: (filters: unknown) => [...queryKeys.fuelSales.all, 'summary', filters] as const,
  },

  // Pumps
  pumps: {
    all: ['pumps'] as const,
    list: () => [...queryKeys.pumps.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.pumps.all, 'detail', id] as const,
    status: () => [...queryKeys.pumps.all, 'status'] as const,
    transactions: (id: string) => [...queryKeys.pumps.all, 'transactions', id] as const,
  },

  // Tanks
  tanks: {
    all: ['tanks'] as const,
    list: () => [...queryKeys.tanks.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.tanks.all, 'detail', id] as const,
    readings: (id: string) => [...queryKeys.tanks.all, 'readings', id] as const,
    alerts: () => [...queryKeys.tanks.all, 'alerts'] as const,
  },

  // Reports
  reports: {
    all: ['reports'] as const,
    shiftSummary: (filters: unknown) => [...queryKeys.reports.all, 'shiftSummary', filters] as const,
    dailySales: (filters: unknown) => [...queryKeys.reports.all, 'dailySales', filters] as const,
    attendantPerformance: (filters: unknown) => [...queryKeys.reports.all, 'attendantPerformance', filters] as const,
    pumpTotals: (filters: unknown) => [...queryKeys.reports.all, 'pumpTotals', filters] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
    station: () => [...queryKeys.settings.all, 'station'] as const,
    attendants: () => [...queryKeys.settings.all, 'attendants'] as const,
    paymentTypes: () => [...queryKeys.settings.all, 'paymentTypes'] as const,
    printers: () => [...queryKeys.settings.all, 'printers'] as const,
  },
} as const;
