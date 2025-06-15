
import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Info, Code, Wand2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import ReadOnlyCodeSnippet from './ReadOnlyCodeSnippet';
import ChangeApplicationDialog from './ChangeApplicationDialog';
import { parseAIResponse, ParsedChanges, FileChange } from '@/utils/codeChangeParser';
import { fileUpdateEngine } from '@/utils/fileUpdateEngine';
import { useToast } from '@/components/ui/use-toast';

interface AiOutputProps {
  explanation: string;
  isLoading: boolean;
  currentFiles?: { [filename: string]: string };
  onFilesChange?: (files: { [filename: string]: string }) => void;
}

const AiOutput: React.FC<AiOutputProps> = ({ 
  explanation, 
  isLoading, 
  currentFiles = {},
  onFilesChange 
}) => {
  const [parsedChanges, setParsedChanges] = useState<ParsedChanges | null>(null);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const { toast } = useToast();

  // Parse AI response for code changes
  useEffect(() => {
    if (explanation && !isLoading) {
      const changes = parseAIResponse(explanation);
      setParsedChanges(changes);
    } else {
      setParsedChanges(null);
    }
  }, [explanation, isLoading]);

  const handleApplyChanges = async (selectedChanges: FileChange[]) => {
    if (!onFilesChange) {
      toast({
        title: "Cannot Apply Changes",
        description: "File update functionality not available in current context",
        variant: "destructive",
      });
      return;
    }

    const results = [];
    
    for (const change of selectedChanges) {
      const result = await fileUpdateEngine.applyFileChange(
        change.filename,
        change.newCode,
        currentFiles,
        onFilesChange
      );
      results.push(result);
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    if (successful > 0) {
      toast({
        title: "Changes Applied",
        description: `Successfully applied ${successful} change${successful !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}`,
      });
    }

    if (failed > 0) {
      toast({
        title: "Some Changes Failed",
        description: `${failed} change${failed !== 1 ? 's' : ''} could not be applied. Check console for details.`,
        variant: "destructive",
      });
    }
  };

  console.log('AiOutput rendering with explanation:', explanation);
  console.log('isLoading:', isLoading);
  console.log('parsedChanges:', parsedChanges);

  if (isLoading) {
    return (
      <div className="p-4 h-full">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-secondary rounded w-3/4"></div>
          <div className="h-4 bg-secondary rounded w-1/2"></div>
          <div className="h-4 bg-secondary rounded w-5/6"></div>
          <div className="h-4 bg-secondary rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
        <Info className="h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">AI Explanation</h3>
        <p className="text-sm max-w-md">
          Submit a prompt to receive an explanation of the game development concepts and code changes needed.
        </p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-full w-full">
        <div className="p-4 space-y-4" id="aiOutput" data-testid="aiOutput">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">AI Explanation</h3>
            {parsedChanges?.hasChanges && (
              <Button
                onClick={() => setShowChangeDialog(true)}
                size="sm"
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Apply Code Changes
              </Button>
            )}
          </div>
          
          {parsedChanges?.hasChanges && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Code className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Code changes detected - {parsedChanges.fileChanges.length} file{parsedChanges.fileChanges.length !== 1 ? 's' : ''} affected
                </span>
              </div>
            </div>
          )}
          
          <Separator className="my-2" />
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                code({ className, children }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  
                  if (match) {
                    return (
                      <ReadOnlyCodeSnippet
                        language={match[1]}
                        value={codeString}
                      />
                    );
                  }
                  
                  // For inline code
                  return (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  );
                }
              }}
            >
              {explanation}
            </ReactMarkdown>
          </div>
        </div>
      </ScrollArea>

      {parsedChanges && (
        <ChangeApplicationDialog
          isOpen={showChangeDialog}
          onClose={() => setShowChangeDialog(false)}
          parsedChanges={parsedChanges}
          existingFiles={currentFiles}
          onApplyChanges={handleApplyChanges}
        />
      )}
    </>
  );
};

export default AiOutput;
