
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { FileChange } from '@/utils/codeChangeParser';
import ReadOnlyCodeSnippet from './ReadOnlyCodeSnippet';

interface FileChangePreviewProps {
  fileChange: FileChange;
  existingCode?: string;
  onApply: (filename: string) => void;
  onSkip: (filename: string) => void;
  isApplying?: boolean;
}

export const FileChangePreview: React.FC<FileChangePreviewProps> = ({
  fileChange,
  existingCode,
  onApply,
  onSkip,
  isApplying = false
}) => {
  const getActionIcon = () => {
    switch (fileChange.action) {
      case 'create':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return <FileIcon className="h-4 w-4" />;
    }
  };

  const getActionColor = () => {
    switch (fileChange.action) {
      case 'create':
        return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'update':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'delete':
        return 'bg-red-500/10 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileIcon className="h-5 w-5" />
            <span className="font-mono text-sm">{fileChange.filename}</span>
          </CardTitle>
          <Badge className={getActionColor()}>
            <div className="flex items-center gap-1">
              {getActionIcon()}
              {fileChange.action.toUpperCase()}
            </div>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Before/After comparison for updates */}
        {fileChange.action === 'update' && existingCode && (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Current Code:</h4>
              <ScrollArea className="h-32 border rounded">
                <ReadOnlyCodeSnippet
                  language="javascript"
                  value={existingCode}
                />
              </ScrollArea>
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Proposed Changes:</h4>
              <ScrollArea className="h-32 border rounded">
                <ReadOnlyCodeSnippet
                  language={fileChange.codeBlocks[0]?.language || 'javascript'}
                  value={fileChange.newCode}
                />
              </ScrollArea>
            </div>
          </div>
        )}

        {/* New file content */}
        {fileChange.action === 'create' && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">New File Content:</h4>
            <ScrollArea className="h-40 border rounded">
              <ReadOnlyCodeSnippet
                language={fileChange.codeBlocks[0]?.language || 'javascript'}
                value={fileChange.newCode}
              />
            </ScrollArea>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onApply(fileChange.filename)}
            disabled={isApplying}
            size="sm"
            className="flex-1"
          >
            {isApplying ? 'Applying...' : `Apply ${fileChange.action}`}
          </Button>
          <Button
            onClick={() => onSkip(fileChange.filename)}
            disabled={isApplying}
            variant="outline"
            size="sm"
          >
            Skip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileChangePreview;
