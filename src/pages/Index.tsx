import React, { useState, useEffect, useCallback } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import AiOutput from '@/components/AiOutput';
import CodeEditor from '@/components/CodeEditor';
import ModeSelector, { EditorMode } from '@/components/ModeSelector';
import GamePreview from '@/components/GamePreview';
import AssetManager, { Asset } from '@/components/AssetManager';
import FileExplorer from '@/components/FileExplorer';
import { useToast } from '@/components/ui/use-toast';
import { saveProjectToFile, loadProjectFromFile } from '@/utils/fileHandling';
import type { ProjectSaveState } from '@/types/project';
import ConsoleOutput, { LogEntry } from '@/components/ConsoleOutput';
import JSZip from 'jszip';
import { useLocalAI } from '@/hooks/useLocalAI';
import { Cpu, Cloud } from 'lucide-react';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [editorMode, setEditorMode] = useState<EditorMode>('general');
  const [assets, setAssets] = useState<Asset[]>([]);
  const { toast } = useToast();
  
  // Local AI hook
  const localAI = useLocalAI();

  // State for multi-file support
  const [files, setFiles] = useState<{ [filename: string]: string }>({
    'game.js': '// Basic JavaScript code\nconsole.log("Hello from game.js!");',
    'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>Game</title>\n  <style>body { margin: 0; }</style>\n</head>\n<body>\n  <div id="game-container"></div>\n  <script src="game.js"></script>\n</body>\n</html>'
  });
  const [activeFilename, setActiveFilename] = useState<string>('game.js');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Fetch assets on component mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('http://localhost:5000/assets/phaser');
        if (response.ok) {
          const data = await response.json();
          setAssets(data.assets || []);
        }
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      }
    };

    if (editorMode === 'phaser') {
      fetchAssets();
    }
  }, [editorMode]);

  const handlePromptSubmit = async (prompt: string) => {
    setIsProcessing(true);
    
    try {
      console.log('Submitting prompt:', prompt);
      
      let aiResponse = '';
      let usedLocalAI = false;
      let usedFallback = false;
      
      // PRIORITIZE local AI - this is now the primary method
      if (localAI.isAvailable) {
        try {
          console.log('Using local AI generation (primary method)...');
          
          // Enhanced prompt for code generation
          const enhancedPrompt = `As a game development assistant, ${prompt}

Please provide a clear explanation and any necessary code changes for ${editorMode === 'phaser' ? 'Phaser 3' : 'JavaScript'} development.`;
          
          aiResponse = await localAI.generateText(enhancedPrompt, {
            maxTokens: 750,
            temperature: 0.7,
            topP: 0.9,
          });
          
          usedLocalAI = true;
          console.log('Local AI response generated successfully');
        } catch (localError) {
          console.warn('Local AI generation failed:', localError);
          
          // Show specific error to user
          toast({
            title: 'Local AI Error',
            description: `Local model failed: ${localError instanceof Error ? localError.message : 'Unknown error'}. Falling back to Gemini API.`,
            variant: 'destructive',
          });
        }
      } else {
        console.log('Local AI not available:', localAI.error);
        
        // Show helpful message about local AI setup
        toast({
          title: 'Local AI Not Available',
          description: localAI.error || 'Place a GGUF or SafeTensors model in /public/models/ for local inference.',
          variant: 'destructive',
        });
      }
      
      // Fallback to Gemini API only if local AI failed or unavailable
      if (!usedLocalAI) {
        try {
          console.log('Falling back to Gemini API...');
          const response = await fetch('http://localhost:5000/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              prompt,
              existingCode: files[activeFilename],
              activeFilename,
              editorMode
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Gemini API request failed');
          }
          
          const data = await response.json();
          console.log('Gemini API Response received');
          
          if (data && typeof data.explanation === 'string') {
            aiResponse = data.explanation;
            usedFallback = true;
          } else {
            throw new Error('Invalid response format from Gemini API');
          }
        } catch (geminiError) {
          console.error('Gemini API also failed:', geminiError);
          throw new Error(`Both local AI and Gemini API failed. Local: ${localAI.error || 'Not available'}. Gemini: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}`);
        }
      }
      
      // Update the explanation
      console.log('Setting explanation state');
      setAiExplanation(aiResponse);
      
      // Enhanced success feedback
      toast({
        title: `AI Response Generated`,
        description: usedLocalAI 
          ? `✓ Generated locally using ${localAI.modelName} (${localAI.modelType?.toUpperCase()})`
          : usedFallback 
          ? '⚠️ Generated using Gemini API fallback'
          : 'Response generated',
      });
      
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process your prompt. Please check your local model setup or API configuration.';
      setAiExplanation(`Error: ${errorMessage}`);
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setFiles(prevFiles => ({
      ...prevFiles,
      [activeFilename]: newCode
    }));
  };

  const handleCreateFile = (filename: string) => {
    // Basic validation
    if (!filename.trim() || files[filename]) {
      return;
    }

    // Create the file with default content
    setFiles(prevFiles => ({
      ...prevFiles,
      [filename]: `// New file: ${filename}\n`
    }));

    // Set the new file as active
    setActiveFilename(filename);
  };

  const handleDeleteFile = (filename: string) => {
    // Don't allow deleting index.html
    if (filename === 'index.html') {
      toast({
        title: "Cannot Delete",
        description: "The index.html file cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    // Create a new files object without the deleted file
    const newFiles = { ...files };
    delete newFiles[filename];
    setFiles(newFiles);

    // If the deleted file was active, switch to game.js or index.html
    if (activeFilename === filename) {
      setActiveFilename(newFiles['game.js'] ? 'game.js' : 'index.html');
    }
  };

  const handleModeChange = (mode: EditorMode) => {
    setEditorMode(mode);
    
    if (mode === 'phaser' && files['game.js'] === '// Basic JavaScript code\nconsole.log("Hello from game.js!");') {
      // Provide starter template for Phaser if code is empty
      setFiles(prevFiles => ({
        ...prevFiles,
        'game.js': `// Basic Phaser 3 Game Template
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

function preload() {
  // Load assets here
}

function create() {
  // Create game objects here
  this.add.text(400, 300, 'Hello Phaser!', { fontSize: '32px' }).setOrigin(0.5);
}

function update() {
  // Update game logic here
}
`,
        'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phaser Game</title>
  <style>
    body { margin: 0; padding: 0; overflow: hidden; }
    #game-container { display: flex; justify-content: center; align-items: center; height: 100vh; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
</head>
<body>
  <div id="game-container"></div>
  <script src="game.js"></script>
</body>
</html>`
      }));
    }

    toast({
      title: `Switched to ${mode === 'general' ? 'General JavaScript' : 'Phaser 3'} mode`,
      description: mode === 'phaser' 
        ? 'You can now create Phaser games with live preview' 
        : 'General JavaScript mode activated',
    });
  };

  const handleSaveProject = async () => {
    const projectData: ProjectSaveState = {
      version: 1,
      editorMode,
      generatedCode: files[activeFilename], // For backward compatibility
      files, // New field for multi-file support
      activeFilename, // Save the active filename
      assets,
    };
    
    try {
      await saveProjectToFile(projectData);
    } catch (error) {
      console.error('Save project error:', error);
    }
  };

  const handleLoadProject = async () => {
    try {
      const projectData = await loadProjectFromFile();
      setEditorMode(projectData.editorMode);
      
      // Handle both new multi-file format and old single-file format
      if (projectData.files) {
        setFiles(projectData.files);
      } else if (projectData.generatedCode) {
        // Legacy support - put the single file content into game.js
        setFiles({
          'game.js': projectData.generatedCode,
          'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>Game</title>\n  <style>body { margin: 0; }</style>\n</head>\n<body>\n  <div id="game-container"></div>\n  <script src="game.js"></script>\n</body>\n</html>'
        });
      }
      
      // Set the active filename if it exists, otherwise default to game.js
      setActiveFilename(projectData.activeFilename || 'game.js');
      setAssets(projectData.assets);
      
      toast({
        title: "Project Loaded",
        description: "Your project has been loaded successfully",
      });
    } catch (error) {
      console.error('Load project error:', error);
    }
  };

  const handleExportProject = async () => {
    // Show loading toast
    toast({
      title: "Exporting Project",
      description: "Preparing your project files and assets for download...",
    });

    try {
      // Create a new JSZip instance
      const zip = new JSZip();
      
      // Add code files to the zip
      Object.entries(files).forEach(([filename, content]) => {
        zip.file(filename, content);
      });
      
      // Create assets folder in the zip
      const assetsFolder = zip.folder("assets");
      if (!assetsFolder) {
        throw new Error("Failed to create assets folder in ZIP");
      }
      
      // Fetch all assets and add them to the zip
      const assetFetchPromises = assets.map(async (asset) => {
        try {
          const response = await fetch(asset.url);
          
          if (!response.ok) {
            console.warn(`Failed to fetch asset: ${asset.name} (${response.status} ${response.statusText})`);
            return { name: asset.name, error: true };
          }
          
          const blob = await response.blob();
          return { name: asset.name, blob, error: false };
        } catch (error) {
          console.error(`Error fetching asset: ${asset.name}`, error);
          return { name: asset.name, error: true };
        }
      });
      
      // Wait for all asset fetch operations to complete
      const assetResults = await Promise.allSettled(assetFetchPromises);
      
      // Track skipped assets for user feedback
      const skippedAssets: string[] = [];
      
      // Process the results and add successful fetches to the zip
      assetResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          const assetResult = result.value;
          
          if (!assetResult.error && assetResult.blob) {
            assetsFolder.file(assetResult.name, assetResult.blob);
          } else {
            skippedAssets.push(assetResult.name);
          }
        } else {
          console.error('Asset promise rejected:', result.reason);
          // We don't have the asset name here, but we track that an error occurred
          skippedAssets.push('Unknown asset');
        }
      });
      
      // Generate the zip file as a blob
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Create a download link and trigger the download
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = "gamecraft-project.zip";
      downloadLink.click();
      
      // Clean up the URL object
      URL.revokeObjectURL(downloadLink.href);
      
      // Show success toast with info about skipped assets if any
      toast({
        title: "Project Exported Successfully",
        description: skippedAssets.length > 0 
          ? `Download complete. Note: ${skippedAssets.length} asset(s) could not be included.` 
          : "Your project has been downloaded as a ZIP file.",
      });
      
      // Note for console about relative paths
      console.info(
        "Note: The exported HTML file references assets using absolute URLs. " +
        "You may need to update the paths in the code after unzipping for it to load the embedded assets correctly."
      );
    } catch (error) {
      console.error('Error exporting project:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export project. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle console messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'console' && event.data?.method && event.data?.args) {
        const newLog: LogEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          level: event.data.method as LogEntry['level'],
          message: event.data.args.join(' ')
        };
        
        setLogs(prevLogs => [...prevLogs, newLog].slice(-200));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleClearLogs = () => setLogs([]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header 
        onSaveProject={handleSaveProject} 
        onLoadProject={handleLoadProject}
        onExportProject={handleExportProject}
      />
      <div className="flex justify-between items-center px-4 py-1.5 border-b border-border/50 bg-secondary/20">
        <div className="flex items-center gap-4">
          {/* Compact AI Status */}
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${
              localAI.isLoading ? 'bg-yellow-500 animate-pulse' : 
              localAI.isAvailable ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`font-medium ${
              localAI.isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {localAI.isLoading ? 'Loading AI...' : 
               localAI.isAvailable ? `Local AI (${localAI.modelType?.toUpperCase()})` : 
               'Local AI: Unavailable'}
            </span>
            {/* Gemini Fallback Notice */}
            {!localAI.isAvailable && (
              <span className="text-muted-foreground/70 flex items-center gap-1">
                <Cloud className="h-3 w-3" />
                Gemini API fallback available
              </span>
            )}
          </div>
        </div>
        
        <ModeSelector 
          currentMode={editorMode} 
          onModeChange={handleModeChange} 
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left panel - AI output and prompt input with file change support */}
          <ResizablePanel defaultSize={30} minSize={20} className="flex flex-col">
            <div className="p-4">
              <PromptInput onSubmit={handlePromptSubmit} isProcessing={isProcessing} />
            </div>
            <Separator />
            <div className="flex-1 overflow-hidden">
              <AiOutput 
                explanation={aiExplanation} 
                isLoading={isProcessing}
                currentFiles={files}
                onFilesChange={setFiles}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Middle panel with vertical stack for Phaser mode */}
          {editorMode === 'phaser' && (
            <>
              <ResizablePanel defaultSize={40} minSize={30} maxSize={70}>
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel 
                    defaultSize={60}
                    minSize={25}
                    maxSize={70}
                  >
                    <GamePreview 
                      files={files}
                      assets={assets}
                    />
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle />
                  
                  <ResizablePanel
                    defaultSize={25}
                    minSize={20}
                    maxSize={50}
                  >
                    <ConsoleOutput logs={logs} onClearLogs={handleClearLogs} />
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle />
                  
                  <ResizablePanel
                    defaultSize={15}
                    minSize={15}
                    maxSize={35}
                  >
                    <AssetManager 
                      assets={assets}
                      onAssetsChange={setAssets}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
            </>
          )}
          
          {/* Right panel - now with tabs for file explorer and editor */}
          <ResizablePanel 
            defaultSize={editorMode === 'phaser' ? 30 : 70} 
            minSize={20} 
            maxSize={70}
            className="flex flex-col"
          >
            <Tabs defaultValue="editor" className="h-full flex flex-col">
              <TabsList className="w-full justify-start border-b rounded-none px-2">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="flex-1 m-0 p-0">
                <CodeEditor 
                  code={files[activeFilename]} 
                  activeFilename={activeFilename}
                  isLoading={isProcessing} 
                  onCodeChange={handleCodeChange}
                />
              </TabsContent>
              <TabsContent value="files" className="flex-1 m-0 p-0">
                <FileExplorer
                  files={files}
                  activeFilename={activeFilename}
                  onSelectFile={setActiveFilename}
                  onCreateFile={handleCreateFile}
                  onDeleteFile={handleDeleteFile}
                />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
