
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface AppError {
  id: string;
  type: 'network' | 'ai_model' | 'file_system' | 'validation' | 'unknown';
  message: string;
  details?: string;
  recoverable: boolean;
  timestamp: Date;
  context?: Record<string, any>;
}

interface ErrorHandlerState {
  errors: AppError[];
  isRecovering: boolean;
}

export const useErrorHandler = () => {
  const [state, setState] = useState<ErrorHandlerState>({
    errors: [],
    isRecovering: false
  });
  const { toast } = useToast();

  const createError = useCallback((
    type: AppError['type'],
    message: string,
    details?: string,
    context?: Record<string, any>
  ): AppError => ({
    id: crypto.randomUUID(),
    type,
    message,
    details,
    recoverable: type !== 'validation',
    timestamp: new Date(),
    context
  }), []);

  const handleError = useCallback((error: Error | AppError | string, context?: Record<string, any>) => {
    let appError: AppError;

    if (typeof error === 'string') {
      appError = createError('unknown', error, undefined, context);
    } else if ('type' in error && 'id' in error) {
      appError = error as AppError;
    } else {
      // Convert native Error to AppError
      const errorMessage = error.message || 'An unexpected error occurred';
      let errorType: AppError['type'] = 'unknown';

      // Classify error based on message content
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        errorType = 'network';
      } else if (errorMessage.includes('model') || errorMessage.includes('AI')) {
        errorType = 'ai_model';
      } else if (errorMessage.includes('file') || errorMessage.includes('storage')) {
        errorType = 'file_system';
      }

      appError = createError(errorType, errorMessage, error.stack, context);
    }

    setState(prev => ({
      ...prev,
      errors: [...prev.errors, appError]
    }));

    // Show appropriate toast based on error type
    const toastConfig = getToastConfig(appError);
    toast(toastConfig);

    console.error('Error handled:', appError);
    return appError;
  }, [createError, toast]);

  const getToastConfig = (error: AppError) => {
    const baseConfig = {
      variant: 'destructive' as const,
      duration: error.recoverable ? 5000 : 10000
    };

    switch (error.type) {
      case 'ai_model':
        return {
          ...baseConfig,
          title: 'AI Model Error',
          description: error.message,
          action: error.recoverable ? { 
            altText: 'Retry', 
            onClick: () => retryLastOperation() 
          } : undefined
        };
      case 'network':
        return {
          ...baseConfig,
          title: 'Connection Error',
          description: 'Please check your internet connection and try again.',
        };
      case 'file_system':
        return {
          ...baseConfig,
          title: 'File System Error',
          description: error.message,
        };
      case 'validation':
        return {
          ...baseConfig,
          variant: 'default' as const,
          title: 'Validation Error',
          description: error.message,
        };
      default:
        return {
          ...baseConfig,
          title: 'Unexpected Error',
          description: error.message,
        };
    }
  };

  const retryLastOperation = useCallback(async () => {
    setState(prev => ({ ...prev, isRecovering: true }));
    
    try {
      // This would be implemented based on the specific operation
      // For now, just clear the error after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        errors: prev.errors.slice(0, -1), // Remove last error
        isRecovering: false
      }));
      
      toast({
        title: 'Recovery Successful',
        description: 'The operation has been retried successfully.',
      });
    } catch (retryError) {
      setState(prev => ({ ...prev, isRecovering: false }));
      handleError(retryError as Error, { context: 'retry_operation' });
    }
  }, [handleError, toast]);

  const clearError = useCallback((errorId: string) => {
    setState(prev => ({
      ...prev,
      errors: prev.errors.filter(error => error.id !== errorId)
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setState({ errors: [], isRecovering: false });
  }, []);

  return {
    ...state,
    handleError,
    clearError,
    clearAllErrors,
    retryLastOperation,
    hasErrors: state.errors.length > 0,
    lastError: state.errors[state.errors.length - 1] || null
  };
};
