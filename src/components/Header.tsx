
import React from 'react';
import { Code, Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary">
      <div className="flex items-center space-x-2">
        <Code className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight">GameCraft AI</h1>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Powered by</span>
        <Sparkles className="h-4 w-4 text-primary animate-pulse-subtle" />
        <span className="font-semibold">Gemini</span>
      </div>
    </header>
  );
};

export default Header;
