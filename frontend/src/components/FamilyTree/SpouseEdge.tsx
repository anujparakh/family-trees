import { memo } from 'preact/compat';
import { EdgeProps, getStraightPath } from 'reactflow';

/**
 * Custom edge for spouse/partner connections
 * Shows a horizontal line between spouses
 */
function SpouseEdgeComponent({ sourceX, sourceY, targetX, targetY }: EdgeProps) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <path
      d={edgePath}
      stroke="rgb(var(--color-border-secondary))"
      strokeWidth={2}
      fill="none"
      className="react-flow__edge-path"
    />
  );
}

export const SpouseEdge = memo(SpouseEdgeComponent);

export default SpouseEdge;
