import { Navigate, Outlet } from 'react-router-dom';
import { useStationConfig } from '@/hooks/useStationConfig';
import { paths } from '../paths';

export function RequireStationConfig() {
  const { stationId, pts2Url } = useStationConfig();

  if (!stationId || !pts2Url) {
    return <Navigate to={paths.settings} replace />;
  }

  return <Outlet />;
}
