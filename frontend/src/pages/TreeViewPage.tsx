import { useState, useEffect } from 'preact/hooks';
import { useLocation } from 'wouter';
import { FamilyTreeViewer } from '@/components/FamilyTree/FamilyTreeViewer';
import { Spinner, QuestionIcon, GearIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui';
import { TreeIcon } from '@/components/ui/icons';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthButton } from '@/components/Auth/AuthButton';
import { PersonDetailsDialog } from '@/components/PersonDetailsDialog';
import { SettingsDialog } from '@/components/Settings/SettingsDialog';
import { HowToDialog } from '@/components/HowToDialog';
import { hasSeenInstructions, markInstructionsAsSeen } from '@/utils/sessionStorage';
import { useTree } from '@/hooks/useTreeQueries';
import type { Person } from '@/data/types';

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
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-bg-secondary border-b border-border-primary">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation('/')}
            className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
            aria-label="Landing Page"
          >
            <TreeIcon size={24} className="text-accent-primary" />
          </button>
          <h1 className="text-xl font-semibold text-text-primary">{tree.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setIsHowToOpen(true)} ariaLabel="How to navigate">
            <QuestionIcon size={20} weight="regular" />
          </Button>
          {/* <Button variant="ghost" onClick={() => setIsSettingsOpen(true)} ariaLabel="Settings">
            <GearIcon size={20} weight="regular" />
          </Button> */}
          <ThemeToggle />
          <AuthButton />
        </div>
      </header>

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
    </div>
  );
}

export default TreeViewPage;
