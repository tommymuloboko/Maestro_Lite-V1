import { Navigate, Outlet } from 'react-router-dom';
import { useStationConfig } from '@/hooks/useStationConfig';
import { paths } from '../paths';

export function RequireStationConfig() {
  const { stationId } = useStationConfig();

  if (!stationId) {
    return <Navigate to={paths.settings} replace />;
  }

  return <Outlet />;
}
