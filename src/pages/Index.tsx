import React, { useState, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import AiOutput from '@/components/AiOutput';
import CodeEditor from '@/components/CodeEditor';
import ModeSelector, { EditorMode } from '@/components/ModeSelector';
import GamePreview from '@/components/GamePreview';
import AssetManager, { Asset } from '@/components/AssetManager';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { saveProjectToFile, loadProjectFromFile } from '@/utils/fileHandling';
import type { ProjectSaveState } from '@/types/project';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [editorMode, setEditorMode] = useState<EditorMode>('general');
  const [assets, setAssets] = useState<Asset[]>([]);
  const { toast } = useToast();

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
          existingCode: generatedCode, // Send existing code to the backend
          editorMode: editorMode // Send the current editor mode
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
    setGeneratedCode(newCode);
  };

  // Handle mode switching
  const handleModeChange = (mode: EditorMode) => {
    setEditorMode(mode);
    
    if (mode === 'phaser' && generatedCode === '') {
      // Provide starter template for Phaser if code is empty
      setGeneratedCode(`// Basic Phaser 3 Game Template
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
`);
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
      generatedCode,
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
      setGeneratedCode(projectData.generatedCode);
      setAssets(projectData.assets);
      
      toast({
        title: "Project Loaded",
        description: "Your project has been loaded successfully",
      });
    } catch (error) {
      console.error('Load project error:', error);
    }
  };

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
          
          {/* Middle panel - Game preview and asset manager (only in Phaser mode) */}
          {editorMode === 'phaser' && (
            <>
              <ResizablePanel defaultSize={40} minSize={20}>
                <ResizablePanelGroup direction="vertical">
                  {/* Game Preview */}
                  <ResizablePanel defaultSize={60} minSize={30}>
                    <GamePreview 
                      code={generatedCode} 
                      assets={assets}
                    />
                  </ResizablePanel>
                  
                  <ResizableHandle withHandle />
                  
                  {/* Asset Manager */}
                  <ResizablePanel defaultSize={40} minSize={20}>
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
          
          {/* Right panel - Code editor */}
          <ResizablePanel defaultSize={editorMode === 'phaser' ? 30 : 70} minSize={20}>
            <CodeEditor 
              code={generatedCode} 
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
