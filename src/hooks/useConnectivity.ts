import { useConnectivityContext } from '@/context/ConnectivityContext';

export function useConnectivity() {
  return useConnectivityContext();
}
