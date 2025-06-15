
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isProcessing: boolean;
  disabled?: boolean; // Added 'disabled' prop
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isProcessing, disabled }) => {
  const [prompt, setPrompt] = useState('');
  const { toast } = useToast();

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
    <div className="space-y-3">
      <Textarea
        id="promptInput"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your game development prompt here (e.g., 'Create a simple 2D platformer player controller script')"
        className="min-h-[140px] bg-secondary/50 border-secondary resize-none focus:border-primary"
        disabled={isProcessing || disabled}
      />
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Press <kbd className="px-1 py-0.5 text-xs rounded bg-muted border border-border">Ctrl+Enter</kbd> to submit
        </p>
        <Button 
          id="submitPrompt" 
          onClick={handleSubmit} 
          disabled={isProcessing || disabled}
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
