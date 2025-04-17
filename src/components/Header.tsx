
import React from 'react';
import { Code, Sparkles, Save, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onSaveProject: () => Promise<void>;
  onLoadProject: () => Promise<void>;
}

const Header = ({ onSaveProject, onLoadProject }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary">
      <div className="flex items-center space-x-2">
        <Code className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">GameCraft AI</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={onSaveProject}
        >
          <Save className="h-4 w-4" />
          Save Project
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={onLoadProject}
        >
          <FolderOpen className="h-4 w-4" />
          Load Project
        </Button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Powered by</span>
          <Sparkles className="h-4 w-4 text-primary animate-pulse-subtle" />
          <span className="font-semibold">Gemini</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
