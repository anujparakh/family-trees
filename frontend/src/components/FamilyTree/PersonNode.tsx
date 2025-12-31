import { format } from 'date-fns';
import { Person } from '../../data/types';

interface PersonNodeProps {
  person: Person;
  isSelected?: boolean;
  onClick?: () => void;
  x: number;
  y: number;
}

/**
 * PersonNode component - renders a single person card in the family tree
 */
export function PersonNode({ person, isSelected = false, onClick, x, y }: PersonNodeProps) {
  const nodeWidth = 140;
  const nodeHeight = 100;

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
      ? 'stroke-blue-500'
      : person.gender === 'female'
        ? 'stroke-pink-500'
        : 'stroke-gray-500';

  const bgColor = isSelected ? 'fill-blue-50' : 'fill-white';

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      className="cursor-pointer"
      data-person-id={person.id}
    >
      {/* Card background */}
      <rect
        width={nodeWidth}
        height={nodeHeight}
        rx={8}
        className={`${bgColor} ${borderColor} stroke-2 hover:stroke-blue-500 transition-colors`}
        style={{ filter: isSelected ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' : 'none' }}
      />

      {/* Avatar circle placeholder */}
      <circle cx={nodeWidth / 2} cy={28} r={18} className="fill-gray-200 stroke-gray-300" />

      {/* Person initials in avatar */}
      <text
        x={nodeWidth / 2}
        y={28}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-gray-600 font-semibold no-select"
        style={{ fontSize: '13px' }}
      >
        {person.firstName[0]}
        {person.lastName[0]}
      </text>

      {/* Name */}
      <text
        x={nodeWidth / 2}
        y={58}
        textAnchor="middle"
        className="fill-gray-900 font-semibold no-select"
        style={{ fontSize: '15px' }}
      >
        {person.firstName}
      </text>

      {/* Last name */}
      <text
        x={nodeWidth / 2}
        y={74}
        textAnchor="middle"
        className="fill-gray-700 no-select"
        style={{ fontSize: '13px' }}
      >
        {person.lastName}
      </text>

      {/* Lifespan */}
      <text
        x={nodeWidth / 2}
        y={nodeHeight - 10}
        textAnchor="middle"
        className="fill-gray-500 no-select"
        style={{ fontSize: '11px' }}
      >
        {lifespan}
      </text>
    </g>
  );
}

export default PersonNode;
