
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
      <Textarea
        id="promptInput"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your game development prompt here (e.g., 'Create a simple 2D platformer player controller script')"
        className="min-h-[140px] bg-secondary/50 border-secondary resize-none focus:border-primary"
        disabled={isProcessing}
      />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {localAI.isAvailable ? (
              <>
                <Cpu className="h-3 w-3 text-green-500" />
                <span>Local AI ({localAI.modelType?.toUpperCase()})</span>
              </>
            ) : (
              <>
                <Cloud className="h-3 w-3 text-orange-500" />
                <span>Gemini API fallback - Consider adding a local model</span>
              </>
            )}
          </div>
          <span className="text-muted-foreground/50">•</span>
          <span>Press <kbd className="px-1 py-0.5 text-xs rounded bg-muted border border-border">Ctrl+Enter</kbd> to submit</span>
        </div>
        <Button 
          id="submitPrompt" 
          onClick={handleSubmit} 
          disabled={isProcessing}
          className="gap-2 h-8 px-3"
          size="sm"
        >
          {isProcessing ? 'Processing...' : 'Generate Code'}
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default PromptInput;
