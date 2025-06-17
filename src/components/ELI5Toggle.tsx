
import React from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Brain, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ELI5ToggleProps {
  isELI5Mode: boolean;
  onToggle: (enabled: boolean) => void;
}

const ELI5Toggle: React.FC<ELI5ToggleProps> = ({ isELI5Mode, onToggle }) => {
  const { toast } = useToast();

  const handleToggle = (pressed: boolean) => {
    onToggle(pressed);
    
    toast({
      title: pressed ? 'ELI5 Mode Enabled' : 'Expert Mode Enabled',
      description: pressed 
        ? 'AI will now explain things like you\'re 5 years old!' 
        : 'AI will provide detailed technical explanations.',
      duration: 2000,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {isELI5Mode ? 'Simple' : 'Expert'}
      </span>
      <Toggle
        pressed={isELI5Mode}
        onPressedChange={handleToggle}
        aria-label="Toggle ELI5 mode"
        className="data-[state=on]:bg-green-100 data-[state=on]:text-green-700 dark:data-[state=on]:bg-green-900 dark:data-[state=on]:text-green-300"
      >
        {isELI5Mode ? (
          <GraduationCap className="h-4 w-4" />
        ) : (
          <Brain className="h-4 w-4" />
        )}
      </Toggle>
    </div>
  );
};

export default ELI5Toggle;
