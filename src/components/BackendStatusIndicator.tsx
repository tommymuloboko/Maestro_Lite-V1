import { Badge, Group, Tooltip } from '@mantine/core';
import { IconWifi, IconWifiOff, IconLoader, IconPlugConnected, IconPlugConnectedX } from '@tabler/icons-react';
import { useConnectivity } from '@/hooks/useConnectivity';

const apiConfig = {
    connected: { color: 'green', label: 'API', icon: IconWifi, tooltip: 'API connected' },
    disconnected: { color: 'red', label: 'API', icon: IconWifiOff, tooltip: 'API disconnected' },
    connecting: { color: 'yellow', label: 'API', icon: IconLoader, tooltip: 'Connecting to API...' },
    error: { color: 'orange', label: 'API', icon: IconWifiOff, tooltip: 'API connection error' },
};

const wsConfig = {
    connected: { color: 'green', label: 'Live', icon: IconPlugConnected, tooltip: 'WebSocket connected — real-time updates active' },
    disconnected: { color: 'gray', label: 'WS', icon: IconPlugConnectedX, tooltip: 'WebSocket disconnected — using polling' },
    connecting: { color: 'yellow', label: 'WS', icon: IconLoader, tooltip: 'WebSocket connecting...' },
    error: { color: 'orange', label: 'WS', icon: IconPlugConnectedX, tooltip: 'WebSocket error — using polling' },
};

function StatusBadge({ color, label, icon: Icon, tooltip }: { color: string; label: string; icon: typeof IconWifi; tooltip: string }) {
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

/**
 * Shows API + WebSocket connection status in the header.
 */
export default function BackendStatusIndicator() {
    const { apiStatus, wsStatus } = useConnectivity();

    return (
        <Group gap={6}>
            <StatusBadge {...apiConfig[apiStatus]} />
            <StatusBadge {...wsConfig[wsStatus]} />
        </Group>
    );
}
