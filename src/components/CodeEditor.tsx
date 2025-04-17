
import React, { useEffect, useRef } from 'react';
import { CopyIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  code: string;
  isLoading: boolean;
  activeFilename?: string;
  onCodeChange?: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  isLoading, 
  activeFilename = 'game.js',
  onCodeChange 
}) => {
  const codeRef = useRef(code);
  const { toast } = useToast();

  // Update the ref when code prop changes
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  const handleCodeChange = (value: string) => {
    if (onCodeChange) {
      onCodeChange(value);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeRef.current).then(
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
    const file = new Blob([codeRef.current], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = activeFilename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: 'Code downloaded',
      description: `Your code has been downloaded as ${activeFilename}`,
    });
  };

  // Choose language extensions based on file type
  const getLanguageExtension = () => {
    if (activeFilename.endsWith('.html')) {
      return html();
    }
    return javascript();
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
        <span className="text-sm font-medium">{activeFilename}</span>
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
          <CodeMirror
            value={code}
            height="100%"
            theme={oneDark}
            extensions={[getLanguageExtension()]}
            onChange={handleCodeChange}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              foldGutter: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              syntaxHighlighting: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              searchKeymap: true,
              foldKeymap: true,
              completionKeymap: true,
              lintKeymap: true,
            }}
            className="h-full min-h-[calc(100vh-10rem)]"
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default CodeEditor;
