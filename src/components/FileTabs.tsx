
import React from 'react';
import { FileCode, FileText, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
    <div className="flex bg-secondary/50 px-4 py-2 border-b border-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            {getFileIcon(activeFilename)}
            {activeFilename}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {filenames.map(filename => (
            <DropdownMenuItem
              key={filename}
              onClick={() => onSelectFile(filename)}
              className="flex items-center gap-2"
            >
              {getFileIcon(filename)}
              {filename}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FileTabs;
