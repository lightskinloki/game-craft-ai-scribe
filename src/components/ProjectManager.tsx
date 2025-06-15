
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FolderOpen, File, Calendar, Trash2, Info } from 'lucide-react';

interface ProjectManagerProps {
  onClose: () => void;
  onProjectLoaded: () => void;
}

interface SavedProject {
  id: string;
  name: string;
  lastModified: Date;
  fileCount: number;
  size: string;
  description?: string;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ onClose, onProjectLoaded }) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    loadSavedProjects();
  }, []);

  const loadSavedProjects = async () => {
    try {
      // In a real implementation, this would load from local storage or filesystem
      // For now, we'll simulate some saved projects
      const mockProjects: SavedProject[] = [
        {
          id: '1',
          name: 'Space Shooter Game',
          lastModified: new Date(Date.now() - 86400000), // 1 day ago
          fileCount: 5,
          size: '2.3 MB',
          description: 'Classic space shooter with power-ups'
        },
        {
          id: '2',
          name: 'Platformer Demo',
          lastModified: new Date(Date.now() - 172800000), // 2 days ago
          fileCount: 8,
          size: '4.1 MB',
          description: 'Side-scrolling platformer with physics'
        },
        {
          id: '3',
          name: 'Puzzle Game',
          lastModified: new Date(Date.now() - 604800000), // 1 week ago
          fileCount: 3,
          size: '1.8 MB',
          description: 'Match-3 puzzle game prototype'
        }
      ];

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProjects(mockProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      setSelectedProject(projectId);
      
      // In a real implementation, this would load the project data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onProjectLoaded();
    } catch (error) {
      console.error('Failed to load project:', error);
      setSelectedProject(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      // In a real implementation, this would delete from storage
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Load Project
          </DialogTitle>
          <DialogDescription>
            Select a saved project to continue working on
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-secondary rounded-lg"></div>
                </div>
              ))}
            </div>
          )}

          {!loading && projects.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No saved projects found. Create a new project to get started.
              </AlertDescription>
            </Alert>
          )}

          {!loading && projects.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {projects.length} saved project{projects.length !== 1 ? 's' : ''} found
              </div>
              
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProject === project.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        {project.description && (
                          <CardDescription>{project.description}</CardDescription>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <File className="h-3 w-3" />
                          {project.fileCount} files
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(project.lastModified)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {project.size}
                        </Badge>
                      </div>
                      
                      {selectedProject === project.id && (
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadProject(project.id);
                          }}
                          disabled={selectedProject === project.id}
                        >
                          {selectedProject === project.id ? 'Loading...' : 'Load Project'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectManager;
