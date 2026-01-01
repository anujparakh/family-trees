import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchPublicTrees, fetchTreeById } from '@/lib/api';

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
