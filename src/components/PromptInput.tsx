
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ELI5Toggle from './ELI5Toggle';
import { useELI5Mode } from '@/hooks/useELI5Mode';
import { generateELI5Prompt } from '@/utils/eli5Templates';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isProcessing: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isProcessing }) => {
  const [prompt, setPrompt] = useState('');
  const { toast } = useToast();
  const { isELI5Mode, toggleELI5Mode } = useELI5Mode();

  const handleSubmit = () => {
    if (!prompt.trim()) {
      toast({
        title: 'Empty prompt',
        description: 'Please enter a prompt before submitting.',
        variant: 'destructive'
      });
      return;
    }
    
    // Generate ELI5 prompt if mode is enabled
    const finalPrompt = generateELI5Prompt(prompt, isELI5Mode);
    onSubmit(finalPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        id="promptInput"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isELI5Mode 
          ? "Ask me anything about game development - I'll explain it simply! (e.g., 'How do I make a character jump?')"
          : "Enter your game development prompt here (e.g., 'Create a simple 2D platformer player controller script')"
        }
        className="min-h-[140px] bg-secondary/50 border-secondary resize-none focus:border-primary"
        disabled={isProcessing}
      />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 text-xs rounded bg-muted border border-border">Ctrl+Enter</kbd> to submit
          </p>
          <ELI5Toggle 
            isELI5Mode={isELI5Mode} 
            onToggle={toggleELI5Mode}
          />
        </div>
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
