import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClientProvider } from '@tanstack/react-query'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'
import { router } from './routes'
import { mantineTheme } from './theme/mantineTheme'
import { queryClient } from './lib/query/queryClient'
import { AuthProvider } from './context/AuthContext'
import { StationConfigProvider } from './context/StationConfigContext'
import { ConnectivityProvider } from './context/ConnectivityContext'

// Prevent default drag/drop behavior (prevents "dragEvent is not defined" error in Electron)
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={mantineTheme}>
      <Notifications position="top-right" />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StationConfigProvider>
            <ConnectivityProvider>
              <RouterProvider router={router} />
            </ConnectivityProvider>
          </StationConfigProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
)

