
import React, { useEffect, useRef, useState } from 'react';
import { CopyIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CodeEditorProps {
  code: string;
  isLoading: boolean;
  onCodeChange?: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, isLoading, onCodeChange }) => {
  const [editorContent, setEditorContent] = useState(code);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Update local state when code prop changes
  useEffect(() => {
    if (code && code !== editorContent) {
      setEditorContent(code);
    }
  }, [code]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setEditorContent(newCode);
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(editorContent).then(
      () => {
        toast({
          title: 'Code copied!',
          description: 'The code has been copied to your clipboard.',
        });
      },
      () => {
        toast({
          title: 'Failed to copy',
          description: 'Could not copy code to clipboard.',
          variant: 'destructive',
        });
      }
    );
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([editorContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'gamecode.js';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: 'Code downloaded',
      description: 'Your code has been downloaded as gamecode.js',
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex-1 p-4 bg-editor-background rounded-md">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-secondary/30 rounded w-1/4"></div>
          <div className="h-4 bg-secondary/30 rounded w-1/2"></div>
          <div className="h-4 bg-secondary/30 rounded w-3/4"></div>
          <div className="h-4 bg-secondary/30 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" id="codeEditor">
      <div className="flex items-center justify-between p-2 bg-secondary">
        <span className="text-sm font-medium">game.js</span>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={copyCode} title="Copy code">
            <CopyIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadCode} title="Download code">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 h-full bg-editor-background">
        <div className="p-4 h-full">
          <textarea
            ref={codeRef}
            value={editorContent}
            onChange={handleCodeChange}
            className="w-full h-full min-h-[calc(100vh-10rem)] font-mono text-sm text-editor-text bg-transparent border-none resize-none focus:outline-none"
            spellCheck="false"
            placeholder="// You can write or paste your game code here..."
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default CodeEditor;
