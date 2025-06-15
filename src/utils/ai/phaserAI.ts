
import { useLocalAI } from '@/hooks/useLocalAI';

export const generatePhaserCode = async (prompt: string): Promise<string> => {
  try {
    // Get the local AI hook instance
    const { isAvailable, generateText } = useLocalAI();
    
    if (!isAvailable) {
      throw new Error('Local AI model not available. Using fallback response.');
    }

    // Create a Phaser-specific prompt
    const phaserPrompt = `You are a Phaser 3 game development expert. Generate clean, working Phaser 3 JavaScript code for the following request. Include proper Phaser structure and best practices. Only return code with brief comments:

${prompt}`;

    const generatedCode = await generateText(phaserPrompt, {
      maxTokens: 400,
      temperature: 0.4,
      topP: 0.85
    });

    return generatedCode;
  } catch (error) {
    console.error('Phaser AI generation error:', error);
    // Enhanced Phaser fallback with better structure
    return `// Generated Phaser code for: ${prompt}
// Note: Local AI model unavailable, using fallback

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function preload() {
  // Load assets for: ${prompt}
  // this.load.image('key', 'path/to/image.png');
}

function create() {
  // Create game objects for: ${prompt}
  // Implement your game logic here
}

function update() {
  // Game loop updates
}

const game = new Phaser.Game(config);`;
  }
};
