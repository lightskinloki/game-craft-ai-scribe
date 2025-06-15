
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
import { aiService, EditorMode } from '@/services/aiService';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import AiOutput from '@/components/AiOutput';
import ModeSelector from '@/components/ModeSelector';
import CodeEditor from '@/components/CodeEditor';
import { useLocation } from 'react-router-dom';

const Index = () => {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [aiOutput, setAiOutput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('general');
  const [activeTab, setActiveTab] = useState<'files' | 'preview' | 'console'>('files');
  const [files, setFiles] = useState<{ id: string; name: string; content: string; }[]>([{ id: 'main.js', name: 'main.js', content: '' }]);
  const [activeFileId, setActiveFileId] = useState<string>('main.js');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const previewFrameRef = useRef<HTMLIFrameReference>(null);
  const { toast } = useToast();

  const location = useLocation();
  const projectData = location.state?.projectData;

  const { isAvailable, modelName, isLoading, error: aiError } = useLocalAI();

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
      console.log('Generating code with AI service...');
      const newCode = await aiService.generateCode(prompt, editorMode);
      
      // Validate the generated code
      const validation = await aiService.validateCode(newCode);
      if (!validation.isValid) {
        console.warn('Generated code has validation issues:', validation.errors);
      }
      
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
      
      toast({
        title: "Code Generated",
        description: `${editorMode === 'phaser' ? 'Phaser' : 'General'} code generated successfully`,
      });
      
    } catch (error: any) {
      console.error("AI Code Generation Error:", error);
      toast({
        title: "AI Code Generation Error",
        description: error.message || "Failed to generate code. Check if local AI model is available.",
        variant: "destructive",
      });
      setAiOutput(`Error: ${error.message || 'Failed to generate code.'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [editorMode, activeFileId, toast]);

  const handleSaveProject = useCallback(async () => {
    try {
      const filesMap: { [filename: string]: string } = {};
      files.forEach(file => {
        filesMap[file.name] = file.content;
      });

      const projectData: ProjectSaveState = {
        version: 1,
        generatedCode: generatedCode,
        editorMode: editorMode,
        files: filesMap,
        activeFilename: files.find(f => f.id === activeFileId)?.name,
        assets: [],
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
      const zip = new (await import('jszip')).default();
      files.forEach(file => {
        zip.file(file.name, file.content);
      });
      
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
      
      const blob = await zip.generateAsync({ type: "blob" });
      
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
      
      {/* Enhanced Status Bar with AI Status */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 border-b border-border text-sm">
        <div className="flex items-center gap-4">
          <ModeSelector currentMode={editorMode} onModeChange={setEditorMode} />
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs">
              <Cpu className="h-3 w-3 text-primary" />
              <span className={`font-medium ${isAvailable ? 'text-green-600' : 'text-orange-600'}`}>
                {isLoading ? 'Loading AI...' : isAvailable ? `${modelName || 'Local AI'}` : 'Local AI Unavailable'}
              </span>
            </div>
          </div>
        </div>
        
        {aiError && (
          <div className="text-xs text-red-600">
            AI Error: {aiError}
          </div>
        )}
        
        {!isAvailable && !isLoading && (
          <div className="text-xs text-orange-600">
            Using fallback responses - Consider adding a local model
          </div>
        )}
      </div>

      {/* Main Content with proper 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel - Prompt and AI Output */}
          <ResizablePanel defaultSize={30} minSize={25}>
            <div className="flex flex-col h-full">
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                <PromptInput 
                  onSubmit={handlePromptSubmit} 
                  isProcessing={isProcessing}
                />
                
                <div className="space-y-4">
                  <AiOutput 
                    output={aiOutput} 
                    isLoading={isProcessing}
                    mode={editorMode}
                  />
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Middle Panel - Code Editor */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="flex flex-col h-full">
              {/* File Explorer */}
              <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Files</h3>
                  <Button variant="outline" size="sm" onClick={handleAddFile}>Add File</Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {files.map(file => (
                    <button
                      key={file.id}
                      className={`px-2 py-1 text-xs rounded ${activeFileId === file.id ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                      onClick={() => handleFileSelect(file.id)}
                    >
                      {file.name}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Code Editor */}
              <div className="flex-1">
                <CodeEditor
                  code={files.find(file => file.id === activeFileId)?.content || ''}
                  isLoading={false}
                  activeFilename={files.find(file => file.id === activeFileId)?.name}
                  onCodeChange={handleEditorChange}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Preview and Console */}
          <ResizablePanel defaultSize={30} minSize={25}>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'files' | 'preview' | 'console')} className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                  <TabsTrigger value="console" className="text-xs">Console</TabsTrigger>
                </TabsList>
              </div>

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
                  <div className="flex-1 overflow-y-auto p-4 bg-secondary/50 text-xs font-mono">
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
