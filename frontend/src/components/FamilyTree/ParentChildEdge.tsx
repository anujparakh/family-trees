import { memo } from 'preact/compat';
import { EdgeProps } from 'reactflow';

/**
 * Custom edge for parent-child connections
 * Uses straight orthogonal routing for clean T-junction appearance
 */
function ParentChildEdgeComponent({ sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  // Get positions from edge data
  const junctionY = data?.junctionY || sourceY + (targetY - sourceY) / 2;
  const startX = data?.midpointX || sourceX; // X position at center of spouse pair
  const startY = data?.spouseEdgeY || sourceY; // Y position at spouse edge level

  // Create orthogonal path: down from spouse edge center, across, down to target
  const path = `
    M ${startX} ${startY}
    L ${startX} ${junctionY}
    L ${targetX} ${junctionY}
    L ${targetX} ${targetY}
  `;

  return (
    <path
      d={path}
      stroke="#94A3B8"
      strokeWidth={2}
      fill="none"
      className="react-flow__edge-path"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

export const ParentChildEdge = memo(ParentChildEdgeComponent);

export default ParentChildEdge;
