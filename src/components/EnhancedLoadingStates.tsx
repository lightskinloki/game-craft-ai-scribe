
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Cpu, Zap, Download } from 'lucide-react';

interface LoadingStateProps {
  type: 'ai-generation' | 'model-loading' | 'file-operation' | 'asset-upload';
  progress?: number;
  message?: string;
  details?: string;
}

export const EnhancedLoadingState: React.FC<LoadingStateProps> = ({
  type,
  progress = 0,
  message,
  details
}) => {
  const getLoadingConfig = () => {
    switch (type) {
      case 'ai-generation':
        return {
          icon: <Zap className="h-5 w-5 text-blue-500" />,
          title: 'AI Processing',
          defaultMessage: 'Generating code with AI...',
          color: 'bg-blue-500'
        };
      case 'model-loading':
        return {
          icon: <Cpu className="h-5 w-5 text-green-500" />,
          title: 'Loading Model',
          defaultMessage: 'Initializing local AI model...',
          color: 'bg-green-500'
        };
      case 'file-operation':
        return {
          icon: <Download className="h-5 w-5 text-purple-500" />,
          title: 'File Operation',
          defaultMessage: 'Processing files...',
          color: 'bg-purple-500'
        };
      case 'asset-upload':
        return {
          icon: <Download className="h-5 w-5 text-orange-500" />,
          title: 'Uploading Assets',
          defaultMessage: 'Uploading and processing assets...',
          color: 'bg-orange-500'
        };
      default:
        return {
          icon: <Zap className="h-5 w-5 text-gray-500" />,
          title: 'Processing',
          defaultMessage: 'Please wait...',
          color: 'bg-gray-500'
        };
    }
  };

  const config = getLoadingConfig();

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Animated Icon */}
          <div className={`p-3 rounded-full ${config.color}/10 animate-pulse`}>
            {config.icon}
          </div>

          {/* Title and Status */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h3 className="font-medium">{config.title}</h3>
              <Badge variant="outline" className="animate-pulse">
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {message || config.defaultMessage}
            </p>
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="w-full space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(progress)}% complete</span>
                <span>{details}</span>
              </div>
            </div>
          )}

          {/* Animated Dots for Indeterminate Progress */}
          {progress === 0 && (
            <div className="flex space-x-1">
              <div className={`w-2 h-2 ${config.color} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
              <div className={`w-2 h-2 ${config.color} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
              <div className={`w-2 h-2 ${config.color} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Skeleton loaders for different components
export const CodeEditorSkeleton: React.FC = () => (
  <div className="h-full p-4 space-y-3">
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-2/3" />
    <div className="space-y-2 mt-6">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  </div>
);

export const AssetManagerSkeleton: React.FC = () => (
  <div className="p-3 space-y-3">
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-20" />
    </div>
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center gap-3 p-2">
        <Skeleton className="h-10 w-10 rounded" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-6 rounded" />
      </div>
    ))}
  </div>
);

export const GamePreviewSkeleton: React.FC = () => (
  <div className="h-full flex items-center justify-center bg-secondary/20">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-secondary rounded animate-pulse mx-auto" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-3 w-48 mx-auto" />
      </div>
    </div>
  </div>
);

export default EnhancedLoadingState;
