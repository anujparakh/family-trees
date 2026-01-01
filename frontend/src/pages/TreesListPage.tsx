import { useLocation } from 'wouter';
import { TreeIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthButton } from '@/components/Auth/AuthButton';
import { ArrowLeft } from '@phosphor-icons/react';

// Mock data - will be replaced with API call later
const mockTrees = [
  {
    id: 'example-tree-001',
    name: 'Smith Family Tree',
    description: 'An example family tree showing the Smith-Johnson-Brown-Anderson families across three generations.',
    created_at: 1234567890,
  },
  {
    id: 'tree-002',
    name: 'Johnson Dynasty',
    description: 'Multi-generational family tree spanning over 150 years.',
    created_at: 1234567800,
  },
  {
    id: 'tree-003',
    name: 'Martinez Heritage',
    description: 'Documenting the Martinez family lineage from the early 1900s.',
    created_at: 1234567700,
  },
];

/**
 * Page showing list of all public trees
 */
export function TreesListPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="w-full min-h-screen flex flex-col bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-primary p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              ariaLabel="Back to home"
            >
              <ArrowLeft size={20} weight="regular" />
            </Button>
            <TreeIcon size={28} className="text-accent-primary" />
            <h1 className="text-xl font-semibold text-text-primary">All Trees</h1>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Public Family Trees</h2>
            <p className="text-text-secondary">
              Browse and explore publicly available family trees from the community
            </p>
          </div>

          {/* Trees table */}
          <div className="bg-bg-secondary rounded-lg border border-border-primary overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-tertiary border-b border-border-primary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary">
                  {mockTrees.map((tree) => (
                    <tr
                      key={tree.id}
                      className="hover:bg-bg-hover transition-colors cursor-pointer"
                      onClick={() => setLocation(`/trees/${tree.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <TreeIcon size={20} className="text-accent-primary" />
                          <span className="text-sm font-medium text-text-primary">
                            {tree.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary line-clamp-2">
                          {tree.description}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/trees/${tree.id}`);
                          }}
                        >
                          View Tree
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {mockTrees.length === 0 && (
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
