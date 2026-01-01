import { useState } from 'preact/hooks';
import { useUser } from '@clerk/clerk-react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { Button } from '@/components/ui';

/**
 * Example component demonstrating authenticated API requests
 */
export function AuthExample() {
  const { user } = useUser();
  const authenticatedFetch = useAuthenticatedFetch();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authenticatedFetch('/api/me');
      setUserInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user info');
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilies = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authenticatedFetch('/api/families');
      setFamilies(data.families || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch families');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Clerk User Info</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(
            {
              id: user?.id,
              email: user?.primaryEmailAddress?.emailAddress,
              firstName: user?.firstName,
              lastName: user?.lastName,
            },
            null,
            2
          )}
        </pre>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">API Examples</h2>
        <div className="space-y-4">
          <div>
            <Button onClick={fetchUserInfo} disabled={loading}>
              Fetch /api/me
            </Button>
            {userInfo && (
              <pre className="mt-2 bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(userInfo, null, 2)}
              </pre>
            )}
          </div>

          <div>
            <Button onClick={fetchFamilies} disabled={loading}>
              Fetch /api/families
            </Button>
            {families.length > 0 && (
              <pre className="mt-2 bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(families, null, 2)}
              </pre>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
              Error: {error}
            </div>
          )}

          {loading && <div className="text-gray-600">Loading...</div>}
        </div>
      </div>
    </div>
  );
}
