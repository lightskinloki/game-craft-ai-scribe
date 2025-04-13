
import React, { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import AiOutput from '@/components/AiOutput';
import CodeEditor from '@/components/CodeEditor';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const { toast } = useToast();

  const handlePromptSubmit = async (prompt: string) => {
    setIsProcessing(true);
    
    try {
      // Call the backend API
      const response = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          existingCode: generatedCode // Send existing code to the backend
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate code');
      }
      
      const data = await response.json();
      
      // Make sure we're getting both parts of the response
      if (data.explanation) {
        setAiExplanation(data.explanation);
      }
      
      if (data.code) {
        setGeneratedCode(data.code);
      }
      
      toast({
        title: 'Code generated!',
        description: 'AI has generated code based on your prompt.',
      });
    } catch (error) {
      console.error('Error generating code:', error);
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

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={40} minSize={30} className="flex flex-col">
            <div className="p-4">
              <PromptInput onSubmit={handlePromptSubmit} isProcessing={isProcessing} />
            </div>
            <Separator />
            <div className="flex-1 overflow-hidden">
              <AiOutput explanation={aiExplanation} isLoading={isProcessing} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={30}>
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
