import { memo } from 'preact/compat';
import { Dialog } from '@/components/ui';
import { Button } from '@/components/ui';

interface HowToDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Dialog showing navigation instructions for the family tree
 */
function HowToDialogComponent({ isOpen, onClose }: HowToDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="How to Navigate" maxWidth="md">
      <div className="space-y-4 text-text-secondary">
        <div>
          <h3 className="font-semibold text-text-primary mb-1">Moving Around</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Click and drag anywhere to pan the tree</li>
            <li>Use your mouse wheel or trackpad to scroll</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-text-primary mb-1">Zooming</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              Hold <kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded text-xs font-mono">Ctrl</kbd>{' '}
              (or <kbd className="px-1.5 py-0.5 bg-bg-tertiary rounded text-xs font-mono">Cmd</kbd> on
              Mac) and scroll to zoom
            </li>
            <li>
              Use the <strong>+</strong>, <strong>-</strong> and fit view buttons in the top-right
              corner
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-text-primary mb-1">Mobile & Touch</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Drag with one finger to pan</li>
            <li>Pinch with two fingers to zoom in and out</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-text-primary mb-1">View / Edit</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Tap on a person to view more details</li>
            <li>(coming soon) Click the edit icon to edit details</li>
            <li>(coming soon) Click the add button to add a new member</li>
          </ul>
        </div>

        <Button onClick={onClose} variant="primary" className="w-full mt-6">
          Got it!
        </Button>
      </div>
    </Dialog>
  );
}

export const HowToDialog = memo(HowToDialogComponent);

export default HowToDialog;
