
import React, { useRef, useEffect } from 'react';
import { Asset } from './AssetManager';

interface GamePreviewProps {
  code: string;
  htmlTemplate?: string;
  assets: Asset[];
}

const GamePreview: React.FC<GamePreviewProps> = ({ code, htmlTemplate, assets }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Function to safely inject code into the iframe
  const injectCode = () => {
    if (!iframeRef.current) return;
    
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!doc) return;
    
    // If we have an HTML template, use it
    if (htmlTemplate) {
      // Parse the HTML template to extract the head and body content
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(htmlTemplate, 'text/html');
      
      // Clear and set new content
      doc.open();
      doc.write(htmlTemplate);
      
      // Inject the game code by replacing the script tag with game.js src
      const scripts = doc.querySelectorAll('script');
      scripts.forEach(script => {
        if (script.getAttribute('src') === 'game.js') {
          // Create a new script element with the game code
          const newScript = doc.createElement('script');
          newScript.textContent = code;
          script.parentNode?.replaceChild(newScript, script);
        }
      });
      
      // Add additional script to capture console logs
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
              
              ${code}
            </script>
          </body>
        </html>
      `);
      doc.close();
    }
  };

  // Update the iframe when the code or assets change
  useEffect(() => {
    injectCode();
  }, [code, htmlTemplate, assets]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 bg-secondary">
        <span className="text-sm font-medium">Game Preview</span>
      </div>
      <div className="flex-1 bg-slate-800">
        <iframe 
          ref={iframeRef}
          title="Game Preview"
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};

export default GamePreview;
