import { useState, useMemo } from 'preact/hooks';
import { Dialog } from '@/components/ui';
import { FamilyTree, Person } from '@/data/types';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  familyTree: FamilyTree;
  onPersonSelect: (personId: string) => void;
}

/**
 * Search dialog with type-ahead for finding people in the tree
 */
export function SearchDialog({ isOpen, onClose, familyTree, onPersonSelect }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter people based on search query
  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return Object.values(familyTree.persons).filter((person) => {
      const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [searchQuery, familyTree.persons]);

  const handlePersonClick = (personId: string) => {
    onPersonSelect(personId);
    onClose();
    setSearchQuery('');
  };

  const handleClose = () => {
    onClose();
    setSearchQuery('');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Search Family Tree"
      subtitle="Click on a person to zoom to them"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            weight="regular"
          />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {searchQuery.trim() && filteredPeople.length === 0 && (
            <p className="text-center text-text-secondary py-8">No people found</p>
          )}

          {filteredPeople.length > 0 && (
            <div className="divide-y divide-border-primary">
              {filteredPeople.map((person) => (
                <button
                  key={person.id}
                  onClick={() => handlePersonClick(person.id)}
                  className="w-full text-left px-4 py-3 hover:bg-bg-hover transition-colors hover:rounded-md"
                >
                  <div className="font-medium text-text-primary">
                    {person.firstName} {person.lastName}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {!searchQuery.trim() && (
          <p className="text-center text-text-tertiary py-8 text-sm">
            Start typing to search for people...
          </p>
        )}
      </div>
    </Dialog>
  );
}

export default SearchDialog;
