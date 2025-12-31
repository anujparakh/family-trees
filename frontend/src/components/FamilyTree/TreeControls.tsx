import { PlusIcon, MinusIcon, FrameCornersIcon } from '@phosphor-icons/react';
import { Button } from '../ui';

interface TreeControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

/**
 * TreeControls - Zoom and pan controls for the tree
 */
export function TreeControls({ onZoomIn, onZoomOut, onReset }: TreeControlsProps) {
  return (
    <div
      className="absolute bottom-4 right-4 z-50 flex flex-col gap-2"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Zoom in */}
      <Button variant="icon" onClick={onZoomIn} ariaLabel="Zoom in">
        <PlusIcon size={24} weight="bold" />
      </Button>

      {/* Zoom out */}
      <Button variant="icon" onClick={onZoomOut} ariaLabel="Zoom out">
        <MinusIcon size={24} weight="bold" />
      </Button>

      {/* Fit view */}
      <Button variant="icon" onClick={onReset} ariaLabel="Fit to view">
        <FrameCornersIcon size={24} weight="bold" />
      </Button>
    </div>
  );
}

export default TreeControls;
