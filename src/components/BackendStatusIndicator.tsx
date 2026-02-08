import { useState, useEffect } from 'react';
import { Badge, Tooltip } from '@mantine/core';
import { IconWifi, IconWifiOff, IconLoader } from '@tabler/icons-react';
import type { BackendStatus } from '@/types/electron';

/**
 * Shows the backend connection status in the header.
 * Uses Electron IPC to listen for status changes.
 */
export default function BackendStatusIndicator() {
    const [status, setStatus] = useState<BackendStatus>('OFFLINE');

    useEffect(() => {
        // Only works in Electron environment
        if (!window.electronAPI) {
            return;
        }

        // Get initial status
        window.electronAPI.getBackendStatus().then(setStatus);

        // Listen for status changes
        const unsubscribe = window.electronAPI.onBackendStatusChange(setStatus);

        return () => {
            unsubscribe();
        };
    }, []);

    // Don't render in browser (non-Electron)
    if (!window.electronAPI) {
        return null;
    }

    const config = {
        ONLINE: {
            color: 'green',
            label: 'Online',
            icon: IconWifi,
            tooltip: 'Backend connected',
        },
        OFFLINE: {
            color: 'red',
            label: 'Offline',
            icon: IconWifiOff,
            tooltip: 'Backend disconnected',
        },
        STARTING: {
            color: 'yellow',
            label: 'Starting',
            icon: IconLoader,
            tooltip: 'Backend starting...',
        },
        DEGRADED: {
            color: 'orange',
            label: 'Degraded',
            icon: IconWifi,
            tooltip: 'Backend connection unstable',
        },
    };

    const { color, label, icon: Icon, tooltip } = config[status];

    return (
        <Tooltip label={tooltip} withArrow>
            <Badge
                size="lg"
                radius="md"
                leftSection={<Icon size={14} />}
                styles={{
                    root: {
                        height: 36,
                        fontWeight: 600,
                        paddingInline: 12,
                        display: 'flex',
                        alignItems: 'center',
                        background: `var(--mantine-color-${color}-light)`,
                        color: `var(--mantine-color-${color}-filled)`,
                        border: `1px solid var(--mantine-color-${color}-light-hover)`,
                        textTransform: 'none',
                    },
                }}
            >
                {label}
            </Badge>
        </Tooltip>
    );
}
