
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileChangePreview } from './FileChangePreview';
import { ParsedChanges, FileChange } from '@/utils/codeChangeParser';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface ChangeApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parsedChanges: ParsedChanges;
  existingFiles: { [filename: string]: string };
  onApplyChanges: (selectedChanges: FileChange[]) => Promise<void>;
}

type ApplicationStatus = 'pending' | 'applying' | 'success' | 'error';

interface FileStatus {
  filename: string;
  status: ApplicationStatus;
  error?: string;
}

export const ChangeApplicationDialog: React.FC<ChangeApplicationDialogProps> = ({
  isOpen,
  onClose,
  parsedChanges,
  existingFiles,
  onApplyChanges
}) => {
  const [fileStatuses, setFileStatuses] = useState<Map<string, FileStatus>>(
    new Map(parsedChanges.fileChanges.map(change => [
      change.filename,
      { filename: change.filename, status: 'pending' as ApplicationStatus }
    ]))
  );
  const [isApplying, setIsApplying] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(
    new Set(parsedChanges.fileChanges.map(change => change.filename))
  );

  const handleApplyFile = async (filename: string) => {
    const fileChange = parsedChanges.fileChanges.find(c => c.filename === filename);
    if (!fileChange) return;

    setFileStatuses(prev => new Map(prev.set(filename, {
      filename,
      status: 'applying'
    })));

    try {
      await onApplyChanges([fileChange]);
      setFileStatuses(prev => new Map(prev.set(filename, {
        filename,
        status: 'success'
      })));
    } catch (error) {
      setFileStatuses(prev => new Map(prev.set(filename, {
        filename,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })));
    }
  };

  const handleSkipFile = (filename: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(filename);
      return newSet;
    });
  };

  const handleApplyAll = async () => {
    setIsApplying(true);
    const selectedChanges = parsedChanges.fileChanges.filter(
      change => selectedFiles.has(change.filename)
    );

    try {
      await onApplyChanges(selectedChanges);
      onClose();
    } catch (error) {
      console.error('Error applying changes:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'applying':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Apply AI Code Changes</DialogTitle>
          <DialogDescription>
            {parsedChanges.description}
          </DialogDescription>
          <div className="flex gap-2 pt-2">
            <Badge variant="outline">
              {parsedChanges.fileChanges.length} file{parsedChanges.fileChanges.length !== 1 ? 's' : ''} affected
            </Badge>
            <Badge variant="outline">
              {selectedFiles.size} selected
            </Badge>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {parsedChanges.fileChanges.map((fileChange, index) => (
              <div key={`${fileChange.filename}-${index}`} className="relative">
                <div className="absolute top-4 right-4 z-10">
                  {getStatusIcon(fileStatuses.get(fileChange.filename)?.status || 'pending')}
                </div>
                <FileChangePreview
                  fileChange={fileChange}
                  existingCode={existingFiles[fileChange.filename]}
                  onApply={handleApplyFile}
                  onSkip={handleSkipFile}
                  isApplying={fileStatuses.get(fileChange.filename)?.status === 'applying'}
                />
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isApplying}>
            Cancel
          </Button>
          <Button
            onClick={handleApplyAll}
            disabled={isApplying || selectedFiles.size === 0}
          >
            {isApplying ? 'Applying Changes...' : `Apply ${selectedFiles.size} Change${selectedFiles.size !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeApplicationDialog;
