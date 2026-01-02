import { useLocation } from 'wouter';
import { Button } from '@/components/ui';
import { Header } from '@/components/Header';
import { usePublicTrees } from '@/hooks/useTreeQueries';
import { SpinnerIcon } from '@phosphor-icons/react';
import { TreeIcon } from '@/components/ui/icons';

/**
 * Page showing list of all public trees
 */
export function TreesListPage() {
  const [, setLocation] = useLocation();
  const { data, isLoading, error, refetch } = usePublicTrees();

  const trees = data?.trees ?? [];

  return (
    <div className="w-full min-h-screen flex flex-col bg-bg-primary">
      <Header title="All Trees" backTo="/" backLabel="Home" />

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Public Family Trees</h2>
            <p className="text-text-secondary">
              Browse and explore publicly available family trees from the community
            </p>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <SpinnerIcon size={48} className="text-accent-primary animate-spin" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-bg-secondary rounded-lg border border-border-primary p-8 text-center">
              <p className="text-text-primary font-semibold mb-2">Failed to load trees</p>
              <p className="text-text-secondary text-sm mb-4">
                {error instanceof Error ? error.message : 'Failed to load trees'}
              </p>
              <Button variant="primary" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}

          {/* Trees table */}
          {!isLoading && !error && trees.length > 0 && (
            <div className="bg-bg-secondary rounded-lg border border-border-primary overflow-hidden">
              <table className="w-full">
                <thead className="bg-bg-tertiary border-b border-border-primary">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Name
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary">
                  {trees.map((tree, index) => (
                    <tr
                      key={tree.id}
                      className={`hover:bg-bg-hover transition-colors cursor-pointer ${
                        index % 2 === 0 ? 'bg-bg-secondary' : 'bg-bg-primary'
                      }`}
                      onClick={() => setLocation(`/trees/${tree.id}`)}
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <TreeIcon size={20} className="text-accent-primary flex-shrink-0" />
                          <span className="text-sm font-medium text-text-primary">{tree.name}</span>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4">
                        <span className="text-sm text-text-secondary line-clamp-2">
                          {tree.description || 'No description'}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/trees/${tree.id}`);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && trees.length === 0 && (
            <div className="text-center py-12">
              <TreeIcon size={48} className="text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">No public trees available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TreesListPage;
