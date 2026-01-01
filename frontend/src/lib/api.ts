/**
 * API client with Clerk authentication
 */

import { API_URL } from '@/lib/clerk';

export interface ApiOptions extends RequestInit {
  token?: string;
}

/**
 * Make an authenticated API request
 * @param endpoint - API endpoint (e.g., '/api/families')
 * @param options - Fetch options with optional Clerk token
 */
export async function apiRequest<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers, ...fetchOptions } = options;

  const url = `${API_URL}${endpoint}`;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add Clerk auth token if provided
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
