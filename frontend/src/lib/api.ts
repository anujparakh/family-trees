/**
 * API client with Clerk authentication
 */

import { API_URL } from '@/lib/clerk';
import type { Family, FamilyTree, Person } from '@/data/types';

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

// -----------------
// Tree API Methods
// -----------------

export interface TreeListItem {
  id: string;
  name: string;
  description: string | null;
  root_person_id: string | null;
  is_public: number;
  created_at: number;
  updated_at: number;
}

export interface TreesListResponse {
  trees: TreeListItem[];
  count: number;
}

export interface TreeCompleteResponse {
  tree: FamilyTree;
}

/**
 * Fetch all public trees
 */
export async function fetchPublicTrees(): Promise<TreesListResponse> {
  return apiRequest<TreesListResponse>('/trees/public');
}

/**
 * Fetch complete tree data by ID
 */
export async function fetchTreeById(treeId: string, token?: string): Promise<FamilyTree> {
  const response = await apiRequest<TreeCompleteResponse>(`/trees/${treeId}/complete`, { token });
  return response.tree;
}

/**
 * Fetch trees owned/editable by the current user
 */
export async function fetchMyTrees(token: string): Promise<TreesListResponse> {
  return apiRequest<TreesListResponse>('/trees', { token });
}

/**
 * Create a new tree
 */
export async function createTree(
  data: { name: string; description?: string; isPublic?: boolean },
  token: string
): Promise<{ tree: any }> {
  return apiRequest('/trees', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

/**
 * Create a complete tree with all persons and families in one request
 */
export async function createCompleteTree(
  data: {
    name: string;
    description?: string;
    isPublic?: boolean;
    persons: Person[];
    families: Family[];
    rootPersonId?: string;
  },
  token: string
): Promise<{ tree: any }> {
  return apiRequest('/trees/complete', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

/**
 * Create a new person
 */
export async function createPerson(
  data: {
    treeId: string;
    firstName: string;
    lastName?: string;
    birthDate?: string;
    deathDate?: string;
    gender?: 'male' | 'female' | 'other';
    notes?: string;
  },
  token: string
): Promise<{ person: Person }> {
  return apiRequest('/persons', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

/**
 * Create a new family
 */
export async function createFamily(
  data: {
    treeId: string;
    parents?: string[];
    children?: string[];
    marriageDate?: string;
    divorceDate?: string;
    status?: string;
  },
  token: string
): Promise<{ family: Family }> {
  return apiRequest('/families', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}
