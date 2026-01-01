import { Dialog } from '@/components/ui';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orientation: 'vertical' | 'horizontal';
  onOrientationChange: (orientation: 'vertical' | 'horizontal') => void;
}

/**
 * Settings dialog for tree configuration
 * Currently supports orientation toggle, extensible for future settings
 */
export function SettingsDialog({
  isOpen,
  onClose,
  orientation,
  onOrientationChange,
}: SettingsDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Settings" maxWidth="sm">
      <div className="space-y-6">
        {/* Tree Orientation Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Tree Orientation</h3>
          <div className="space-y-2">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="orientation"
                value="vertical"
                checked={orientation === 'vertical'}
                onChange={() => onOrientationChange('vertical')}
                className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">Vertical</div>
                <div className="text-xs text-gray-500">Ancestors at top, descendants below</div>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="orientation"
                value="horizontal"
                checked={orientation === 'horizontal'}
                onChange={() => onOrientationChange('horizontal')}
                className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">Horizontal</div>
                <div className="text-xs text-gray-500">Ancestors at left, descendants right</div>
              </div>
            </label>
          </div>
        </div>

        {/* Future settings sections can be added here */}
        {/* Example:
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Display Options</h3>
          ...
        </div>
        */}
      </div>
    </Dialog>
  );
}

export default SettingsDialog;
