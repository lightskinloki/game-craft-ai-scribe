import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, File, Info, CheckCircle, XCircle } from 'lucide-react';

interface ModelUploadProps {
  onClose: () => void;
  onModelUploaded?: (modelName: string) => void;
}

interface ModelRecommendation {
  name: string;
  size: string;
  ram: string;
  description: string;
  format: 'GGUF' | 'SafeTensors';
  recommended: boolean;
}

// Helper function to save model to IndexedDB
const saveModelToStorage = async (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GameCraftModels', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('models')) {
        db.createObjectStore('models', { keyPath: 'name' });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['models'], 'readwrite');
      const store = transaction.objectStore('models');
      
      // Convert file to ArrayBuffer
      const reader = new FileReader();
      reader.onload = () => {
        const modelData = {
          name: file.name,
          data: reader.result,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        };
        
        const addRequest = store.put(modelData);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    };
  });
};

const ModelUpload: React.FC<ModelUploadProps> = ({ onClose, onModelUploaded }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const modelRecommendations: ModelRecommendation[] = [
    {
      name: 'TinyLlama-1.1B-GGUF',
      size: '~2GB',
      ram: '8GB',
      description: 'Fast, lightweight, ideal for basic code tasks',
      format: 'GGUF',
      recommended: true
    },
    {
      name: 'Qwen-1.8B-SafeTensors',
      size: '~2.5GB',
      ram: '8GB',
      description: 'Strong for code and explanations',
      format: 'SafeTensors',
      recommended: true
    },
    {
      name: 'CodeLlama-7B-GGUF',
      size: '~4-6GB',
      ram: '16GB',
      description: 'Excellent for Phaser-specific tasks',
      format: 'GGUF',
      recommended: false
    },
    {
      name: 'Mistral-7B-SafeTensors',
      size: '~5GB',
      ram: '16GB',
      description: 'Versatile for code and learning aids',
      format: 'SafeTensors',
      recommended: false
    }
  ];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validExtensions = ['.gguf', '.safetensors'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (validExtensions.includes(fileExtension)) {
        setSelectedFile(file);
        setUploadStatus('idle');
        setErrorMessage('');
      } else {
        setErrorMessage('Please select a valid GGUF or SafeTensors model file.');
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      // Simulate initial progress
      setUploadProgress(10);
      
      // Save the model to IndexedDB
      console.log('Saving model to local storage:', selectedFile.name);
      await saveModelToStorage(selectedFile);
      setUploadProgress(80);
      
      // Create a blob URL for the model that can be accessed by the AI system
      const modelBlob = new Blob([selectedFile], { type: selectedFile.type });
      const modelUrl = URL.createObjectURL(modelBlob);
      
      // Store the URL in sessionStorage so the AI system can find it
      const modelInfo = {
        name: selectedFile.name,
        url: modelUrl,
        size: selectedFile.size,
        type: selectedFile.type.includes('gguf') ? 'gguf' : 'safetensors',
        uploadedAt: new Date().toISOString()
      };
      
      sessionStorage.setItem(`model_${selectedFile.name}`, JSON.stringify(modelInfo));
      
      // Also add to a list of available models
      const existingModels = JSON.parse(sessionStorage.getItem('availableModels') || '[]');
      const updatedModels = [...existingModels.filter((m: any) => m.name !== selectedFile.name), modelInfo];
      sessionStorage.setItem('availableModels', JSON.stringify(updatedModels));
      
      setUploadProgress(100);
      setUploadStatus('success');
      
      console.log('Model uploaded successfully:', selectedFile.name);
      
      // Notify parent component
      if (onModelUploaded) {
        onModelUploaded(selectedFile.name);
      }
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        // Trigger a page reload to reinitialize the AI system with new model
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload AI Model
          </DialogTitle>
          <DialogDescription>
            Choose and upload a compatible GGUF or SafeTensors model for local AI assistance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Model Recommendations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recommended Models</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {modelRecommendations.map((model, index) => (
                <Card key={index} className={model.recommended ? 'border-primary' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{model.name}</CardTitle>
                      {model.recommended && (
                        <Badge variant="default" className="text-xs">Recommended</Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {model.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Size: </span>
                        <span className="font-medium">{model.size}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">RAM: </span>
                        <span className="font-medium">{model.ram}</span>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-xs">
                          {model.format}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload Model</h3>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Supported formats: GGUF (.gguf) and SafeTensors (.safetensors). 
                Models will be stored locally in your browser and never sent to external servers.
              </AlertDescription>
            </Alert>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".gguf,.safetensors"
                onChange={handleFileSelect}
                className="hidden"
                id="model-upload"
                disabled={uploading}
              />
              <label htmlFor="model-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {selectedFile ? selectedFile.name : 'Choose a model file'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click to browse or drag and drop a GGUF or SafeTensors file
                  </p>
                  {selectedFile && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <File className="h-4 w-4" />
                      <span className="text-sm">
                        {(selectedFile.size / (1024 * 1024 * 1024)).toFixed(2)} GB
                      </span>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {selectedFile && !uploading && uploadStatus === 'idle' && (
              <Button onClick={handleUpload} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Model
              </Button>
            )}

            {uploading && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">Uploading and processing model...</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground text-center">
                  {uploadProgress}% complete - {uploadProgress < 80 ? 'Saving to local storage...' : 'Finalizing...'}
                </p>
              </div>
            )}

            {uploadStatus === 'success' && (
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Model uploaded successfully! The page will reload to initialize the AI with your new model.
                </AlertDescription>
              </Alert>
            )}

            {(uploadStatus === 'error' || errorMessage) && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage || 'Upload failed. Please try again or check if the file is a valid model format.'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModelUpload;
