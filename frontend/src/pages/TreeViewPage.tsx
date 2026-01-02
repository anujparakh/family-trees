import { FamilyTreeViewer } from '@/components/FamilyTree/FamilyTreeViewer';
import { Header } from '@/components/Header';
import { HowToDialog } from '@/components/HowToDialog';
import { PersonDetailsDialog } from '@/components/PersonDetailsDialog';
import { SettingsDialog } from '@/components/Settings/SettingsDialog';
import { ShareDialog } from '@/components/ShareDialog';
import { Button } from '@/components/ui';
import type { Person } from '@/data/types';
import { useTree } from '@/hooks/useTreeQueries';
import { hasSeenInstructions, markInstructionsAsSeen } from '@/utils/sessionStorage';
import { QuestionIcon, ShareNetworkIcon, Spinner } from '@phosphor-icons/react';
import { useEffect, useState } from 'preact/hooks';
import { useLocation } from 'wouter';

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

  // Dialog and UI state
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHowToOpen, setIsHowToOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Check if user has seen instructions on mount
  useEffect(() => {
    if (!hasSeenInstructions()) {
      setIsHowToOpen(true);
    }
  }, []);

  const handleOrientationChange = (newOrientation: 'vertical' | 'horizontal') => {
    setOrientation(newOrientation);
  };

  const handleHowToClose = () => {
    setIsHowToOpen(false);
    markInstructionsAsSeen();
  };

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
    <div className="w-full h-screen flex flex-col">
      <Header title={tree.name} backTo="/" backLabel="Landing Page">
        <Button variant="ghost" onClick={() => setIsHowToOpen(true)} ariaLabel="How to navigate">
          <QuestionIcon size={20} weight="regular" />
        </Button>
        {/* Show share button only if user has edit access */}
        {(tree.userRole === 'owner' || tree.userRole === 'editor') && (
          <Button variant="ghost" onClick={() => setIsShareOpen(true)} ariaLabel="Share">
            <ShareNetworkIcon size={20} weight="regular" />
          </Button>
        )}
      </Header>

      {/* Tree Viewer */}
      <div className="flex-1 overflow-hidden">
        <FamilyTreeViewer
          familyTree={tree}
          orientation={orientation}
          onPersonClick={setSelectedPerson}
        />
      </div>

      {/* Dialogs */}
      <PersonDetailsDialog
        person={selectedPerson}
        isOpen={selectedPerson !== null}
        onClose={() => setSelectedPerson(null)}
        familyTree={tree}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        orientation={orientation}
        onOrientationChange={handleOrientationChange}
      />

      <HowToDialog isOpen={isHowToOpen} onClose={handleHowToClose} />

      <ShareDialog isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} tree={tree} />
    </div>
  );
}

export default TreeViewPage;
