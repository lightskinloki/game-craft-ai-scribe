
import { useLocalAI } from '@/hooks/useLocalAI';

export const generateCode = async (prompt: string): Promise<string> => {
  try {
    // Get the local AI hook instance
    const { isAvailable, generateText } = useLocalAI();
    
    if (!isAvailable) {
      throw new Error('Local AI model not available. Using fallback response.');
    }

    // Create a code-focused prompt
    const codePrompt = `You are a helpful coding assistant. Generate clean, working JavaScript code for the following request. Only return the code with brief comments, no explanations:

${prompt}`;

    const generatedCode = await generateText(codePrompt, {
      maxTokens: 300,
      temperature: 0.3,
      topP: 0.9
    });

    return generatedCode;
  } catch (error) {
    console.error('General AI generation error:', error);
    // Fallback to a more structured placeholder
    return `// Generated code for: ${prompt}
// Note: Local AI model unavailable, using fallback
console.log('${prompt.replace(/'/g, "\\'")}');

// TODO: Implement the requested functionality
function handleRequest() {
  // Add your implementation here
}`;
  }
};
