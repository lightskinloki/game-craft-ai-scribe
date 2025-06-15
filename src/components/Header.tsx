
import React from 'react';
import { Code, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onSaveProject: () => Promise<void>;
  onExportProject: () => Promise<void>;
}

const Header = ({ onSaveProject, onExportProject }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Code className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">GameCraft AI</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-md font-medium border border-primary/20">
            Local-First
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 h-8 px-3 text-xs"
          onClick={onSaveProject}
        >
          <Save className="h-3 w-3" />
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 h-8 px-3 text-xs"
          onClick={onExportProject}
        >
          <Download className="h-3 w-3" />
          Export
        </Button>
      </div>
    </header>
  );
};

export default Header;
