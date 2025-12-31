import { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { XIcon } from '@phosphor-icons/react';
import { Button } from './Button';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ComponentChildren;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * Reusable Dialog/Modal component
 * Handles overlay, animations, and keyboard events
 */
export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}: DialogProps) {
  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Dialog content */}
      <div
        className={`relative bg-white rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} w-full max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="dialog-title" className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          {showCloseButton && (
            <Button variant="ghost" size="sm" onClick={onClose} ariaLabel="Close dialog">
              <XIcon size={20} weight="bold" />
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export default Dialog;
