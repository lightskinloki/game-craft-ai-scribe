import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Code, Save, Download, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { saveProjectToFile, loadProjectFromFile } from "@/utils/fileHandling";
import { ProjectSaveState } from "@/types/project";
import { v4 as uuidv4 } from 'uuid';
import { useLocalAI } from '@/hooks/useLocalAI';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import AiOutput from '@/components/AiOutput';
import ModeSelector from '@/components/ModeSelector';
import { useLocation } from 'react-router-dom';

const Index = () => {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [aiOutput, setAiOutput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [editorMode, setEditorMode] = useState<'general' | 'phaser'>('general');
  const [activeTab, setActiveTab] = useState<'files' | 'preview' | 'console'>('files');
  const [files, setFiles] = useState<{ id: string; name: string; content: string; }[]>([{ id: 'main.js', name: 'main.js', content: '' }]);
  const [activeFileId, setActiveFileId] = useState<string>('main.js');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const location = useLocation();
  const projectData = location.state?.projectData;

  const { isAvailable, modelName } = useLocalAI();

  // Load project data if passed from landing page
  useEffect(() => {
    if (projectData) {
      setGeneratedCode(projectData.generatedCode || '');
      setEditorMode(projectData.editorMode || 'general');
      setFiles(projectData.files || []);
      setActiveFileId(projectData.activeFileId || 'main.js');
      setCurrentPrompt(projectData.lastPrompt || '');
      setConsoleOutput(projectData.consoleOutput || []);
      
      toast({
        title: "Project Loaded",
        description: "Your project has been loaded successfully",
      });
    }
  }, [projectData, toast]);

  const handlePromptSubmit = useCallback(async (prompt: string) => {
    setCurrentPrompt(prompt);
    setIsProcessing(true);
    setAiOutput('');
    try {
      // Dynamically import the appropriate AI function based on the mode
      let aiFunction;
      if (editorMode === 'phaser') {
        aiFunction = (await import('../utils/ai/phaserAI')).generatePhaserCode;
      } else {
        aiFunction = (await import('../utils/ai/generalAI')).generateCode;
      }
      
      if (!aiFunction) {
        throw new Error(`AI function not found for mode: ${editorMode}`);
      }
      
      const newCode = await aiFunction(prompt);
      setGeneratedCode(prevCode => prevCode + '\n\n' + newCode);
      setAiOutput(newCode);
      
      // Append the new code to the currently active file
      setFiles(prevFiles => {
        return prevFiles.map(file => {
          if (file.id === activeFileId) {
            return { ...file, content: file.content + '\n\n' + newCode };
          }
          return file;
        });
      });
      
    } catch (error: any) {
      console.error("AI Code Generation Error:", error);
      toast({
        title: "AI Code Generation Error",
        description: error.message || "Failed to generate code.",
        variant: "destructive",
      });
      setAiOutput(`Error: ${error.message || 'Failed to generate code.'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [editorMode, activeFileId, toast]);

  const handleSaveProject = useCallback(async () => {
    try {
      // Convert files array to the expected format for ProjectSaveState
      const filesMap: { [filename: string]: string } = {};
      files.forEach(file => {
        filesMap[file.name] = file.content;
      });

      const projectData: ProjectSaveState = {
        version: 1, // Changed from string to number
        generatedCode: generatedCode,
        editorMode: editorMode,
        files: filesMap, // Changed from files array to files map
        activeFilename: files.find(f => f.id === activeFileId)?.name, // Changed from activeFileId to activeFilename
        assets: [], // Added required assets field
      };
      
      await saveProjectToFile(projectData);
    } catch (error) {
      console.error("Save Project Error:", error);
      toast({
        title: "Save Project Error",
        description: "Failed to save project.",
        variant: "destructive",
      });
    }
  }, [generatedCode, editorMode, files, activeFileId, toast]);

  const handleExportProject = useCallback(async () => {
    try {
      // Create a zip file containing all project files
      const zip = new (await import('jszip')).default();
      files.forEach(file => {
        zip.file(file.name, file.content);
      });
      
      // Add index.html with necessary script tags
      const indexHtmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>GameCraft AI Project</title>
          <style> body { margin: 0; overflow: hidden; } </style>
        </head>
        <body>
          <script>${files.find(file => file.name === 'main.js')?.content || ''}</script>
        </body>
        </html>
      `;
      zip.file('index.html', indexHtmlContent);
      
      // Generate the zip file as a blob
      const blob = await zip.generateAsync({ type: "blob" });
      
      // Create a download link for the zip file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'game-project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Project Exported",
        description: "Your project has been exported as a zip file.",
      });
    } catch (error) {
      console.error("Export Project Error:", error);
      toast({
        title: "Export Project Error",
        description: "Failed to export project.",
        variant: "destructive",
      });
    }
  }, [files, toast]);

  const handleAddFile = useCallback(() => {
    const newFileId = uuidv4();
    const newFileName = `new_file_${files.length + 1}.js`;
    setFiles(prevFiles => [...prevFiles, { id: newFileId, name: newFileName, content: '' }]);
    setActiveFileId(newFileId);
  }, [files.length]);

  const handleFileRename = useCallback((fileId: string, newName: string) => {
    setFiles(prevFiles =>
      prevFiles.map(file => (file.id === fileId ? { ...file, name: newName } : file))
    );
  }, []);

  const handleFileDelete = useCallback((fileId: string) => {
    if (files.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one file in the project.",
        variant: "destructive",
      });
      return;
    }

    setFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(file => file.id !== fileId);
      
      if (activeFileId === fileId) {
        setActiveFileId(updatedFiles[0].id);
      }
      
      return updatedFiles;
    });
  }, [files.length, activeFileId, toast]);

  const handleFileSelect = useCallback((fileId: string) => {
    setActiveFileId(fileId);
  }, []);

  const handleEditorChange = useCallback((value: string) => {
    setGeneratedCode(value);
    setFiles(prevFiles =>
      prevFiles.map(file => (file.id === activeFileId ? { ...file, content: value } : file))
    );
  }, [activeFileId]);

  const handleRunCode = useCallback(() => {
    const codeToRun = files.find(file => file.id === activeFileId)?.content || '';
    
    if (!previewFrameRef.current) {
      console.error("Preview frame not available");
      return;
    }

    const frame = previewFrameRef.current;
    const frameWindow = frame.contentWindow as any;

    if (!frameWindow) {
      console.error("Content window not available");
      return;
    }

    setConsoleOutput([]);

    frameWindow.console.log = (...args: any[]) => {
      setConsoleOutput(prevOutput => [...prevOutput, args.join(' ')]);
    };

    try {
      frameWindow.eval(codeToRun);
    } catch (error: any) {
      console.error("Runtime Error:", error);
      setConsoleOutput(prevOutput => [...prevOutput, `Error: ${error.message}`]);
    }
  }, [activeFileId, files]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header onSaveProject={handleSaveProject} onExportProject={handleExportProject} />
      
      {/* Compact Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 border-b border-border text-sm">
        <div className="flex items-center gap-4">
          <ModeSelector currentMode={editorMode} onModeChange={setEditorMode} />
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs">
              <Cpu className="h-3 w-3 text-primary" />
              <span className={`font-medium ${isAvailable ? 'text-green-600' : 'text-orange-600'}`}>
                {isAvailable ? `${modelName || 'Local AI'}` : 'Local AI Unavailable'}
              </span>
            </div>
          </div>
        </div>
        
        {!isAvailable && (
          <div className="text-xs text-orange-600">
            Will use Gemini API fallback - Consider adding a local model
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={45} minSize={30}>
            <div className="flex flex-col h-full">
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <PromptInput onSubmit={handlePromptSubmit} isProcessing={isProcessing} />
                
                <div className="space-y-4">
                  <AiOutput output={aiOutput} isLoading={isProcessing} />
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={55} minSize={40}>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'files' | 'preview' | 'console')} className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                  <TabsTrigger value="console" className="text-xs">Console</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="files" className="flex-1 mt-0 overflow-hidden">
                <div className="p-4 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">File Explorer</h3>
                    <Button variant="outline" size="sm" onClick={handleAddFile}>Add File</Button>
                  </div>
                  <ul className="space-y-1 overflow-y-auto flex-1">
                    {files.map(file => (
                      <li
                        key={file.id}
                        className={`px-3 py-1.5 rounded-md text-sm cursor-pointer hover:bg-secondary ${activeFileId === file.id ? 'bg-secondary font-medium' : ''}`}
                        onClick={() => handleFileSelect(file.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{file.name}</span>
                          <div className="space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newName = prompt("Enter new file name:", file.name);
                                if (newName) {
                                  handleFileRename(file.id, newName);
                                }
                              }}
                            >
                              Rename
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm("Are you sure you want to delete this file?")) {
                                  handleFileDelete(file.id);
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Simple Code Editor */}
                  <div className="mt-4 flex-1">
                    <Textarea
                      value={files.find(file => file.id === activeFileId)?.content || ''}
                      onChange={(e) => handleEditorChange(e.target.value)}
                      className="h-full font-mono text-sm"
                      placeholder="Start coding..."
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 mt-0 overflow-hidden">
                <div className="flex flex-col h-full">
                  <div className="p-4 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Game Preview</h3>
                    <Button size="sm" onClick={handleRunCode}>Run</Button>
                  </div>
                  <iframe
                    ref={previewFrameRef}
                    title="Game Preview"
                    className="flex-1 w-full h-full border-none"
                  />
                </div>
              </TabsContent>

              <TabsContent value="console" className="flex-1 mt-0 overflow-hidden">
                <div className="flex flex-col h-full">
                  <div className="p-4">
                    <h3 className="text-sm font-medium">Console</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 bg-secondary/50 text-xs">
                    {consoleOutput.map((output, index) => (
                      <div key={index}>{output}</div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
