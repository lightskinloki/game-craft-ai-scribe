
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2, Copy, FolderOpen, Image, Music, FileText, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export interface Asset {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  preview?: string;
  category: 'image' | 'audio' | 'data' | 'other';
}

interface EnhancedAssetManagerProps {
  assets: Asset[];
  onAssetsChange: (assets: Asset[]) => void;
}

const EnhancedAssetManager: React.FC<EnhancedAssetManagerProps> = ({ assets, onAssetsChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'image' | 'audio' | 'data' | 'other'>('all');
  const [showPreviews, setShowPreviews] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const categorizeAsset = (type: string): Asset['category'] => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('json') || type.includes('xml') || type.includes('csv')) return 'data';
    return 'other';
  };

  const getCategoryIcon = (category: Asset['category']) => {
    switch (category) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'data': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      // Handle response
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
      });

      xhr.open('POST', 'http://localhost:5000/upload/phaser');
      xhr.send(formData);

      const data = await uploadPromise;
      
      const newAssets = data.files.map((file: any) => ({
        id: crypto.randomUUID(),
        name: file.filename,
        url: `http://localhost:5000/assets/phaser/${file.filename}`,
        size: file.size,
        type: file.type,
        category: categorizeAsset(file.type),
        preview: file.type.startsWith('image/') ? `http://localhost:5000/assets/phaser/${file.filename}` : undefined
      }));

      onAssetsChange([...assets, ...newAssets]);
      
      toast({
        title: "Assets uploaded successfully",
        description: `${newAssets.length} files uploaded and categorized`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const copyAssetUrl = async (url: string, name: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL copied",
        description: `${name} URL copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const deleteAsset = async (id: string, name: string) => {
    try {
      const response = await fetch(`http://localhost:5000/assets/phaser/${name}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete asset');
      }

      onAssetsChange(assets.filter(asset => asset.id !== id));
      
      toast({
        title: "Asset deleted",
        description: `${name} has been removed`,
      });
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete asset",
        variant: "destructive",
      });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const assetStats = {
    total: assets.length,
    images: assets.filter(a => a.category === 'image').length,
    audio: assets.filter(a => a.category === 'audio').length,
    data: assets.filter(a => a.category === 'data').length,
    other: assets.filter(a => a.category === 'other').length,
    totalSize: assets.reduce((sum, asset) => sum + asset.size, 0)
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with upload and controls */}
      <div className="p-3 bg-secondary/50 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Enhanced Assets</span>
            <Badge variant="outline">{assetStats.total}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreviews(!showPreviews)}
            >
              {showPreviews ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={isUploading}
                accept="image/*,audio/*,.json,.xml,.csv"
              />
              <Button size="sm" disabled={isUploading}>
                <Upload className="h-4 w-4 mr-1" />
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-3">
            <Progress value={uploadProgress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              Uploading... {Math.round(uploadProgress)}%
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-2">
          <Input
            placeholder="Search assets..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8"
          />
          
          <div className="flex gap-1 flex-wrap">
            {(['all', 'image', 'audio', 'data', 'other'] as const).map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(category)}
                className="h-6 text-xs"
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                {category !== 'all' && (
                  <Badge variant="secondary" className="ml-1 h-4 text-xs">
                    {assetStats[category]}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="text-xs text-muted-foreground mt-2 flex justify-between">
          <span>{filteredAssets.length} assets shown</span>
          <span>Total: {formatSize(assetStats.totalSize)}</span>
        </div>
      </div>

      {/* Asset List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-1">
                {assets.length === 0 ? 'No assets uploaded' : 'No matching assets'}
              </h3>
              <p className="text-sm">
                {assets.length === 0 
                  ? 'Upload images, audio, or data files for your game'
                  : 'Try adjusting your search or category filter'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="group border rounded-lg p-3 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Preview or Icon */}
                    <div className="flex-shrink-0">
                      {showPreviews && asset.preview ? (
                        <img 
                          src={asset.preview} 
                          alt={asset.name}
                          className="w-12 h-12 object-cover rounded border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-secondary rounded border flex items-center justify-center">
                          {getCategoryIcon(asset.category)}
                        </div>
                      )}
                    </div>

                    {/* Asset Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-sm truncate">{asset.name}</div>
                        <Badge variant="outline" className="text-xs">
                          {asset.category}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatSize(asset.size)} • {asset.type}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyAssetUrl(asset.url, asset.name)}
                        title="Copy URL"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAsset(asset.id, asset.name)}
                        title="Delete asset"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedAssetManager;
