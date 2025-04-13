
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AiOutputProps {
  explanation: string;
  isLoading: boolean;
}

const AiOutput: React.FC<AiOutputProps> = ({ explanation, isLoading }) => {
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
          Submit a prompt to receive an explanation of the generated code and game development concepts.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4 space-y-4" id="aiOutput">
        <h3 className="font-semibold text-lg">AI Explanation</h3>
        <Separator className="my-2" />
        <div className="whitespace-pre-wrap text-sm">
          {explanation}
        </div>
      </div>
    </ScrollArea>
  );
};

export default AiOutput;
