
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cpu, HardDrive, Monitor, Zap, Info } from 'lucide-react';

interface HardwareInfo {
  cores: number;
  memory: number;
  gpu: string;
  webGPU: boolean;
  recommendation: 'low' | 'mid' | 'high';
}

const HardwareDetection: React.FC = () => {
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectHardware = async () => {
      try {
        // Detect CPU cores
        const cores = navigator.hardwareConcurrency || 4;
        
        // Estimate memory (this is approximate)
        const memory = 'deviceMemory' in navigator 
          ? (navigator as any).deviceMemory * 1024 
          : 8192; // Default to 8GB if not available

        // Check WebGPU support
        const webGPU = 'gpu' in navigator;
        
        // Basic GPU detection (limited in browsers)
        let gpu = 'Unknown';
        if (webGPU) {
          try {
            const adapter = await (navigator as any).gpu?.requestAdapter();
            gpu = adapter ? 'WebGPU Compatible' : 'Basic Graphics';
          } catch {
            gpu = 'Basic Graphics';
          }
        }

        // Determine recommendation based on detected specs
        let recommendation: 'low' | 'mid' | 'high' = 'low';
        if (memory >= 32768) { // 32GB+
          recommendation = 'high';
        } else if (memory >= 16384) { // 16GB+
          recommendation = 'mid';
        }

        setHardware({
          cores,
          memory,
          gpu,
          webGPU,
          recommendation
        });
      } catch (error) {
        console.error('Hardware detection failed:', error);
      } finally {
        setLoading(false);
      }
    };

    detectHardware();
  }, []);

  const getRecommendationText = (level: 'low' | 'mid' | 'high') => {
    switch (level) {
      case 'low':
        return {
          title: 'Budget Hardware',
          description: 'Recommended: 1.5B parameter models (TinyLlama, Qwen-1.8B)',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        };
      case 'mid':
        return {
          title: 'Mid-Range Hardware',
          description: 'Recommended: 7B parameter models (CodeLlama-7B, Mistral-7B)',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        };
      case 'high':
        return {
          title: 'High-End Hardware',
          description: 'Recommended: 13B+ parameter models or custom large models',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };
    }
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Hardware Detection
          </CardTitle>
          <CardDescription>Analyzing your system capabilities...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-secondary rounded w-3/4"></div>
            <div className="h-4 bg-secondary rounded w-1/2"></div>
            <div className="h-4 bg-secondary rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hardware) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Hardware Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Unable to detect hardware specifications. Default recommendations will be provided.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const recommendation = getRecommendationText(hardware.recommendation);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Hardware Detection
        </CardTitle>
        <CardDescription>
          System analysis and model recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Hardware Specs */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Cpu className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">{hardware.cores} CPU Cores</div>
                <div className="text-sm text-muted-foreground">Processing Power</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">{(hardware.memory / 1024).toFixed(1)}GB RAM</div>
                <div className="text-sm text-muted-foreground">Available Memory</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">{hardware.gpu}</div>
                <div className="text-sm text-muted-foreground">
                  {hardware.webGPU ? 'WebGPU Ready' : 'Basic Graphics'}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={recommendation.color}>
                    {recommendation.title}
                  </Badge>
                </div>
                <p>{recommendation.description}</p>
                {hardware.webGPU && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ WebGPU acceleration available for improved performance
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default HardwareDetection;
