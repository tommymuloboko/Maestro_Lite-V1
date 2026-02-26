import { Switch, Group, Badge } from '@mantine/core';
import { IconDatabase, IconTestPipe } from '@tabler/icons-react';
import { useDataSource } from '@/context/DataSourceContext';

export function DataSourceToggle() {
    const { useSimulator, toggleDataSource } = useDataSource();

    return (
        <Group gap="xs" align="center">
            <IconDatabase size={16} style={{ opacity: useSimulator ? 0.4 : 1 }} />
            <Switch
                checked={useSimulator}
                onChange={toggleDataSource}
                size="md"
                color="brand"
                aria-label="Toggle between simulator and live data"
            />
            <IconTestPipe size={16} style={{ opacity: useSimulator ? 1 : 0.4 }} />
            <Badge
                variant={useSimulator ? 'light' : 'filled'}
                color={useSimulator ? 'yellow' : 'teal'}
                size="sm"
            >
                {useSimulator ? 'Simulator' : 'Live'}
            </Badge>
        </Group>
    );
}
