
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { Code, Cpu, HardDrive, Monitor, Upload, FolderOpen, Plus, Zap, Shield, Wifi, Info } from 'lucide-react';
import { useLocalAI } from '@/hooks/useLocalAI';
import ModelUpload from '@/components/ModelUpload';
import HardwareDetection from '@/components/HardwareDetection';
import ProjectManager from '@/components/ProjectManager';

const Landing = () => {
  const navigate = useNavigate();
  const { isAvailable, isLoading, modelName, modelType, error, loadProgress } = useLocalAI();
  const [showModelUpload, setShowModelUpload] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);

  const handleNewProject = () => {
    navigate('/editor');
  };

  const handleLoadProject = () => {
    setShowProjectManager(true);
  };

  const onProjectLoaded = () => {
    setShowProjectManager(false);
    navigate('/editor');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Code className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">GameCraft AI Scribe</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Local-First AI-Powered Game Development Environment
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Fully Offline
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Local AI Inference
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Wifi className="h-3 w-3 line-through" />
              No Recurring Costs
            </Badge>
          </div>
        </div>

        {/* AI Model Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              AI Model Status
            </CardTitle>
            <CardDescription>
              Local AI model for code assistance and explanations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">Loading AI model...</span>
                </div>
                <Progress value={loadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {loadProgress < 25 && "Initializing model loader..."}
                  {loadProgress >= 25 && loadProgress < 75 && "Loading model weights..."}
                  {loadProgress >= 75 && "Finalizing model setup..."}
                </p>
              </div>
            )}
            
            {!isLoading && isAvailable && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium text-green-700 dark:text-green-400">
                    AI Model Ready
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Model: </span>
                    <span className="font-medium">{modelName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format: </span>
                    <Badge variant="outline" className="text-xs">
                      {modelType?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            
            {!isLoading && !isAvailable && (
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {error || "No AI model detected. Upload a compatible GGUF or SafeTensors model to enable AI assistance."}
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="outline" 
                  onClick={() => setShowModelUpload(true)}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload AI Model
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hardware Detection */}
        <HardwareDetection />

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleNewProject}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Project
              </CardTitle>
              <CardDescription>
                Start a fresh game development project with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Create New Project
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleLoadProject}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Load Project
              </CardTitle>
              <CardDescription>
                Continue working on an existing project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Load Existing Project
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              Everything you need for AI-assisted game development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-primary" />
                  <span className="font-medium">Smart Code Editor</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Multi-file support with syntax highlighting and AI-powered assistance
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" />
                  <span className="font-medium">Live Preview</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Real-time game preview with console output and debugging tools
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-primary" />
                  <span className="font-medium">Local Storage</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Save and load projects locally with full asset management
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        {showModelUpload && (
          <ModelUpload onClose={() => setShowModelUpload(false)} />
        )}
        
        {showProjectManager && (
          <ProjectManager 
            onClose={() => setShowProjectManager(false)}
            onProjectLoaded={onProjectLoaded}
          />
        )}
      </div>
    </div>
  );
};

export default Landing;
