
import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlayIcon, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface GamePreviewProps {
  code: string;
  assets: {name: string, url: string}[];
}

const GamePreview: React.FC<GamePreviewProps> = ({ code, assets }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateHTMLContent = () => {
    // Create asset preload code
    const assetPreloadCode = assets.map(asset => {
      const extension = asset.name.split('.').pop()?.toLowerCase() || '';
      
      // Determine asset type
      if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
        return `this.load.image('${asset.name}', '${asset.url}');`;
      } else if (['mp3', 'ogg', 'wav'].includes(extension)) {
        return `this.load.audio('${asset.name}', '${asset.url}');`;
      } else if (['json'].includes(extension)) {
        return `this.load.tilemapTiledJSON('${asset.name}', '${asset.url}');`;
      } else {
        return `// Unsupported file type: ${asset.name}`;
      }
    }).join('\n        ');

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
    // Wrap user code in try-catch to prevent silent errors
    try {
      // Add asset preloading to user code if needed
      const userCode = \`${code}\`;
      
      // Replace the preload function if it exists
      if (userCode.includes('preload()') && ${assets.length > 0}) {
        // Extract the preload function content
        let preloadMatch = userCode.match(/preload\\(\\)[^{]*{([^}]*)}/);
        
        if (preloadMatch && preloadMatch[1]) {
          const preloadContent = preloadMatch[1];
          const newPreload = \`preload() {
        ${assetPreloadCode}
        ${preloadContent}
      }\`;
          
          // Replace the preload function
          eval(userCode.replace(/preload\\(\\)[^{]*{([^}]*)}/s, newPreload));
        } else {
          eval(userCode);
        }
      } else {
        eval(userCode);
      }
    } catch (error) {
      console.error('Error in game code:', error);
      document.body.innerHTML = '<div style="color: red; padding: 20px; font-family: monospace;"><h3>Error in game code:</h3><pre>' + error.toString() + '</pre></div>';
    }
  </script>
</body>
</html>
    `;
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
    } finally {
      setIsLoading(false);
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
          sandbox="allow-scripts"
          srcDoc='<html><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#111;color:#666;font-family:sans-serif;text-align:center;"><div><div style="font-size:24px;margin-bottom:10px;">Phaser 3 Game Preview</div><div>Click "Run Game" to start</div></div></body></html>'
        />
      </div>
    </div>
  );
};

export default GamePreview;
