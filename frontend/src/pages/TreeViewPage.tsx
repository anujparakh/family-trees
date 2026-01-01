import { useLocation } from 'wouter';
import { FamilyTreeViewer } from '@/components/FamilyTree/FamilyTreeViewer';
import { Spinner } from '@phosphor-icons/react';
import { Button } from '@/components/ui';
import { useTree } from '@/hooks/useTreeQueries';

interface TreeViewPageProps {
  params: {
    treeId: string;
  };
}

/**
 * Page for viewing a specific family tree
 * Fetches tree data from API and renders FamilyTreeViewer
 */
export function TreeViewPage({ params }: TreeViewPageProps) {
  const { treeId } = params;
  const [, setLocation] = useLocation();
  const { data: tree, isLoading, error, refetch } = useTree(treeId);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-bg-primary">
        <Spinner size={48} className="text-accent-primary animate-spin mb-4" />
        <p className="text-text-secondary">Loading tree...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-bg-primary">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Failed to Load Tree</h1>
          <p className="text-text-secondary mb-6">
            {error instanceof Error ? error.message : 'Failed to load tree'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setLocation('/trees')}>
              Back to Trees
            </Button>
            <Button variant="primary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render tree viewer
  if (!tree) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-bg-primary">
        <p className="text-text-secondary">Tree not found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <FamilyTreeViewer familyTree={tree} />
    </div>
  );
}

export default TreeViewPage;
