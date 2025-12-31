import { memo } from 'preact/compat';
import { format } from 'date-fns';
import { NodeProps } from 'reactflow';
import { PersonNodeData } from '../../data/types';

/**
 * PersonNode component - ReactFlow custom node for rendering a person card
 */
function PersonNodeComponent({ data, selected }: NodeProps<PersonNodeData>) {
  const { person } = data;

  // Format dates for display
  const birthYear = person.birthDate ? format(new Date(person.birthDate), 'yyyy') : '?';
  const deathYear = person.deathDate
    ? format(new Date(person.deathDate), 'yyyy')
    : person.birthDate
      ? 'present'
      : '?';

  const lifespan = `${birthYear} - ${deathYear}`;

  // Gender-based styling
  const borderColor =
    person.gender === 'male'
      ? 'border-blue-500'
      : person.gender === 'female'
        ? 'border-pink-500'
        : 'border-gray-500';

  const bgColor = selected ? 'bg-blue-50' : 'bg-white';

  return (
    <div
      className={`${bgColor} ${borderColor} border-2 rounded-lg shadow-md hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer`}
      style={{
        width: '140px',
        height: '100px',
        padding: '8px',
      }}
    >
      {/* Avatar circle with initials */}
      <div className="flex justify-center mb-1">
        <div className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
          <span className="text-gray-600 font-semibold text-xs select-none">
            {person.firstName[0]}
            {person.lastName[0]}
          </span>
        </div>
      </div>

      {/* Name */}
      <div className="text-center">
        <div className="text-gray-900 font-semibold text-sm select-none truncate">
          {person.firstName}
        </div>
        <div className="text-gray-700 text-xs select-none truncate">{person.lastName}</div>
      </div>

      {/* Lifespan */}
      <div className="text-center text-gray-500 text-[10px] mt-1 select-none">{lifespan}</div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const PersonNode = memo(PersonNodeComponent);

export default PersonNode;
