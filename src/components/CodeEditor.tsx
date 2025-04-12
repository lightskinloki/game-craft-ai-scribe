import React, { useEffect, useRef } from 'react';
import { CopyIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface CodeEditorProps {
  code: string;
  isLoading: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, isLoading }) => {
  const codeRef = useRef<HTMLPreElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // In a real implementation, we'd integrate a proper syntax highlighter like Prism.js
    // or a full editor like Monaco/CodeMirror, but for now we'll keep it simple
    if (codeRef.current) {
      // Simple tokenization for demonstration
      const tokens = code.split(/([{}();=])/g);
      codeRef.current.innerHTML = tokens
        .map((token) => {
          if (token.match(/function|return|if|else|for|while|let|const|var/)) {
            return `<span class="token keyword">${token}</span>`;
          } else if (token.match(/[0-9]+/)) {
            return `<span class="token number">${token}</span>`;
          } else if (token.match(/["'`].*?["'`]/)) {
            return `<span class="token string">${token}</span>`;
          } else if (token.match(/[{}();=]/)) {
            return `<span class="token punctuation">${token}</span>`;
          }
          return token;
        })
        .join('');
    }
  }, [code]);

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(
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
    const file = new Blob([code], { type: 'text/plain' });
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
          <Button variant="ghost" size="sm" onClick={copyCode} disabled={!code} title="Copy code">
            <CopyIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadCode} disabled={!code} title="Download code">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-editor-background p-4 font-mono text-sm text-editor-text">
        {code ? (
          <pre ref={codeRef} className="whitespace-pre-wrap">{code}</pre>
        ) : (
          <pre className="text-muted-foreground">// Your game code will appear here...</pre>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
