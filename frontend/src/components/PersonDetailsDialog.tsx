import { memo } from 'preact/compat';
import { Dialog } from '@/components/ui';
import { Person, FamilyTree } from '@/data/types';
import { getPersonRelationships, getPersonFullName, getPersonDates } from '@/utils/relationships';

interface PersonDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  familyTree: FamilyTree;
}

interface RelationshipSectionProps {
  title: string;
  people: Person[];
}

/**
 * Section showing a list of related people
 */
function RelationshipSection({ title, people }: RelationshipSectionProps) {
  if (people.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
      <ul className="space-y-1">
        {people.map((person) => (
          <li key={person.id} className="text-sm text-gray-700">
            <span className="font-medium">{getPersonFullName(person)}</span>
            <span className="text-gray-500 ml-2 text-xs">({getPersonDates(person)})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Dialog showing detailed information about a person and their relationships
 */
function PersonDetailsDialogComponent({
  isOpen,
  onClose,
  person,
  familyTree,
}: PersonDetailsDialogProps) {
  if (!person) return null;

  const relationships = getPersonRelationships(person.id, familyTree);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={getPersonFullName(person)} maxWidth="lg">
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Basic Information</h3>
          <div className="space-y-1 text-sm">
            {person.birthDate && (
              <div>
                <span className="text-gray-600">Born:</span>{' '}
                <span className="text-gray-900">{person.birthDate}</span>
              </div>
            )}
            {person.deathDate && (
              <div>
                <span className="text-gray-600">Died:</span>{' '}
                <span className="text-gray-900">{person.deathDate}</span>
              </div>
            )}
            {person.gender && (
              <div>
                <span className="text-gray-600">Gender:</span>{' '}
                <span className="text-gray-900 capitalize">{person.gender}</span>
              </div>
            )}
          </div>
        </div>

        {/* Relationships */}
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <h3 className="text-base font-semibold text-gray-900">Relationships</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RelationshipSection
              title={`Spouse${relationships.spouses.length > 1 ? 's' : ''}`}
              people={relationships.spouses}
            />
            <RelationshipSection
              title={`Parent${relationships.parents.length > 1 ? 's' : ''}`}
              people={relationships.parents}
            />
            <RelationshipSection
              title={`Child${relationships.children.length > 1 ? 'ren' : ''}`}
              people={relationships.children}
            />
            <RelationshipSection
              title={`Sibling${relationships.siblings.length > 1 ? 's' : ''}`}
              people={relationships.siblings}
            />
            <RelationshipSection
              title={`Cousin${relationships.cousins.length > 1 ? 's' : ''}`}
              people={relationships.cousins}
            />
          </div>

          {/* No relationships message */}
          {relationships.spouses.length === 0 &&
            relationships.parents.length === 0 &&
            relationships.children.length === 0 &&
            relationships.siblings.length === 0 &&
            relationships.cousins.length === 0 && (
              <p className="text-sm text-gray-500 italic">No known relationships</p>
            )}
        </div>
      </div>
    </Dialog>
  );
}

export const PersonDetailsDialog = memo(PersonDetailsDialogComponent);

export default PersonDetailsDialog;
