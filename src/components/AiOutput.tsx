
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import ReadOnlyCodeSnippet from './ReadOnlyCodeSnippet';

interface AiOutputProps {
  explanation: string;
  isLoading: boolean;
}

const AiOutput: React.FC<AiOutputProps> = ({ explanation, isLoading }) => {
  console.log('AiOutput rendering with explanation:', explanation);
  console.log('isLoading:', isLoading);
  console.log('explanation type:', typeof explanation);
  console.log('explanation length:', explanation ? explanation.length : 0);

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
    <ScrollArea className="h-full w-full">
      <div className="p-4 space-y-4" id="aiOutput" data-testid="aiOutput">
        <h3 className="font-semibold text-lg">AI Explanation</h3>
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
  );
};

export default AiOutput;
