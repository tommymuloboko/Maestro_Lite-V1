export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },

  // Shifts
  shifts: {
    list: '/shifts',
    get: (id: string) => `/shifts/${id}`,
    start: '/shifts/start',
    end: (id: string) => `/shifts/${id}/end`,
    verify: (id: string) => `/shifts/${id}/verify`,
    transactions: (id: string) => `/shifts/${id}/transactions`,
  },

  // Fuel Sales
  fuelSales: {
    list: '/fuel-sales',
    get: (id: string) => `/fuel-sales/${id}`,
    summary: '/fuel-sales/summary',
  },

  // Pumps
  pumps: {
    list: '/pumps',
    get: (id: string) => `/pumps/${id}`,
    status: '/pumps/status',
    transactions: (id: string) => `/pumps/${id}/transactions`,
  },

  // Tanks
  tanks: {
    list: '/tanks',
    get: (id: string) => `/tanks/${id}`,
    readings: (id: string) => `/tanks/${id}/readings`,
    alerts: '/tanks/alerts',
  },

  // Reports
  reports: {
    shiftSummary: '/reports/shift-summary',
    dailySales: '/reports/daily-sales',
    attendantPerformance: '/reports/attendant-performance',
    pumpTotals: '/reports/pump-totals',
  },

  // Settings
  settings: {
    station: '/settings/station',
    attendants: '/settings/attendants',
    paymentTypes: '/settings/payment-types',
    printers: '/settings/printers',
  },

  // Dashboard
  dashboard: {
    summary: '/dashboard/summary',
    alerts: '/dashboard/alerts',
    recentShifts: '/dashboard/recent-shifts',
  },
} as const;
