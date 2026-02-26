/**
 * API Endpoints – mirrors backend at maestro-lite.onrender.com/api
 */
export const endpoints = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },

  // Transactions (new unified endpoint)
  transactions: {
    list: '/transactions',
    get: (id: string) => `/transactions/${id}`,
    summary: (stationId: string) => `/transactions/summary/${stationId}`,
    verifiedSummary: '/transactions/verified/summary',
  },

  // Attendant Shifts
  shifts: {
    listByStation: (stationId: string) => `/stations/${stationId}/attendant-shifts`,
    get: (id: string) => `/attendant-shifts/${id}`,
    open: '/attendant-shifts/open',
    end: (id: string) => `/attendant-shifts/${id}/end`,
    closeDeclaration: (id: string) => `/attendant-shifts/${id}/close-declaration`,
    verify: (id: string) => `/attendant-shifts/${id}/verify`,
    dispute: (id: string) => `/attendant-shifts/${id}/dispute`,
    verification: (id: string) => `/attendant-shifts/${id}/verification`,
  },

  // Fuel Transactions (legacy endpoints - may be replaced by /transactions)
  fuelSales: {
    list: '/fuel-sales',
    get: (id: string) => `/fuel-sales/${id}`,
    summary: '/fuel-sales/summary',
    raw: '/fuel-sales/raw',
    verified: '/fuel-sales/verified',
  },

  // Attendants
  attendants: {
    list: '/attendants',
    get: (id: string) => `/attendants/${id}`,
    create: '/attendants',
    update: (id: string) => `/attendants/${id}`,
    delete: (id: string) => `/attendants/${id}`,
  },

  // Attendant Tags (top-level endpoint)
  attendantTags: {
    list: '/attendant-tags',
    get: (id: string) => `/attendant-tags/${id}`,
    create: '/attendant-tags',
    revoke: (id: string) => `/attendant-tags/${id}/revoke`,
    activate: (id: string) => `/attendant-tags/${id}/activate`,
  },

  // Pumps (PTS system)
  pumps: {
    list: '/pts/pumps',
    get: (id: string) => `/pts/pumps/${id}`,
    status: '/pts/pumps',
    transactions: (id: string) => `/pts/pumps/${id}/transactions`,
  },

  // Tanks (PTS system)
  tanks: {
    list: '/pts/tanks',
    get: (id: string) => `/pts/tanks/${id}`,
    readings: (id: string) => `/pts/tanks/${id}/readings`,
    alerts: '/pts/tanks/alerts',
  },

  // Reports — no dedicated endpoints; derived from shifts + transactions

  // Settings
  settings: {
    station: '/settings/station',
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

