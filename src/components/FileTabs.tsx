
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileCode, FileText } from 'lucide-react';

interface FileTabsProps {
  filenames: string[];
  activeFilename: string;
  onSelectFile: (filename: string) => void;
}

const FileTabs: React.FC<FileTabsProps> = ({ 
  filenames, 
  activeFilename, 
  onSelectFile 
}) => {
  // Helper function to get appropriate icon based on filename
  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.html')) return <FileText className="mr-2 h-4 w-4" />;
    if (filename.endsWith('.js')) return <FileCode className="mr-2 h-4 w-4" />;
    return <FileText className="mr-2 h-4 w-4" />;
  };

  return (
    <div className="flex bg-secondary/50 px-2 pt-2 border-b border-border overflow-x-auto">
      {filenames.map(filename => (
        <Button
          key={filename}
          variant={activeFilename === filename ? "default" : "ghost"}
          className={`
            rounded-b-none px-4 py-2 h-9 text-sm font-medium 
            ${activeFilename === filename ? 'bg-background' : ''}
          `}
          onClick={() => onSelectFile(filename)}
        >
          {getFileIcon(filename)}
          {filename}
        </Button>
      ))}
    </div>
  );
};

export default FileTabs;
