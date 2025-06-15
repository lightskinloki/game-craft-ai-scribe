
import { generateCode } from '@/utils/ai/generalAI';
import { generatePhaserCode } from '@/utils/ai/phaserAI';

export type EditorMode = 'general' | 'phaser';

export class AIService {
  private static instance: AIService;
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateCode(prompt: string, mode: EditorMode): Promise<string> {
    try {
      console.log(`Generating ${mode} code for prompt:`, prompt.substring(0, 100) + '...');
      
      let result: string;
      if (mode === 'phaser') {
        result = await generatePhaserCode(prompt);
      } else {
        result = await generateCode(prompt);
      }
      
      // Basic validation - ensure we got some content
      if (!result || result.trim().length < 10) {
        throw new Error('Generated code is too short or empty');
      }
      
      return result;
    } catch (error) {
      console.error('AI Service error:', error);
      throw error;
    }
  }

  async validateCode(code: string): Promise<{ isValid: boolean; errors?: string[] }> {
    try {
      // Basic JavaScript syntax validation
      new Function(code);
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        errors: [error instanceof Error ? error.message : 'Unknown syntax error'] 
      };
    }
  }
}

export const aiService = AIService.getInstance();
