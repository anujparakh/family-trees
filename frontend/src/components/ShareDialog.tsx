import { useState } from 'preact/hooks';
import { Dialog, Button } from '@/components/ui';
import { LinkIcon, DownloadIcon, CheckIcon } from '@phosphor-icons/react';
import { downloadGEDCOM } from '@/utils/gedcomExport';
import type { FamilyTree } from '@/data/types';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tree: FamilyTree;
}

/**
 * Share dialog with copy link and GEDCOM export functionality
 */
export function ShareDialog({ isOpen, onClose, tree }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleExportGEDCOM = () => {
    downloadGEDCOM(tree);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Share Family Tree" maxWidth="sm">
      <div className="space-y-4 py-4">
        {/* Copy Link Section */}
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-2">Share Link</h3>
          <p className="text-sm text-text-secondary mb-3">
            Copy the link to share this family tree with others.
          </p>
          <Button
            variant="primary"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <CheckIcon size={18} weight="bold" />
                Link Copied!
              </>
            ) : (
              <>
                <LinkIcon size={18} weight="regular" />
                Copy Link
              </>
            )}
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t border-border-primary" />

        {/* Export GEDCOM Section */}
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-2">Export as GEDCOM</h3>
          <p className="text-sm text-text-secondary mb-3">
            Download your family tree in GEDCOM format, compatible with most genealogy software.
          </p>
          <Button
            variant="secondary"
            onClick={handleExportGEDCOM}
            className="w-full flex items-center justify-center gap-2 bg-accent-tertiary !text-white"
          >
            <DownloadIcon size={18} weight="regular" />
            Export as GEDCOM
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

export default ShareDialog;
