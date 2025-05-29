
import { useState, useEffect, useCallback } from 'react';
import { pipeline } from '@huggingface/transformers';

interface LocalAIState {
  isLoading: boolean;
  isAvailable: boolean;
  modelName: string | null;
  modelType: 'gguf' | 'safetensors' | null;
  error: string | null;
  loadProgress: number;
}

export const useLocalAI = () => {
  const [state, setState] = useState<LocalAIState>({
    isLoading: false,
    isAvailable: false,
    modelName: null,
    modelType: null,
    error: null,
    loadProgress: 0,
  });
  
  const [pipeline_, setPipeline] = useState<any>(null);

  // Enhanced model scanning and initialization
  useEffect(() => {
    const initializeModel = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null, loadProgress: 0 }));
      
      try {
        // Comprehensive list of model files to scan for
        const modelConfigs = [
          // GGUF models (prioritized for better local performance)
          { name: 'model.gguf', type: 'gguf' as const },
          { name: 'chat-model.gguf', type: 'gguf' as const },
          { name: 'llama.gguf', type: 'gguf' as const },
          { name: 'phi.gguf', type: 'gguf' as const },
          { name: 'gemma.gguf', type: 'gguf' as const },
          { name: 'mistral.gguf', type: 'gguf' as const },
          { name: 'qwen.gguf', type: 'gguf' as const },
          // SafeTensors models
          { name: 'model.safetensors', type: 'safetensors' as const },
          { name: 'chat-model.safetensors', type: 'safetensors' as const },
          { name: 'llama.safetensors', type: 'safetensors' as const },
          { name: 'phi.safetensors', type: 'safetensors' as const },
          { name: 'gemma.safetensors', type: 'safetensors' as const },
          { name: 'pytorch_model.safetensors', type: 'safetensors' as const },
          { name: 'mistral.safetensors', type: 'safetensors' as const },
          { name: 'qwen.safetensors', type: 'safetensors' as const },
        ];
        
        let modelLoaded = false;
        let loadedModelName = '';
        let loadedModelType: 'gguf' | 'safetensors' | null = null;
        
        for (const modelConfig of modelConfigs) {
          try {
            const modelPath = `/models/${modelConfig.name}`;
            console.log(`Attempting to load local ${modelConfig.type.toUpperCase()} model: ${modelPath}`);
            
            setState(prev => ({ ...prev, loadProgress: 25 }));
            
            // Try to load the model with optimized settings
            const textGenerator = await pipeline('text-generation', modelPath, {
              device: 'webgpu', // Primary: WebGPU for best performance
              dtype: 'fp16', // Use half precision for better performance
              progress_callback: (progress: any) => {
                const progressPercent = Math.min(100, Math.max(25, progress.progress * 75 + 25));
                setState(prev => ({ ...prev, loadProgress: progressPercent }));
              }
            });
            
            setPipeline(textGenerator);
            loadedModelName = modelConfig.name;
            loadedModelType = modelConfig.type;
            modelLoaded = true;
            console.log(`Successfully loaded local ${modelConfig.type.toUpperCase()} model: ${modelConfig.name}`);
            break;
          } catch (error) {
            console.log(`Model ${modelConfig.name} not found or failed to load:`, error);
            continue;
          }
        }
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAvailable: modelLoaded,
          modelName: loadedModelName || null,
          modelType: loadedModelType,
          loadProgress: modelLoaded ? 100 : 0,
          error: modelLoaded ? null : 'No local models found. Please place GGUF or SafeTensors models in /public/models/',
        }));
        
      } catch (error) {
        console.error('Error initializing local AI:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAvailable: false,
          loadProgress: 0,
          error: error instanceof Error ? error.message : 'Failed to initialize local AI',
        }));
      }
    };

    initializeModel();
  }, []);

  // Enhanced text generation with better configuration
  const generateText = useCallback(async (prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
  }): Promise<string> => {
    if (!pipeline_ || !state.isAvailable) {
      throw new Error('Local AI model not available. Please ensure a compatible model is loaded.');
    }

    try {
      console.log('Generating text with local model...', {
        model: state.modelName,
        type: state.modelType,
        prompt: prompt.substring(0, 100) + '...'
      });
      
      const result = await pipeline_(prompt, {
        max_new_tokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP || 0.9,
        do_sample: true,
        repetition_penalty: 1.1,
        pad_token_id: 50256, // Common pad token
      });
      
      // Extract generated text with better handling
      let generatedText = '';
      if (Array.isArray(result)) {
        generatedText = result[0]?.generated_text || '';
      } else {
        generatedText = result?.generated_text || '';
      }
      
      if (!generatedText) {
        throw new Error('No text generated by local model');
      }
      
      // Clean up the response
      let responseText = generatedText;
      if (responseText.startsWith(prompt)) {
        responseText = responseText.slice(prompt.length);
      }
      
      responseText = responseText.trim();
      return responseText || generatedText;
      
    } catch (error) {
      console.error('Local AI generation error:', error);
      throw new Error(`Local AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [pipeline_, state.isAvailable, state.modelName, state.modelType]);

  // Function to check model compatibility
  const checkModelCompatibility = useCallback(() => {
    if (!state.isAvailable) return { compatible: false, reason: 'No model loaded' };
    
    // Basic compatibility checks
    const supportedFormats = ['gguf', 'safetensors'];
    if (!state.modelType || !supportedFormats.includes(state.modelType)) {
      return { compatible: false, reason: 'Unsupported model format' };
    }
    
    return { compatible: true, reason: 'Model is compatible' };
  }, [state.isAvailable, state.modelType]);

  return {
    ...state,
    generateText,
    checkModelCompatibility,
  };
};
