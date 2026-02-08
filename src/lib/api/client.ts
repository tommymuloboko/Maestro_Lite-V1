import { env } from '@/config/env';
import { getStoredTokens, clearAllStorage } from '@/lib/storage/secureStore';
import { ApiError } from './errors';

interface RequestOptions extends RequestInit {
  params?: object;
  skipAuthRedirect?: boolean; // Skip auto-redirect on 401 (for login requests)
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipAuthRedirect, ...init } = options;

  let url = `${env.apiBaseUrl}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const tokens = getStoredTokens();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init.headers,
  };

  if (tokens?.accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  // TODO: Enable X-Station-Id header after backend CORS is updated to allow it
  // const stationId = getStoredStationId();
  // if (stationId) {
  //   (headers as Record<string, string>)['X-Station-Id'] = stationId;
  // }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized - session expired or invalid token
    if (response.status === 401 && !skipAuthRedirect) {
      console.warn('[API] Unauthorized - clearing session and redirecting to login');
      clearAllStorage();
      // Use location.replace to prevent back-navigation to authenticated pages
      window.location.replace('/login');
      throw new ApiError('UNAUTHORIZED', 'Session expired. Please log in again.', 401);
    }

    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      error.code ?? 'UNKNOWN_ERROR',
      error.message ?? 'An unknown error occurred',
      response.status
    );
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
