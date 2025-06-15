
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Code, Gamepad2 } from 'lucide-react';
import { EditorMode } from '@/services/aiService';

interface AiOutputProps {
  output: string;
  isLoading: boolean;
  mode?: EditorMode;
}

const AiOutput: React.FC<AiOutputProps> = ({ output, isLoading, mode = 'general' }) => {
  const getIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    return mode === 'phaser' ? <Gamepad2 className="h-4 w-4" /> : <Code className="h-4 w-4" />;
  };

  const getTitle = () => {
    if (isLoading) return 'Generating...';
    return mode === 'phaser' ? 'Phaser Code Generated' : 'Code Generated';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {getIcon()}
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>AI is generating {mode === 'phaser' ? 'Phaser' : 'general'} code...</span>
          </div>
        ) : output ? (
          <pre className="text-xs bg-secondary/50 p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
            <code>{output}</code>
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">
            No code generated yet. Enter a prompt above to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AiOutput;
