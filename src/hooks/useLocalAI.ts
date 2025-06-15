
import { useState, useEffect, useCallback } from 'react';
import { pipeline } from '@huggingface/transformers';

interface LocalAIState {
  isLoading: boolean;
  isAvailable: boolean;
  modelName: string | null;
  modelType: 'gguf' | 'safetensors' | null;
  error: string | null;
  loadProgress: number;
  recommendation: 'low' | 'mid' | 'high' | null;
  canHotSwap: boolean;
}

interface ModelCompatibility {
  compatible: boolean;
  reason: string;
  recommendation?: string;
}

interface UploadedModel {
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export const useLocalAI = () => {
  const [state, setState] = useState<LocalAIState>({
    isLoading: false,
    isAvailable: false,
    modelName: null,
    modelType: null,
    error: null,
    loadProgress: 0,
    recommendation: null,
    canHotSwap: false,
  });
  
  const [pipeline_, setPipeline] = useState<any>(null);

  // Enhanced hardware detection for better recommendations
  const detectHardware = useCallback(async () => {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = 'deviceMemory' in navigator 
      ? (navigator as any).deviceMemory * 1024 
      : 8192;
    const webGPU = 'gpu' in navigator;

    let recommendation: 'low' | 'mid' | 'high' = 'low';
    if (memory >= 32768 && cores >= 8) {
      recommendation = 'high';
    } else if (memory >= 16384 && cores >= 4) {
      recommendation = 'mid';
    }

    return { cores, memory, webGPU, recommendation };
  }, []);

  // Get uploaded models from storage
  const getUploadedModels = useCallback((): UploadedModel[] => {
    try {
      const availableModels = sessionStorage.getItem('availableModels');
      return availableModels ? JSON.parse(availableModels) : [];
    } catch (error) {
      console.error('Error reading uploaded models:', error);
      return [];
    }
  }, []);

  // Enhanced model scanning and initialization
  useEffect(() => {
    const initializeModel = async () => {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null, 
        loadProgress: 0,
        canHotSwap: false 
      }));
      
      try {
        // Detect hardware for better recommendations
        const hardware = await detectHardware();
        
        setState(prev => ({ 
          ...prev, 
          recommendation: hardware.recommendation,
          loadProgress: 10 
        }));

        // Get uploaded models first
        const uploadedModels = getUploadedModels();
        
        // Enhanced model configurations with uploaded models first
        const modelConfigs = [
          // Uploaded models (prioritized)
          ...uploadedModels.map(model => ({
            name: model.name,
            path: model.url,
            type: model.type.includes('gguf') ? 'gguf' as const : 'safetensors' as const,
            size: `${(model.size / (1024 * 1024 * 1024)).toFixed(1)}B`,
            source: 'uploaded' as const
          })),
          // Public directory models (fallback)
          { name: 'model.gguf', path: '/models/model.gguf', type: 'gguf' as const, size: 'unknown', source: 'public' as const },
          { name: 'tinyllama-1.1b-chat-q4_0.gguf', path: '/models/tinyllama-1.1b-chat-q4_0.gguf', type: 'gguf' as const, size: '1.5B', source: 'public' as const },
          { name: 'phi-3-mini-4k-instruct-q4.gguf', path: '/models/phi-3-mini-4k-instruct-q4.gguf', type: 'gguf' as const, size: '3.8B', source: 'public' as const },
          { name: 'llama-2-7b-chat.q4_0.gguf', path: '/models/llama-2-7b-chat.q4_0.gguf', type: 'gguf' as const, size: '7B', source: 'public' as const },
          { name: 'mistral-7b-instruct-v0.1.q4_0.gguf', path: '/models/mistral-7b-instruct-v0.1.q4_0.gguf', type: 'gguf' as const, size: '7B', source: 'public' as const },
          { name: 'qwen-1_8b-chat-q4_0.gguf', path: '/models/qwen-1_8b-chat-q4_0.gguf', type: 'gguf' as const, size: '1.8B', source: 'public' as const },
          // SafeTensors models
          { name: 'model.safetensors', path: '/models/model.safetensors', type: 'safetensors' as const, size: 'unknown', source: 'public' as const },
          { name: 'pytorch_model.safetensors', path: '/models/pytorch_model.safetensors', type: 'safetensors' as const, size: 'unknown', source: 'public' as const },
        ];
        
        let modelLoaded = false;
        let loadedModelName = '';
        let loadedModelType: 'gguf' | 'safetensors' | null = null;
        
        setState(prev => ({ ...prev, loadProgress: 20 }));
        
        for (const modelConfig of modelConfigs) {
          try {
            console.log(`Attempting to load ${modelConfig.type.toUpperCase()} model: ${modelConfig.name} (${modelConfig.size}) from ${modelConfig.source}`);
            
            setState(prev => ({ ...prev, loadProgress: 30 }));
            
            // Enhanced loading with better device selection
            const deviceOptions = [];
            if (hardware.webGPU) deviceOptions.push('webgpu');
            deviceOptions.push('wasm');
            
            let textGenerator = null;
            
            for (const device of deviceOptions) {
              try {
                console.log(`Trying device: ${device} for model: ${modelConfig.name}`);
                setState(prev => ({ ...prev, loadProgress: 40 }));
                
                textGenerator = await pipeline('text-generation', modelConfig.path, {
                  device: device,
                  dtype: device === 'webgpu' ? 'fp16' : 'fp32',
                  progress_callback: (progress: any) => {
                    const progressPercent = Math.min(90, Math.max(40, progress.progress * 50 + 40));
                    setState(prev => ({ ...prev, loadProgress: progressPercent }));
                  }
                });
                
                console.log(`Successfully loaded ${modelConfig.name} on ${device}`);
                break;
              } catch (deviceError) {
                console.log(`Failed on ${device} for ${modelConfig.name}:`, deviceError);
                continue;
              }
            }
            
            if (!textGenerator) {
              throw new Error('Failed to load on any device');
            }
            
            setPipeline(textGenerator);
            loadedModelName = modelConfig.name;
            loadedModelType = modelConfig.type;
            modelLoaded = true;
            
            console.log(`Successfully loaded ${modelConfig.type.toUpperCase()} model: ${modelConfig.name}`);
            break;
          } catch (error) {
            console.log(`Model ${modelConfig.name} failed:`, error);
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
          canHotSwap: modelLoaded,
          error: modelLoaded ? null : getDetailedError(hardware.recommendation, uploadedModels.length > 0),
        }));
        
      } catch (error) {
        console.error('Error initializing local AI:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAvailable: false,
          loadProgress: 0,
          canHotSwap: false,
          error: `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }));
      }
    };

    initializeModel();
  }, [detectHardware, getUploadedModels]);

  // Helper function for detailed error messages
  const getDetailedError = (recommendation: 'low' | 'mid' | 'high', hasUploadedModels: boolean) => {
    const recommendations = {
      low: 'For your hardware, try: TinyLlama-1.1B (tinyllama-1.1b-chat-q4_0.gguf) or Qwen-1.8B (qwen-1_8b-chat-q4_0.gguf)',
      mid: 'For your hardware, try: Phi-3-Mini (phi-3-mini-4k-instruct-q4.gguf) or Mistral-7B (mistral-7b-instruct-v0.1.q4_0.gguf)',
      high: 'Your hardware can handle larger models. Try Llama-2-7B (llama-2-7b-chat.q4_0.gguf) or similar 7B+ models'
    };
    
    const baseMessage = hasUploadedModels 
      ? 'Unable to load uploaded models. Check browser console for details.' 
      : `No compatible models found. ${recommendations[recommendation]}.`;
    
    return `${baseMessage} Place GGUF or SafeTensors models in /public/models/ or use the Upload Model feature.`;
  };

  // Enhanced text generation with better error handling
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
        promptLength: prompt.length
      });
      
      const startTime = Date.now();
      
      const result = await pipeline_(prompt, {
        max_new_tokens: options?.maxTokens || 500,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP || 0.9,
        do_sample: true,
        repetition_penalty: 1.1,
        pad_token_id: 50256,
        eos_token_id: 2,
      });
      
      const generationTime = Date.now() - startTime;
      console.log(`Generation completed in ${generationTime}ms`);
      
      // Enhanced response processing
      let generatedText = '';
      if (Array.isArray(result)) {
        generatedText = result[0]?.generated_text || '';
      } else {
        generatedText = result?.generated_text || '';
      }
      
      if (!generatedText) {
        throw new Error('No text generated by local model');
      }
      
      // Clean up the response more intelligently
      let responseText = generatedText;
      if (responseText.startsWith(prompt)) {
        responseText = responseText.slice(prompt.length);
      }
      
      responseText = responseText.trim();
      
      if (!responseText) {
        throw new Error('Generated text is empty after cleanup');
      }
      
      return responseText;
      
    } catch (error) {
      console.error('Local AI generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown generation error';
      throw new Error(`Local AI generation failed: ${errorMessage}`);
    }
  }, [pipeline_, state.isAvailable, state.modelName, state.modelType]);

  // Enhanced model compatibility checking
  const checkModelCompatibility = useCallback((): ModelCompatibility => {
    if (!state.isAvailable) {
      return { 
        compatible: false, 
        reason: 'No model loaded',
        recommendation: state.error || 'Place a compatible model in /public/models/'
      };
    }
    
    const supportedFormats = ['gguf', 'safetensors'];
    if (!state.modelType || !supportedFormats.includes(state.modelType)) {
      return { 
        compatible: false, 
        reason: 'Unsupported model format',
        recommendation: 'Use GGUF or SafeTensors format models'
      };
    }
    
    return { 
      compatible: true, 
      reason: `${state.modelType.toUpperCase()} model is fully compatible` 
    };
  }, [state.isAvailable, state.modelType, state.error]);

  // Hot-swap model functionality
  const swapModel = useCallback(async (modelName: string) => {
    if (!state.canHotSwap) {
      throw new Error('Hot-swapping not available');
    }
    
    setState(prev => ({ ...prev, isLoading: true, loadProgress: 0 }));
    
    try {
      const modelPath = `/models/${modelName}`;
      const newPipeline = await pipeline('text-generation', modelPath, {
        device: 'webgpu',
        dtype: 'fp16',
        progress_callback: (progress: any) => {
          const progressPercent = Math.min(100, progress.progress * 100);
          setState(prev => ({ ...prev, loadProgress: progressPercent }));
        }
      });
      
      setPipeline(newPipeline);
      setState(prev => ({
        ...prev,
        isLoading: false,
        modelName: modelName,
        loadProgress: 100,
        error: null
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        loadProgress: 0,
        error: `Failed to swap to ${modelName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
      throw error;
    }
  }, [state.canHotSwap]);

  return {
    ...state,
    generateText,
    checkModelCompatibility,
    swapModel,
  };
};
