/**
 * API Endpoints – mirrors Node.js backend at localhost:3000/api
 * Swagger docs: http://localhost:3000/api-docs
 */
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },

  // Attendant Shifts (station-scoped)
  shifts: {
    // List shifts for a station: GET /api/stations/{stationId}/attendant-shifts
    listByStation: (stationId: string) => `/stations/${stationId}/attendant-shifts`,
    get: (id: string) => `/attendant-shifts/${id}`,
    open: '/attendant-shifts/open',
    start: '/attendant-shifts/open',
    end: (id: string) => `/attendant-shifts/${id}/end`,
    verify: (id: string) => `/attendant-shifts/${id}/verify`,
    dispute: (id: string) => `/attendant-shifts/${id}/dispute`,
    rawTransactions: (id: string) => `/attendant-shifts/${id}/raw-transactions`,
    verifiedTransactions: (id: string) => `/attendant-shifts/${id}/verified-transactions`,
    closeDeclaration: (id: string) => `/attendant-shifts/${id}/close-declaration`,
    declaration: (id: string) => `/attendant-shifts/${id}/close-declaration`,
    verification: (id: string) => `/attendant-shifts/${id}/verification`,
    verificationSummary: (id: string) => `/attendant-shifts/${id}/verification`,
  },

  // Fuel Transactions
  fuelSales: {
    list: '/fuel-sales',
    get: (id: string) => `/fuel-sales/${id}`,
    summary: '/fuel-sales/summary',
    raw: '/fuel-sales/raw',
    verified: '/fuel-sales/verified',
  },

  // Pumps (PTS system)
  pumps: {
    list: '/pts/pumps',
    get: (id: string) => `/pts/pumps/${id}`,
    status: '/pts/pumps/status',
    transactions: (id: string) => `/pts/pumps/${id}/transactions`,
  },

  // Tanks (PTS system)
  tanks: {
    list: '/pts/tanks',
    get: (id: string) => `/pts/tanks/${id}`,
    readings: (id: string) => `/pts/tanks/${id}/readings`,
    alerts: '/pts/tanks/alerts',
  },

  // Reports (all use VERIFIED transactions only)
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
    attendant: (id: string) => `/settings/attendants/${id}`,
    attendantTags: '/settings/attendant-tags',
    paymentTypes: '/settings/payment-types',
    printers: '/settings/printers',
  },

  // Dashboard
  dashboard: {
    summary: '/dashboard/summary',
    alerts: '/dashboard/alerts',
    recentShifts: '/dashboard/recent-shifts',
  },

  // Health check
  health: '/health',
} as const;
