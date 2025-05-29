
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Cpu, Cloud } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLocalAI } from '@/hooks/useLocalAI';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isProcessing: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isProcessing }) => {
  const [prompt, setPrompt] = useState('');
  const { toast } = useToast();
  const localAI = useLocalAI();

  const handleSubmit = () => {
    if (!prompt.trim()) {
      toast({
        title: 'Empty prompt',
        description: 'Please enter a prompt before submitting.',
        variant: 'destructive'
      });
      return;
    }
    
    onSubmit(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        {localAI.isAvailable ? (
          <>
            <Cpu className="h-3 w-3 text-green-500" />
            <span>Using local AI model ({localAI.modelType?.toUpperCase()})</span>
          </>
        ) : (
          <>
            <Cloud className="h-3 w-3 text-orange-500" />
            <span>Will use Gemini API fallback - Consider adding a local model</span>
          </>
        )}
      </div>
      <Textarea
        id="promptInput"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your game development prompt here (e.g., 'Create a simple 2D platformer player controller script')"
        className="min-h-[120px] bg-secondary/50 border-secondary resize-none focus:border-primary"
        disabled={isProcessing}
      />
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Press <kbd className="px-1 py-0.5 text-xs rounded bg-muted border border-border">Ctrl+Enter</kbd> to submit
        </p>
        <Button 
          id="submitPrompt" 
          onClick={handleSubmit} 
          disabled={isProcessing}
          className="gap-2"
        >
          {isProcessing ? 'Processing...' : 'Generate Code'}
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PromptInput;
