interface TreeIconProps {
  size?: number;
  className?: string;
}

/**
 * Custom Tree icon for the app
 * Represents a family tree structure
 */
export function TreeIcon({ size = 24, className = '' }: TreeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Tree structure */}
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Top generation - single node */}
        <circle cx="12" cy="4" r="2" fill="currentColor" />

        {/* Connection line down */}
        <line x1="12" y1="6" x2="12" y2="10" />

        {/* Middle generation - two nodes */}
        <circle cx="8" cy="12" r="2" fill="currentColor" />
        <circle cx="16" cy="12" r="2" fill="currentColor" />

        {/* Horizontal connection */}
        <line x1="10" y1="12" x2="14" y2="12" />

        {/* Vertical connection from parent */}
        <line x1="12" y1="10" x2="12" y2="12" />

        {/* Bottom generation - three nodes */}
        <circle cx="6" cy="20" r="2" fill="currentColor" />
        <circle cx="12" cy="20" r="2" fill="currentColor" />
        <circle cx="18" cy="20" r="2" fill="currentColor" />

        {/* Connections to bottom generation */}
        <line x1="8" y1="14" x2="8" y2="16" />
        <line x1="8" y1="16" x2="6" y2="18" />
        <line x1="8" y1="16" x2="12" y2="18" />

        <line x1="16" y1="14" x2="16" y2="16" />
        <line x1="16" y1="16" x2="18" y2="18" />
      </g>
    </svg>
  );
}

export default TreeIcon;
