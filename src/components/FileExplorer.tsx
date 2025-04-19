
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Trash, FileIcon, FileCode, File } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileExplorerProps {
  files: { [filename: string]: string };
  activeFilename: string;
  onSelectFile: (filename: string) => void;
  onCreateFile: (filename: string) => void;
  onDeleteFile: (filename: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFilename,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
}) => {
  const [newFilename, setNewFilename] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the filename
    if (!newFilename.trim()) {
      toast({
        title: "Invalid filename",
        description: "Please enter a filename",
        variant: "destructive",
      });
      return;
    }
    
    // Add .js extension if not present
    let filename = newFilename.trim();
    if (!filename.endsWith('.js')) {
      filename += '.js';
    }
    
    // Check if file already exists
    if (files[filename]) {
      toast({
        title: "File already exists",
        description: `A file named "${filename}" already exists`,
        variant: "destructive",
      });
      return;
    }
    
    // Cannot create an index.html file
    if (filename.toLowerCase() === 'index.html') {
      toast({
        title: "Reserved filename",
        description: "Cannot create a file named 'index.html'",
        variant: "destructive",
      });
      return;
    }
    
    // Create the file
    onCreateFile(filename);
    setNewFilename('');
    setIsCreateDialogOpen(false);
    
    toast({
      title: "File created",
      description: `Created new file: ${filename}`,
    });
  };

  const confirmDelete = (filename: string) => {
    setFileToDelete(filename);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (fileToDelete) {
      onDeleteFile(fileToDelete);
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
      
      toast({
        title: "File deleted",
        description: `Deleted file: ${fileToDelete}`,
      });
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.html')) return <FileCode className="h-4 w-4 mr-2" />;
    if (filename.endsWith('.js')) return <FileIcon className="h-4 w-4 mr-2" />;
    return <File className="h-4 w-4 mr-2" />;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 bg-secondary">
        <span className="text-sm font-medium">Files</span>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-auto h-8 gap-1">
              <Plus className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:text-xs">Add File</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new JavaScript file</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Input
                    id="filename"
                    placeholder="Enter filename (e.g., Player.js)"
                    value={newFilename}
                    onChange={(e) => setNewFilename(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {Object.keys(files).map((filename) => (
            <div
              key={filename}
              className={cn(
                "flex items-center group px-2 py-1 rounded-md text-sm",
                activeFilename === filename
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              <button
                className="flex-1 flex items-center text-left overflow-hidden"
                onClick={() => onSelectFile(filename)}
              >
                {getFileIcon(filename)}
                <span className="truncate">{filename}</span>
              </button>
              {filename.endsWith('.js') && filename !== 'game.js' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  onClick={() => confirmDelete(filename)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete <strong>{fileToDelete}</strong>? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button 
              variant="secondary" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileExplorer;
