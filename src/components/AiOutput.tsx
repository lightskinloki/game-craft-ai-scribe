
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

interface AiOutputProps {
  explanation: string;
  isLoading: boolean;
}

const AiOutput: React.FC<AiOutputProps> = ({ explanation, isLoading }) => {
  console.log('AiOutput rendering with explanation:', explanation);
  console.log('isLoading:', isLoading);
  console.log('explanation type:', typeof explanation);
  console.log('explanation length:', explanation ? explanation.length : 0);

  if (isLoading) {
    return (
      <div className="p-4 h-full">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-4 bg-secondary rounded w-3/4"></div>
          <div className="h-4 bg-secondary rounded w-1/2"></div>
          <div className="h-4 bg-secondary rounded w-5/6"></div>
          <div className="h-4 bg-secondary rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
        <Info className="h-12 w-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">AI Explanation</h3>
        <p className="text-sm max-w-md">
          Submit a prompt to receive an explanation of the game development concepts and code changes needed.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4 space-y-4" id="aiOutput" data-testid="aiOutput">
        <h3 className="font-semibold text-lg">AI Explanation</h3>
        <Separator className="my-2" />
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <CodeBlock
                    language={match[1]}
                    value={String(children).replace(/\n$/, '')}
                    {...props}
                  />
                ) : (
                  <code className="px-1 py-0.5 rounded bg-secondary" {...props}>
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-4 leading-relaxed">{children}</p>;
              },
              h1({ children }) {
                return <h1 className="text-2xl font-bold my-4">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-xl font-bold my-3">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-lg font-bold my-2">{children}</h3>;
              },
              ul({ children }) {
                return <ul className="list-disc pl-6 mb-4">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-6 mb-4">{children}</ol>;
              },
              li({ children }) {
                return <li className="mb-1">{children}</li>;
              },
              blockquote({ children }) {
                return <blockquote className="border-l-4 border-primary pl-4 italic my-4">{children}</blockquote>;
              }
            }}
          >
            {explanation}
          </ReactMarkdown>
        </div>
      </div>
    </ScrollArea>
  );
};

export default AiOutput;
