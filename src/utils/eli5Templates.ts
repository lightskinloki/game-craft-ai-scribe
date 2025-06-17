
export interface ELI5Template {
  context: string;
  systemPrompt: string;
  examplePrompts: string[];
}

export const eli5Templates: Record<string, ELI5Template> = {
  phaser_basics: {
    context: "Basic Phaser 3 game development concepts",
    systemPrompt: "You are explaining Phaser 3 game development to a 5-year-old. Use simple words, fun analogies, and break down complex concepts into bite-sized pieces. Compare game development to things kids understand like toys, building blocks, or playground activities.",
    examplePrompts: [
      "Think of a game scene like a playground - it's where all the fun happens!",
      "Sprites are like digital stickers that can move around on your screen",
      "Physics in games is like making your toys follow rules, like balls bouncing or things falling down"
    ]
  },
  sprites: {
    context: "Sprite creation and animation",
    systemPrompt: "Explain sprites like they're digital paper dolls or stickers that can move, change costumes, and do tricks on the computer screen. Use simple language about making characters come alive.",
    examplePrompts: [
      "A sprite is like a digital puppet that you can make dance on your screen",
      "Animation is like flipping through a flipbook really fast to make pictures move"
    ]
  },
  physics: {
    context: "Game physics and collisions",
    systemPrompt: "Describe game physics like the rules of a playground - what happens when things bump into each other, how fast things move, and why things fall down. Make it sound like fun experiments.",
    examplePrompts: [
      "Collision detection is like your computer knowing when two toy cars crash into each other",
      "Gravity in games works just like when you drop a ball - it always falls down!"
    ]
  },
  input: {
    context: "Player input and controls",
    systemPrompt: "Explain game controls like teaching someone how to use a TV remote or play with a toy. Focus on how pressing buttons makes things happen in the game world.",
    examplePrompts: [
      "Game controls are like magic buttons that make your character do what you want",
      "When you press the arrow keys, it's like telling your game character which way to walk"
    ]
  },
  scenes: {
    context: "Game scenes and state management",
    systemPrompt: "Describe game scenes like different rooms in a house or different areas in a playground. Each scene is a different place where different things happen.",
    examplePrompts: [
      "Game scenes are like different rooms - you might have a menu room, a playing room, and a game over room",
      "Switching scenes is like walking from your bedroom to the kitchen"
    ]
  }
};

export const detectGameConcept = (prompt: string): string => {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('sprite') || lowerPrompt.includes('character') || lowerPrompt.includes('animation')) {
    return 'sprites';
  }
  if (lowerPrompt.includes('physics') || lowerPrompt.includes('collision') || lowerPrompt.includes('bounce') || lowerPrompt.includes('gravity')) {
    return 'physics';
  }
  if (lowerPrompt.includes('input') || lowerPrompt.includes('keyboard') || lowerPrompt.includes('mouse') || lowerPrompt.includes('control')) {
    return 'input';
  }
  if (lowerPrompt.includes('scene') || lowerPrompt.includes('state') || lowerPrompt.includes('menu') || lowerPrompt.includes('level')) {
    return 'scenes';
  }
  
  return 'phaser_basics';
};

export const generateELI5Prompt = (originalPrompt: string, isELI5Mode: boolean): string => {
  if (!isELI5Mode) {
    return originalPrompt;
  }
  
  const concept = detectGameConcept(originalPrompt);
  const template = eli5Templates[concept];
  
  return `${template.systemPrompt}

User's question: ${originalPrompt}

Please explain this in a way a 5-year-old would understand, using simple words and fun examples. Focus on the basics and make it engaging!`;
};
