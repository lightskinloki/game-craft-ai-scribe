
import React, { useRef, useState } from 'react';
import { Asset } from './AssetManager';
import { Button } from './ui/button';
import { PlayIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GamePreviewProps {
  files: { [filename: string]: string };
  assets: Asset[];
}

const GamePreview: React.FC<GamePreviewProps> = ({ files, assets }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Function to safely generate and inject code into the iframe
  const generateAndInjectHTML = () => {
    if (!iframeRef.current) {
      throw new Error("Iframe reference not available");
    }
    
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!doc) {
      throw new Error("Could not access iframe document");
    }
    
    // Use the HTML template if available, otherwise use default
    const htmlTemplate = files['index.html'] || '';
    
    if (htmlTemplate) {
      // Parse the HTML template to extract the head and body content
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(htmlTemplate, 'text/html');
      
      // Clear and set new content
      doc.open();
      doc.write(htmlTemplate);
      
      // Gather all JavaScript files
      const jsFiles = Object.entries(files).filter(([filename]) => filename.endsWith('.js'));
      
      // Find script tags with src attributes in the document
      const scripts = Array.from(doc.querySelectorAll('script[src]'));
      
      // Find the first script tag with game.js source or create insertion point
      let scriptInsertionPoint: HTMLElement | null = null;
      
      // Try to find the game.js script tag to use as insertion point
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src === 'game.js' || src?.includes('game.js')) {
          scriptInsertionPoint = script.parentElement;
          script.remove(); // Remove the original script tag
        }
      });
      
      // If no insertion point found, use body
      if (!scriptInsertionPoint && doc.body) {
        scriptInsertionPoint = doc.body;
      }
      
      // Add all JavaScript files as separate script tags
      if (scriptInsertionPoint) {
        jsFiles.forEach(([filename, code]) => {
          const script = doc.createElement('script');
          script.textContent = code;
          script.setAttribute('data-filename', filename);
          scriptInsertionPoint?.appendChild(script);
        });
      }
      
      // Add console logging capture script
      const consoleLogScript = doc.createElement('script');
      consoleLogScript.textContent = `
        // Capture console methods
        (function() {
          const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info
          };
          
          // Override console methods to send logs to parent
          console.log = function() {
            originalConsole.log.apply(console, arguments);
            window.parent.postMessage({
              type: 'console',
              method: 'log',
              args: Array.from(arguments).map(arg => {
                try {
                  return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
                } catch (e) {
                  return String(arg);
                }
              })
            }, '*');
          };
          
          console.warn = function() {
            originalConsole.warn.apply(console, arguments);
            window.parent.postMessage({
              type: 'console',
              method: 'warn',
              args: Array.from(arguments).map(arg => {
                try {
                  return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
                } catch (e) {
                  return String(arg);
                }
              })
            }, '*');
          };
          
          console.error = function() {
            originalConsole.error.apply(console, arguments);
            window.parent.postMessage({
              type: 'console',
              method: 'error',
              args: Array.from(arguments).map(arg => {
                try {
                  return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
                } catch (e) {
                  return String(arg);
                }
              })
            }, '*');
          };
          
          console.info = function() {
            originalConsole.info.apply(console, arguments);
            window.parent.postMessage({
              type: 'console',
              method: 'info',
              args: Array.from(arguments).map(arg => {
                try {
                  return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg);
                } catch (e) {
                  return String(arg);
                }
              })
            }, '*');
          };
          
          // Report errors
          window.addEventListener('error', function(e) {
            window.parent.postMessage({
              type: 'console',
              method: 'error',
              args: ["Error: " + e.message + " at " + e.filename + ":" + e.lineno + ":" + e.colno]
            }, '*');
          });
        })();
      `;
      
      // Ensure the body exists before appending the script
      if (doc.body) {
        doc.body.appendChild(consoleLogScript);
      } else {
        // If body doesn't exist yet, append the script content to the HTML
        const scriptHtml = `<script>${consoleLogScript.textContent}</script>`;
        doc.write(scriptHtml);
      }
      
      doc.close();
    } else {
      // Fallback to simpler approach if no HTML template is provided
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Game Preview</title>
            <style>
              body { margin: 0; overflow: hidden; background: #333; }
              canvas { display: block; margin: 0 auto; }
            </style>
            <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
          </head>
          <body>
            <script>
              // Capture console methods
              (function() {
                const originalConsole = {
                  log: console.log,
                  warn: console.warn,
                  error: console.error,
                  info: console.info
                };
                
                // Override console methods to send logs to parent
                console.log = function() {
                  originalConsole.log.apply(console, arguments);
                  window.parent.postMessage({
                    type: 'console',
                    method: 'log',
                    args: Array.from(arguments).map(arg => String(arg))
                  }, '*');
                };
                
                console.warn = function() {
                  originalConsole.warn.apply(console, arguments);
                  window.parent.postMessage({
                    type: 'console',
                    method: 'warn',
                    args: Array.from(arguments).map(arg => String(arg))
                  }, '*');
                };
                
                console.error = function() {
                  originalConsole.error.apply(console, arguments);
                  window.parent.postMessage({
                    type: 'console',
                    method: 'error',
                    args: Array.from(arguments).map(arg => String(arg))
                  }, '*');
                };
                
                console.info = function() {
                  originalConsole.info.apply(console, arguments);
                  window.parent.postMessage({
                    type: 'console',
                    method: 'info',
                    args: Array.from(arguments).map(arg => String(arg))
                  }, '*');
                };
                
                // Report errors
                window.addEventListener('error', function(e) {
                  window.parent.postMessage({
                    type: 'console',
                    method: 'error',
                    args: ["Error: " + e.message + " at " + e.filename + ":" + e.lineno + ":" + e.colno]
                  }, '*');
                });
              })();
            </script>
            ${Object.entries(files)
              .filter(([filename]) => filename.endsWith('.js'))
              .map(([filename, code]) => 
                `<script data-filename="${filename}">${code}</script>`
              ).join('\n')}
          </body>
        </html>
      `);
      doc.close();
    }
  };

  // Manual run game function
  const runGame = () => {
    console.log("Run Game clicked");
    setIsLoading(true);
    
    try {
      generateAndInjectHTML();
      toast({
        title: "Updating Preview",
        description: "Loading your game code...",
      });
    } catch (error) {
      console.error("Failed to prepare game preview:", error);
      toast({
        title: "Preview Error",
        description: error instanceof Error ? error.message : "Failed to update preview",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 bg-secondary">
        <span className="text-sm font-medium">Game Preview</span>
        <Button
          onClick={runGame}
          size="sm"
          disabled={isLoading}
          className="gap-1"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
          Run
        </Button>
      </div>
      <div className="flex-1 bg-slate-800">
        <iframe 
          ref={iframeRef}
          title="Game Preview"
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full border-0"
          onLoad={() => {
            console.log("Iframe finished loading");
            setIsLoading(false);
          }}
        />
      </div>
    </div>
  );
};

export default GamePreview;
