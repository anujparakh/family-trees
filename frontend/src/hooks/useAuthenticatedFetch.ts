import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'preact/hooks';
import { apiRequest, type ApiOptions } from '@/lib/api';

/**
 * Hook for making authenticated API requests
 * Automatically includes Clerk session token in requests
 */
export function useAuthenticatedFetch() {
  const { getToken } = useAuth();

  const authenticatedFetch = useCallback(
    async <T = any>(endpoint: string, options: Omit<ApiOptions, 'token'> = {}) => {
      // Get fresh Clerk session token
      const token = await getToken();

      if (!token) {
        throw new Error('No authentication token available');
      }

      return apiRequest<T>(endpoint, {
        ...options,
        token,
      });
    },
    [getToken]
  );

  return authenticatedFetch;
}
