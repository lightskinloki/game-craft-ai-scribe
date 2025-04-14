
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Trash2, Copy, FolderOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export interface Asset {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

interface AssetManagerProps {
  assets: Asset[];
  onAssetsChange: (assets: Asset[]) => void;
}

const AssetManager: React.FC<AssetManagerProps> = ({ assets, onAssetsChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('http://localhost:5000/upload/phaser', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload files');
      }

      const data = await response.json();
      
      // Add new assets to the existing ones
      const newAssets = data.files.map((file: any) => ({
        id: crypto.randomUUID(), // Generate unique ID
        name: file.filename,
        url: `http://localhost:5000/assets/phaser/${file.filename}`,
        size: file.size,
        type: file.type,
      }));

      onAssetsChange([...assets, ...newAssets]);
      
      toast({
        title: "Assets uploaded",
        description: `Successfully uploaded ${newAssets.length} files`,
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
      // Reset file input
      event.target.value = '';
    }
  };

  const copyAssetUrl = (url: string, name: string) => {
    navigator.clipboard.writeText(url).then(
      () => {
        toast({
          title: "URL copied",
          description: `URL for ${name} copied to clipboard`,
        });
      },
      () => {
        toast({
          title: "Failed to copy",
          description: "Could not copy URL to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  const deleteAsset = async (id: string, name: string) => {
    try {
      // Remove from backend
      const response = await fetch(`http://localhost:5000/assets/phaser/${name}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete asset');
      }

      // Remove from local state
      onAssetsChange(assets.filter(asset => asset.id !== id));
      
      toast({
        title: "Asset deleted",
        description: `${name} has been deleted`,
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

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 bg-secondary">
        <span className="text-sm font-medium">Asset Manager</span>
        <div className="relative">
          <input
            type="file"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Button size="sm" disabled={isUploading}>
            {isUploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Assets
              </>
            )}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-1">No assets uploaded</h3>
              <p className="text-sm">
                Upload images, audio files, or JSON files to use in your Phaser game
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                  <div className="flex-1 truncate mr-4">
                    <div className="font-medium text-sm">{asset.name}</div>
                    <div className="text-xs text-muted-foreground">{formatSize(asset.size)}</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyAssetUrl(asset.url, asset.name)}
                      title="Copy URL"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAsset(asset.id, asset.name)}
                      title="Delete asset"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default AssetManager;
