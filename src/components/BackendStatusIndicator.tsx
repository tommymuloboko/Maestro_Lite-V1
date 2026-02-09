import { Badge, Tooltip } from '@mantine/core';
import { IconWifi, IconWifiOff, IconLoader } from '@tabler/icons-react';
import { useConnectivity } from '@/hooks/useConnectivity';

/**
 * Shows the API connection status in the header.
 * Uses ConnectivityContext to check API health.
 */
export default function BackendStatusIndicator() {
    const { apiStatus } = useConnectivity();

    const config = {
        connected: {
            color: 'green',
            label: 'Online',
            icon: IconWifi,
            tooltip: 'API connected',
        },
        disconnected: {
            color: 'red',
            label: 'Offline',
            icon: IconWifiOff,
            tooltip: 'API disconnected',
        },
        connecting: {
            color: 'yellow',
            label: 'Connecting',
            icon: IconLoader,
            tooltip: 'Connecting to API...',
        },
        error: {
            color: 'orange',
            label: 'Error',
            icon: IconWifiOff,
            tooltip: 'API connection error',
        },
    };

    const { color, label, icon: Icon, tooltip } = config[apiStatus];

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
