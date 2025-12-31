import { memo } from 'preact/compat';
import { format } from 'date-fns';
import { NodeProps, Handle, Position } from 'reactflow';
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
      className={`${bgColor} ${borderColor} border-2 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-100 transition-all cursor-pointer overflow-hidden flex flex-col p-2 min-w-[140px] max-w-[140px] min-h-[100px]`}
    >
      {/* Connection handles for edges - hidden but functional */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      {/* Left and right handles need to be targets for spouse connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ opacity: 0, pointerEvents: 'none' }}
      />

      {/* Avatar circle with initials */}
      <div className="flex justify-center mb-1 shrink-0">
        <div className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
          <span className="text-gray-600 font-semibold text-xs select-none">
            {person.firstName[0]}
            {person.lastName[0]}
          </span>
        </div>
      </div>

      {/* Name */}
      <div className="text-center min-w-0 flex-1">
        <div className="text-gray-900 font-semibold text-sm select-none truncate px-1">
          {person.firstName}
        </div>
        <div className="text-gray-700 text-xs select-none truncate px-1">{person.lastName}</div>
      </div>

      {/* Lifespan */}
      <div className="text-center text-gray-500 text-[10px] mt-auto select-none truncate px-1 shrink-0">
        {lifespan}
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const PersonNode = memo(PersonNodeComponent);

export default PersonNode;
