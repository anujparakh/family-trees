import { useState, useRef } from 'preact/hooks';
import { useLocation } from 'wouter';
import { useAuth } from '@clerk/clerk-react';
import { useMyTrees } from '@/hooks/useTreeQueries';
import { DownloadIcon, PlusIcon, SpinnerIcon, UploadIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui';
import { Header } from '@/components/Header';
import { importFromGEDCOM } from '@/utils/gedcomImport';
import { createCompleteTree } from '@/lib/api';

/**
 * Page showing trees owned/editable by the current user
 * Includes GEDCOM import functionality
 */
export function MyTreesPage() {
  const [, setLocation] = useLocation();
  const { getToken, isSignedIn } = useAuth();
  const { data, isLoading, error, refetch } = useMyTrees();
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trees = data?.trees ?? [];

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    setImporting(true);
    setImportError(null);

    try {
      // Parse GEDCOM file
      const familyTree = await importFromGEDCOM(file);

      // Get auth token
      const token = await getToken();
      if (!token) {
        throw new Error('You must be signed in to import trees');
      }

      // Convert persons object to array
      const personsArray = Object.values(familyTree.persons);

      // Create complete tree in one request
      const { tree } = await createCompleteTree(
        {
          name: familyTree.name,
          description: `Imported from ${file.name}`,
          isPublic: false,
          persons: personsArray,
          families: familyTree.families,
          rootPersonId: familyTree.rootPersonId,
        },
        token
      );

      // Redirect to the new tree
      setLocation(`/trees/${tree.id}`);
    } catch (err) {
      console.error('Import error:', err);
      setImportError(err instanceof Error ? err.message : 'Failed to import GEDCOM file');
      setImporting(false);
    }

    // Reset file input
    if (target) {
      target.value = '';
    }
  };

  if (!isSignedIn) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-bg-primary">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Sign In Required</h1>
        <p className="text-text-secondary mb-6">You need to sign in to view your trees</p>
        <Button variant="primary" onClick={() => setLocation('/')}>
          Go to Home
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-bg-primary">
        <SpinnerIcon size={48} className="text-accent-primary animate-spin mb-4" />
        <p className="text-text-secondary">Loading your trees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-bg-primary">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Failed to Load Trees</h1>
        <p className="text-text-secondary mb-6">
          {error instanceof Error ? error.message : 'Failed to load your trees'}
        </p>
        <Button variant="primary" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-bg-primary">
      <Header title="My Trees" backTo="/" backLabel="Home" />

      <div className="max-w-6xl mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* Subtitle */}
        <div className="flex my-4 space-x-4">
          <Button variant="primary" onClick={() => setLocation('/trees/new')}>
            <PlusIcon size={20} weight="regular" className="mr-2" />
            New Tree
          </Button>
          <Button variant="secondary" onClick={handleImportClick} disabled={importing}>
            <DownloadIcon size={20} weight="regular" className="mr-2" />
            {importing ? 'Importing...' : 'Import GEDCOM'}
          </Button>
        </div>

        {/* Import Error */}
        {importError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">
              <strong>Import Error:</strong> {importError}
            </p>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".ged,.gedcom"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Trees Table */}
        {trees.length === 0 ? (
          <div className="text-center py-12 bg-bg-secondary rounded-lg border border-border-primary">
            <p className="text-text-secondary mb-4">You don&apos;t have any trees yet</p>
            <Button variant="primary" onClick={handleImportClick}>
              <UploadIcon size={20} weight="regular" className="mr-2" />
              Import Your First Tree
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border-primary">
            <table className="w-full">
              <thead className="bg-bg-secondary border-b border-border-primary">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Name
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="bg-bg-primary divide-y divide-border-primary">
                {trees.map((tree: any, index: number) => (
                  <tr
                    key={tree.id}
                    onClick={() => setLocation(`/trees/${tree.id}`)}
                    className={`hover:bg-bg-hover transition-colors cursor-pointer ${
                      index % 2 === 0 ? 'bg-bg-secondary' : 'bg-bg-primary'
                    }`}
                  >
                    <td className="px-4 md:px-6 py-4 text-sm font-medium text-text-primary">
                      {tree.name}
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-text-secondary">
                      {tree.description || '-'}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-text-secondary">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          tree.role === 'owner'
                            ? 'bg-accent-primary/20 text-accent-primary'
                            : 'bg-accent-secondary/20 text-accent-secondary'
                        }`}
                      >
                        {tree.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTreesPage;
