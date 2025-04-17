
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Terminal, AlertTriangle, XCircle, Trash2 } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
}

interface ConsoleOutputProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ logs, onClearLogs }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [logs]);

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Terminal className="h-4 w-4 text-gray-400" />;
    }
  };

  const getLogStyle = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      default:
        return 'text-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-secondary/50">
      <div className="flex items-center justify-between p-2 bg-secondary border-b border-border">
        <span className="text-sm font-medium">Console Output</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={onClearLogs}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1"
      >
        <div className="p-2 space-y-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-2 text-sm font-mono whitespace-pre-wrap ${getLogStyle(log.level)}`}
            >
              <span className="mt-1">{getLogIcon(log.level)}</span>
              <div className="flex-1">
                <span className="opacity-50 mr-2">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                {log.message}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConsoleOutput;
