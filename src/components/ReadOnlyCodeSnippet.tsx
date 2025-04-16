
import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Check } from 'lucide-react';

interface ReadOnlyCodeSnippetProps {
  language: string;
  value: string;
}

const ReadOnlyCodeSnippet: React.FC<ReadOnlyCodeSnippetProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Code has been copied to your clipboard",
        duration: 2000
      });
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative group my-4 rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <span className="text-xs text-muted-foreground">
          {language || 'plain text'}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="ml-2 text-xs">{copied ? 'Copied' : 'Copy'}</span>
        </Button>
      </div>
      <CodeMirror
        value={value}
        height="auto"
        theme={oneDark}
        extensions={[javascript()]}
        editable={false}
        readOnly={true}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLineGutter: false,
          highlightSpecialChars: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          highlightActiveLine: false,
          highlightSelectionMatches: false,
        }}
      />
    </div>
  );
};

export default ReadOnlyCodeSnippet;
