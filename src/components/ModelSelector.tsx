
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertCircle, Cpu, HardDrive } from 'lucide-react';
import { useLocalAI } from '@/hooks/useLocalAI';

const ModelSelector = () => {
  const { 
    isLoading, 
    isAvailable, 
    modelName, 
    modelType, 
    error, 
    loadProgress,
    checkModelCompatibility 
  } = useLocalAI();

  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validExtensions = ['.gguf', '.safetensors'];
    const isValidFile = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidFile) {
      // Show error toast
      return;
    }

    // TODO: Implement file upload to /public/models/
    console.log('Model upload functionality to be implemented', file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const compatibility = checkModelCompatibility();

  return (
    <div className="space-y-4">
      {/* Current Model Status */}
      {isLoading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Loading AI Model...</span>
            <span className="text-sm text-muted-foreground">{loadProgress}%</span>
          </div>
          <Progress value={loadProgress} className="w-full" />
        </div>
      )}

      {isAvailable && modelName && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Model Ready:</strong> {modelName}
              <Badge variant="outline" className="ml-2">
                {modelType?.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Cpu className="h-3 w-3" />
              {compatibility.compatible ? 'Compatible' : compatibility.reason}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isAvailable && !isLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No local AI model detected. Upload a GGUF or SafeTensors model, or use the Gemini API fallback.
          </AlertDescription>
        </Alert>
      )}

      {/* Model Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <h3 className="font-semibold mb-1">Upload AI Model</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Drag and drop GGUF or SafeTensors files, or click to browse
        </p>
        <Button variant="outline" size="sm">
          <HardDrive className="h-4 w-4 mr-2" />
          Browse Files
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Recommended: 1.5B models for 8GB RAM, 7B+ for 16GB RAM
        </p>
      </div>

      {/* Model Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-secondary/50 rounded-lg">
          <h4 className="font-semibold text-green-600 mb-1">Low-End (8GB RAM)</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• TinyLlama-1.1B-GGUF (~2GB)</li>
            <li>• Qwen-1.8B-SafeTensors (~2.5GB)</li>
          </ul>
        </div>
        <div className="p-3 bg-secondary/50 rounded-lg">
          <h4 className="font-semibold text-blue-600 mb-1">Mid-Range (16GB+ RAM)</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• CodeLlama-7B-GGUF (~5GB)</li>
            <li>• Mistral-7B-SafeTensors (~5GB)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;
