import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchPublicTrees, fetchTreeById, fetchMyTrees } from '@/lib/api';

/**
 * Query hook to fetch all public trees
 */
export function usePublicTrees() {
  return useQuery({
    queryKey: ['trees', 'public'],
    queryFn: fetchPublicTrees,
  });
}

/**
 * Query hook to fetch a single tree by ID
 * Automatically includes Clerk auth token for private trees
 */
export function useTree(treeId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['trees', treeId],
    queryFn: async () => {
      const token = await getToken();
      return fetchTreeById(treeId, token || undefined);
    },
    enabled: !!treeId,
  });
}

/**
 * Query hook to fetch trees owned/editable by the current user
 * Requires authentication
 */
export function useMyTrees() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['trees', 'my-trees'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return fetchMyTrees(token);
    },
    enabled: isSignedIn,
  });
}
