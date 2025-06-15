
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Upload, FolderOpen, Plus, Cpu, HardDrive, Zap, Shield } from 'lucide-react';
import { useLocalAI } from '@/hooks/useLocalAI';
import { loadProjectFromFile } from '@/utils/fileHandling';
import { useToast } from '@/components/ui/use-toast';
import ModelSelector from '@/components/ModelSelector';

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAvailable, modelName, isLoading, loadProgress } = useLocalAI();

  const handleNewProject = () => {
    navigate('/editor');
  };

  const handleLoadProject = async () => {
    try {
      const projectData = await loadProjectFromFile();
      // Navigate to editor with loaded project data
      navigate('/editor', { state: { projectData } });
    } catch (error) {
      // Error is already handled in loadProjectFromFile
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Code className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">GameCraft AI</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Local-first AI-powered game development environment. Create, code, and craft games with privacy and power.
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              Offline-First
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Cpu className="h-3 w-3" />
              Local AI
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              No Subscriptions
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* AI Model Status */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                AI Model Status
              </CardTitle>
              <CardDescription>
                Local AI inference for code generation and assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModelSelector />
            </CardContent>
          </Card>

          {/* Project Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Project
              </CardTitle>
              <CardDescription>
                Start a fresh game development project with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleNewProject} 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
              <p className="text-sm text-muted-foreground">
                Choose between General JavaScript or Phaser 3 game development modes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Load Existing Project
              </CardTitle>
              <CardDescription>
                Continue working on a previously saved GameCraft project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleLoadProject} 
                variant="outline" 
                className="w-full" 
                size="lg"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Load Project
              </Button>
              <p className="text-sm text-muted-foreground">
                Supports .gcai project files with all your code and assets
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card className="max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Quick tips to make the most of GameCraft AI
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <HardDrive className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Local Models</h3>
              <p className="text-sm text-muted-foreground">
                Place GGUF or SafeTensors models in /public/models/ for optimal performance
              </p>
            </div>
            <div className="text-center">
              <Code className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">AI Assistance</h3>
              <p className="text-sm text-muted-foreground">
                Get code suggestions, explanations, and game development guidance
              </p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Privacy First</h3>
              <p className="text-sm text-muted-foreground">
                All processing happens locally - your code never leaves your machine
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Landing;
