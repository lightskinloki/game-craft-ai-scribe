
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlayIcon, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Asset } from './AssetManager';

interface GamePreviewProps {
  code: string;
  assets: Asset[];
}

const GamePreview: React.FC<GamePreviewProps> = ({ code, assets }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateHTMLContent = () => {
    // Create asset preload code
    const assetPreloadCode = assets.map(asset => {
      const extension = asset.name.split('.').pop()?.toLowerCase() || '';
      const safeKey = asset.name.replace(/[^a-zA-Z0-9_]/g, '_');
      
      if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
        return `this.load.image('${safeKey}', '${asset.url}');`;
      } else if (['mp3', 'ogg', 'wav'].includes(extension)) {
        return `this.load.audio('${safeKey}', '${asset.url}');`;
      } else if (['json'].includes(extension)) {
        return `this.load.tilemapTiledJSON('${safeKey}', '${asset.url}');`;
      } else {
        return `// Unsupported file type: ${asset.name}`;
      }
    }).join('\n      ');

    // Extract existing preload content
    const preloadRegex = /preload\s*\(\s*\)\s*{([\s\S]*?)}/s;
    const preloadMatch = code.match(preloadRegex);
    const existingPreloadContent = preloadMatch ? preloadMatch[1].trim() : '';

    // Create modified code with combined preload content
    let modifiedCode = code;
    if (preloadMatch) {
      const newPreloadFunction = `
    preload() {
      // Auto-injected asset loading
      ${assetPreloadCode}
      // Original preload code
      ${existingPreloadContent}
    }`;
      modifiedCode = code.replace(preloadRegex, newPreloadFunction);
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Phaser Game Preview</title>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
  <style>
    body { margin: 0; overflow: hidden; background-color: #000; }
    #phaser-game { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="phaser-game"></div>
  <script>
    try {
      ${modifiedCode}
    } catch (error) {
      console.error('Error in game code:', error);
      document.body.innerHTML = '<div style="color: #ff5555; background: #330000; border: 1px solid red; padding: 20px; font-family: monospace; white-space: pre-wrap;"><h3>Runtime Error:</h3>' + error.stack + '</div>';
    }
  </script>
</body>
</html>`;
  };

  const runGame = () => {
    setIsLoading(true);
    try {
      if (iframeRef.current) {
        const htmlContent = generateHTMLContent();
        iframeRef.current.srcdoc = htmlContent;
      }
      toast({
        title: "Game started",
        description: "Your Phaser game is now running",
      });
    } catch (error) {
      console.error("Failed to run game:", error);
      toast({
        title: "Failed to run game",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 bg-secondary">
        <span className="text-sm font-medium">Game Preview</span>
        <Button 
          onClick={runGame} 
          size="sm" 
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <PlayIcon className="h-4 w-4 mr-2" />
          )}
          Run Game
        </Button>
      </div>
      <div className="flex-1 bg-black rounded-md overflow-hidden">
        <iframe 
          ref={iframeRef}
          title="Phaser Game Preview"
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin"
          srcDoc='<html><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#111;color:#666;font-family:sans-serif;text-align:center;"><div><div style="font-size:24px;margin-bottom:10px;">Phaser 3 Game Preview</div><div>Click "Run Game" to start</div></div></body></html>'
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

export default GamePreview;
