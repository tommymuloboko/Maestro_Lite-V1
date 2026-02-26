import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { env } from '@/config/env';

interface DataSourceContextValue {
    /** `true` = running local simulator, `false` = fetching from real backend */
    useSimulator: boolean;
    toggleDataSource: () => void;
}

const DataSourceContext = createContext<DataSourceContextValue | null>(null);

export function DataSourceProvider({ children }: { children: ReactNode }) {
    const [useSimulator, setUseSimulator] = useState(env.useMonitoringSimulator);

    const toggleDataSource = useCallback(() => {
        setUseSimulator((prev) => !prev);
    }, []);

    return (
        <DataSourceContext.Provider value={{ useSimulator, toggleDataSource }}>
            {children}
        </DataSourceContext.Provider>
    );
}

export function useDataSource(): DataSourceContextValue {
    const ctx = useContext(DataSourceContext);
    if (!ctx) {
        throw new Error('useDataSource must be used within a DataSourceProvider');
    }
    return ctx;
}
