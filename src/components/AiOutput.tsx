
import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Info, Code, Wand2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import ReadOnlyCodeSnippet from './ReadOnlyCodeSnippet';
import ChangeApplicationDialog from './ChangeApplicationDialog';
import LoadingState from './LoadingState';
import { parseAIResponse, ParsedChanges, FileChange } from '@/utils/codeChangeParser';
import { fileUpdateEngine } from '@/utils/fileUpdateEngine';
import { useToast } from '@/components/ui/use-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface AiOutputProps {
  explanation: string;
  isLoading: boolean;
  currentFiles?: { [filename: string]: string };
  onFilesChange?: (files: { [filename: string]: string }) => void;
  error?: string | null;
}

const AiOutput: React.FC<AiOutputProps> = ({ 
  explanation, 
  isLoading, 
  currentFiles = {},
  onFilesChange,
  error 
}) => {
  const [parsedChanges, setParsedChanges] = useState<ParsedChanges | null>(null);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  // Parse AI response for code changes
  useEffect(() => {
    if (explanation && !isLoading && !error) {
      try {
        const changes = parseAIResponse(explanation);
        setParsedChanges(changes);
      } catch (parseError) {
        handleError(parseError as Error, { context: 'ai_response_parsing' });
        setParsedChanges(null);
      }
    } else {
      setParsedChanges(null);
    }
  }, [explanation, isLoading, error, handleError]);

  const handleApplyChanges = async (selectedChanges: FileChange[]) => {
    if (!onFilesChange) {
      const errorMsg = "File update functionality not available in current context";
      handleError(errorMsg, { context: 'file_changes_application' });
      return;
    }

    try {
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
        const failedResults = results.filter(r => !r.success);
        handleError('Some changes failed to apply', { 
          context: 'partial_change_failure',
          failedChanges: failedResults 
        });
      }
    } catch (applyError) {
      handleError(applyError as Error, { context: 'changes_application' });
    }
  };

  console.log('AiOutput rendering with explanation:', explanation);
  console.log('isLoading:', isLoading);
  console.log('error:', error);
  console.log('parsedChanges:', parsedChanges);

  // Show loading state with error handling
  if (isLoading || error) {
    return (
      <LoadingState
        isLoading={isLoading}
        error={error}
        title="Generating AI Response"
        description="Please wait while the AI processes your request..."
        onRetry={() => window.location.reload()}
      />
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
