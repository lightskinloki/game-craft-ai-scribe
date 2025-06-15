
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Cpu, HardDrive, Monitor, Zap, Info, CheckCircle, AlertCircle } from 'lucide-react';

interface HardwareInfo {
  cores: number;
  memory: number;
  gpu: string;
  webGPU: boolean;
  recommendation: 'low' | 'mid' | 'high';
  score: number;
}

interface ModelRecommendation {
  name: string;
  size: string;
  filename: string;
  description: string;
  requirements: string;
}

const EnhancedHardwareDetection: React.FC = () => {
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [modelRecommendations, setModelRecommendations] = useState<ModelRecommendation[]>([]);

  useEffect(() => {
    const detectHardware = async () => {
      try {
        const cores = navigator.hardwareConcurrency || 4;
        const memory = 'deviceMemory' in navigator 
          ? (navigator as any).deviceMemory * 1024 
          : 8192;

        const webGPU = 'gpu' in navigator;
        
        let gpu = 'Unknown';
        if (webGPU) {
          try {
            const adapter = await (navigator as any).gpu?.requestAdapter();
            if (adapter) {
              gpu = 'WebGPU Compatible';
            } else {
              gpu = 'Basic Graphics';
            }
          } catch {
            gpu = 'Basic Graphics';
          }
        }

        // Enhanced scoring system
        let score = 0;
        score += Math.min(cores * 10, 80); // Max 80 points for CPU
        score += Math.min((memory / 1024) * 5, 100); // Max 100 points for RAM
        score += webGPU ? 50 : 0; // 50 points for WebGPU

        let recommendation: 'low' | 'mid' | 'high' = 'low';
        if (score >= 180) {
          recommendation = 'high';
        } else if (score >= 120) {
          recommendation = 'mid';
        }

        const hardwareInfo = {
          cores,
          memory,
          gpu,
          webGPU,
          recommendation,
          score
        };

        setHardware(hardwareInfo);
        setModelRecommendations(getModelRecommendations(recommendation));
      } catch (error) {
        console.error('Hardware detection failed:', error);
      } finally {
        setLoading(false);
      }
    };

    detectHardware();
  }, []);

  const getModelRecommendations = (level: 'low' | 'mid' | 'high'): ModelRecommendation[] => {
    const recommendations = {
      low: [
        {
          name: 'TinyLlama 1.1B',
          size: '1.5GB',
          filename: 'tinyllama-1.1b-chat-q4_0.gguf',
          description: 'Fast, lightweight model perfect for basic code assistance',
          requirements: '4GB RAM minimum'
        },
        {
          name: 'Qwen 1.8B',
          size: '1.8GB',
          filename: 'qwen-1_8b-chat-q4_0.gguf',
          description: 'Balanced performance for code generation and chat',
          requirements: '4GB RAM minimum'
        }
      ],
      mid: [
        {
          name: 'Phi-3 Mini',
          size: '3.8GB',
          filename: 'phi-3-mini-4k-instruct-q4.gguf',
          description: 'Microsoft\'s efficient model with strong coding capabilities',
          requirements: '8GB RAM recommended'
        },
        {
          name: 'Mistral 7B',
          size: '7GB',
          filename: 'mistral-7b-instruct-v0.1.q4_0.gguf',
          description: 'High-quality responses with good reasoning',
          requirements: '12GB RAM recommended'
        }
      ],
      high: [
        {
          name: 'Llama-2 7B',
          size: '7GB',
          filename: 'llama-2-7b-chat.q4_0.gguf',
          description: 'Meta\'s powerful model for complex tasks',
          requirements: '16GB RAM recommended'
        },
        {
          name: 'Custom Large Models',
          size: '13GB+',
          filename: 'your-custom-model.gguf',
          description: 'Advanced models for specialized requirements',
          requirements: '32GB RAM recommended'
        }
      ]
    };

    return recommendations[level];
  };

  const getRecommendationColor = (level: 'low' | 'mid' | 'high') => {
    switch (level) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'mid':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'high':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Enhanced Hardware Analysis
          </CardTitle>
          <CardDescription>Analyzing system performance...</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={33} className="mb-4" />
          <div className="animate-pulse space-y-3">
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
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Hardware Detection Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Unable to detect hardware. Using conservative recommendations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Enhanced Hardware Analysis
        </CardTitle>
        <CardDescription>
          System performance score: {hardware.score}/230
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Performance Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Performance Score</span>
              <Badge className={getRecommendationColor(hardware.recommendation)}>
                {hardware.recommendation.toUpperCase()} TIER
              </Badge>
            </div>
            <Progress value={(hardware.score / 230) * 100} className="h-2" />
          </div>

          {/* Hardware Specs Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Cpu className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">{hardware.cores} CPU Cores</div>
                <div className="text-sm text-muted-foreground">
                  {hardware.cores >= 8 ? 'Excellent' : hardware.cores >= 4 ? 'Good' : 'Limited'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <HardDrive className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">{(hardware.memory / 1024).toFixed(1)}GB RAM</div>
                <div className="text-sm text-muted-foreground">
                  {hardware.memory >= 16384 ? 'Excellent' : hardware.memory >= 8192 ? 'Good' : 'Limited'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
              <Monitor className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">{hardware.gpu}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  {hardware.webGPU ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      WebGPU Ready
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                      CPU Only
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Model Recommendations */}
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <div className="font-medium">
                  Recommended Models for Your Hardware:
                </div>
                
                <div className="space-y-3">
                  {modelRecommendations.map((model, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-background">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{model.name}</div>
                        <Badge variant="outline">{model.size}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {model.description}
                      </p>
                      <div className="flex justify-between items-center text-xs">
                        <code className="bg-muted px-2 py-1 rounded">
                          {model.filename}
                        </code>
                        <span className="text-muted-foreground">
                          {model.requirements}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {hardware.webGPU && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-3">
                    <CheckCircle className="h-4 w-4" />
                    WebGPU acceleration will significantly improve performance
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedHardwareDetection;
