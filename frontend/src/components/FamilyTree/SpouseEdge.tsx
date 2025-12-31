import { memo } from 'preact/compat';
import { EdgeProps, getStraightPath } from 'reactflow';

/**
 * Custom edge for spouse/partner connections
 * Shows a heart icon in the middle
 */
function SpouseEdgeComponent({ sourceX, sourceY, targetX, targetY }: EdgeProps) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return <path d={edgePath} stroke="#94A3B8" strokeWidth={1} fill="none" className="" />;
}

export const SpouseEdge = memo(SpouseEdgeComponent);

export default SpouseEdge;
