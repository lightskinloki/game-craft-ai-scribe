
import { ProjectSaveState } from "@/types/project";
import { toast } from "@/components/ui/use-toast";

export async function saveProjectToFile(projectData: ProjectSaveState) {
  const jsonString = JSON.stringify(projectData, null, 2);
  const filename = 'my-game-project.gcai';

  try {
    if ('showSaveFilePicker' in window) {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'GameCraft Project',
          accept: { 'application/json': ['.gcai', '.json'] }
        }]
      });
      const writable = await handle.createWritable();
      await writable.write(jsonString);
      await writable.close();
    } else {
      // Fallback for browsers without File System Access API
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    toast({
      title: "Project Saved",
      description: "Your project has been saved successfully",
    });
  } catch (error) {
    console.error('Failed to save project:', error);
    toast({
      title: "Save Failed",
      description: "Failed to save your project. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
}

export async function loadProjectFromFile(): Promise<ProjectSaveState> {
  try {
    let fileContent: string;
    
    if ('showOpenFilePicker' in window) {
      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: 'GameCraft Project',
          accept: { 'application/json': ['.gcai', '.json'] }
        }],
        multiple: false
      });
      const file = await handle.getFile();
      fileContent = await file.text();
    } else {
      // Fallback for browsers without File System Access API
      fileContent = await new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.gcai,.json';
        
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) {
            reject(new Error('No file selected'));
            return;
          }
          
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsText(file);
        };
        
        input.click();
      });
    }
    
    const projectData = JSON.parse(fileContent) as ProjectSaveState;
    
    // Validate project data
    if (!projectData.version || !projectData.editorMode || typeof projectData.generatedCode !== 'string') {
      throw new Error('Invalid project file format');
    }
    
    return projectData;
  } catch (error) {
    console.error('Failed to load project:', error);
    toast({
      title: "Load Failed",
      description: error instanceof Error ? error.message : "Failed to load your project. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
}
