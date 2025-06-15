
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AiOutputProps {
  output: string;
  isLoading: boolean;
}

const AiOutput: React.FC<AiOutputProps> = ({ output, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-secondary/50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Generating code...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!output) {
    return (
      <Card className="bg-secondary/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            AI output will appear here after you submit a prompt.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary/50">
      <CardContent className="p-4">
        <pre className="text-sm whitespace-pre-wrap font-mono bg-background p-3 rounded border overflow-x-auto">
          {output}
        </pre>
      </CardContent>
    </Card>
  );
};

export default AiOutput;
