import React, { useState, useEffect } from 'react';
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
import FileTabs from '@/components/FileTabs';
import { useToast } from '@/components/ui/use-toast';
import { saveProjectToFile, loadProjectFromFile } from '@/utils/fileHandling';
import type { ProjectSaveState } from '@/types/project';
import ConsoleOutput, { LogEntry } from '@/components/ConsoleOutput';

// Updated ProjectSaveState interface
const updateProjectSaveState = () => {
  // This is just here to make sure the code compiles, but the interface is updated in the types file
};

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [editorMode, setEditorMode] = useState<EditorMode>('general');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeMiddleTab, setActiveMiddleTab] = useState<'preview' | 'console' | 'assets'>('preview');
  const { toast } = useToast();

  // New state for multi-file support
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
      
      // Call the backend API
      const response = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          existingCode: files[activeFilename], // Send active file content
          activeFilename,  // Send the active filename
          editorMode // Send the current editor mode
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate explanation');
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log the entire response
      
      // Update the explanation
      if (data && typeof data.explanation === 'string') {
        console.log('Setting explanation state to:', data.explanation);
        setAiExplanation(data.explanation);
      } else {
        console.warn('Invalid explanation format:', data);
        setAiExplanation('Received an invalid response format from the AI. Please try again.');
      }
      
      toast({
        title: 'AI Response Received',
        description: 'The AI has analyzed your prompt.',
      });
    } catch (error) {
      console.error('Error generating response:', error);
      setAiExplanation(`Error: ${error instanceof Error ? error.message : 'Failed to process your prompt. Please try again.'}`);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process your prompt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle code updates from the editor
  const handleCodeChange = (newCode: string) => {
    setFiles(prevFiles => ({
      ...prevFiles,
      [activeFilename]: newCode // Update only the active file
    }));
  };

  // Handle mode switching
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
      />
      <div className="flex justify-end px-4 py-2">
        <ModeSelector 
          currentMode={editorMode} 
          onModeChange={handleModeChange} 
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left panel - AI output and prompt input */}
          <ResizablePanel defaultSize={30} minSize={20} className="flex flex-col">
            <div className="p-4">
              <PromptInput onSubmit={handlePromptSubmit} isProcessing={isProcessing} />
            </div>
            <Separator />
            <div className="flex-1 overflow-hidden">
              <AiOutput explanation={aiExplanation} isLoading={isProcessing} />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Middle panel with vertical stack for Phaser mode */}
          {editorMode === 'phaser' && (
            <>
              <ResizablePanel defaultSize={40} minSize={20}>
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={60}>
                    <GamePreview 
                      code={files['game.js']} 
                      htmlTemplate={files['index.html']}
                      assets={assets}
                    />
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle />
                  
                  <ResizablePanel defaultSize={25}>
                    <ConsoleOutput logs={logs} onClearLogs={handleClearLogs} />
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle />
                  
                  <ResizablePanel defaultSize={15}>
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
          
          {/* Right panel - editor */}
          <ResizablePanel defaultSize={editorMode === 'phaser' ? 30 : 70} minSize={20} className="flex flex-col">
            <FileTabs 
              filenames={Object.keys(files)} 
              activeFilename={activeFilename} 
              onSelectFile={setActiveFilename} 
            />
            <CodeEditor 
              code={files[activeFilename]} 
              activeFilename={activeFilename}
              isLoading={isProcessing} 
              onCodeChange={handleCodeChange}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
