
import React, { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import Header from '@/components/Header';
import PromptInput from '@/components/PromptInput';
import AiOutput from '@/components/AiOutput';
import CodeEditor from '@/components/CodeEditor';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const { toast } = useToast();

  // This is a mock function to simulate the AI response
  // In a real implementation, this would make an API call to your backend
  const handlePromptSubmit = async (prompt: string) => {
    setIsProcessing(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Mock AI response
      const mockResponses: { [key: string]: { code: string; explanation: string } } = {
        "create a simple player movement script": {
          code: `// Simple player movement script for a 2D game
function Player() {
  // Player properties
  this.x = 0;
  this.y = 0;
  this.speed = 5;
  this.jumpForce = 10;
  this.gravity = 0.5;
  this.velocity = { x: 0, y: 0 };
  this.isGrounded = false;
  
  // Update function to be called every frame
  this.update = function() {
    // Apply horizontal movement
    if (input.isKeyPressed('ArrowLeft')) {
      this.velocity.x = -this.speed;
    } else if (input.isKeyPressed('ArrowRight')) {
      this.velocity.x = this.speed;
    } else {
      // Apply friction when no key is pressed
      this.velocity.x *= 0.8;
    }
    
    // Apply jumping when grounded
    if (input.isKeyPressed('Space') && this.isGrounded) {
      this.velocity.y = -this.jumpForce;
      this.isGrounded = false;
    }
    
    // Apply gravity
    this.velocity.y += this.gravity;
    
    // Update position
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    // Check for ground collision (simplified)
    if (this.y > groundLevel) {
      this.y = groundLevel;
      this.velocity.y = 0;
      this.isGrounded = true;
    }
    
    // Render the player
    render.drawRect(this.x, this.y, 32, 32);
  }
}

// Create and export player instance
const player = new Player();
export default player;`,
          explanation: `This code creates a basic 2D player controller with movement and jumping functionality.

Here's what each part does:

1. **Player Constructor**: Creates a player object with properties like position (x, y), speed, jump force, and gravity.

2. **Update Function**: Runs every frame of the game to:
   - Check for left/right arrow key inputs and apply horizontal movement
   - Check for spacebar input to jump when the player is on the ground
   - Apply physics like gravity and friction
   - Update the player's position based on velocity
   - Check for ground collision to prevent falling through the floor
   - Render the player as a rectangle

3. **Movement Controls**:
   - Left/Right arrows move the player horizontally
   - Spacebar makes the player jump
   - When no keys are pressed, friction slows the player down

This is a fundamental component in 2D platformer games, establishing the core movement mechanics that players will use to interact with your game world.

To integrate this with a complete game, you would need to:
1. Add an input handling system
2. Create a rendering system
3. Define the ground level
4. Call the player's update function in your game loop`
        },
        "create a simple enemy ai": {
          code: `// Basic enemy AI for a 2D game
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.speed = 2;
    this.direction = 1; // 1 for right, -1 for left
    this.detectionRange = 200;
    this.health = 100;
    this.attackDamage = 10;
    this.attackCooldown = 0;
    this.maxAttackCooldown = 60; // frames (1 second at 60 FPS)
  }

  update(player) {
    // Decrease attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }
    
    // Calculate distance to player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If player is within detection range
    if (distance < this.detectionRange) {
      // Chase the player
      this.direction = dx > 0 ? 1 : -1;
      
      // Move towards player
      this.x += this.direction * this.speed;
      
      // Attack if close enough and cooldown is ready
      if (distance < this.width + player.width && this.attackCooldown === 0) {
        this.attack(player);
        this.attackCooldown = this.maxAttackCooldown;
      }
    } else {
      // Patrol back and forth
      this.x += this.direction * this.speed * 0.5;
      
      // Change direction if hit a boundary (simplified)
      if (this.x < 0 || this.x > 800) {
        this.direction *= -1;
      }
    }
    
    // Render the enemy
    const color = distance < this.detectionRange ? 'red' : 'orange';
    render.drawRect(this.x, this.y, this.width, this.height, color);
  }
  
  attack(player) {
    // Deal damage to player
    player.takeDamage(this.attackDamage);
    console.log('Enemy attacked player for ' + this.attackDamage + ' damage!');
  }
  
  takeDamage(amount) {
    this.health -= amount;
    
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    console.log('Enemy defeated!');
    // In a real game, you would remove the enemy from the game world
    // and maybe spawn some particles or play a sound
  }
}

// Create an enemy at position (400, 300)
const enemy = new Enemy(400, 300);
export default enemy;`,
          explanation: `This code implements a basic enemy AI system for a 2D game. Let me explain its key components:

1. **Enemy Class**: Creates an enemy with properties like position, size, health, and movement speed.

2. **AI Behavior States**:
   - **Patrolling**: When the player is out of range, the enemy moves back and forth within boundaries
   - **Chasing**: When the player enters the detection range, the enemy moves directly toward them
   - **Attacking**: When close enough to the player, the enemy attacks and deals damage

3. **Key Methods**:
   - **update()**: Called every frame to update the enemy's position and behavior based on the player's position
   - **attack()**: Deals damage to the player when in range and attack cooldown is ready
   - **takeDamage()**: Reduces enemy health when hit by the player
   - **die()**: Handles enemy defeat logic

4. **AI Decision Making**:
   - Uses distance calculations to determine if the player is within detection range
   - Changes color from orange to red when alerted to the player's presence
   - Implements a cooldown system to prevent constant attacks

This is a foundation for enemy behavior in many 2D games. You can extend this with:
1. Different enemy types with varying stats and behaviors
2. More complex patrolling paths
3. Ranged attacks
4. Different attack patterns
5. Visual indicators for alert states

To incorporate this into your game, you'll need to:
1. Create a game loop that calls the enemy's update method
2. Pass the player object to the update method
3. Implement the player's takeDamage method
4. Create a rendering system`
        },
        "make a simple game loop": {
          code: `// Game Engine with main loop
class GameEngine {
  constructor() {
    // Game state
    this.entities = [];
    this.player = null;
    
    // Timing variables
    this.lastTimestamp = 0;
    this.deltaTime = 0;
    
    // Game status
    this.isRunning = false;
    this.isPaused = false;
    
    // Performance monitoring
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    
    // Bind methods to this
    this.gameLoop = this.gameLoop.bind(this);
  }
  
  // Initialize the game
  init() {
    console.log('Initializing game...');
    
    // Set up canvas (assuming HTML5 canvas)
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Set up input handlers
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Initialize player and add to entities
    this.player = createPlayer(100, 100); // Assuming createPlayer is defined elsewhere
    this.addEntity(this.player);
    
    // Initialize other game objects
    this.createInitialEnemies();
    
    console.log('Game initialized successfully');
    return this;
  }
  
  // Start the game loop
  start() {
    if (this.isRunning) return;
    
    console.log('Starting game loop');
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.lastFpsUpdate = this.lastTimestamp;
    requestAnimationFrame(this.gameLoop);
    return this;
  }
  
  // Pause the game
  pause() {
    this.isPaused = true;
    console.log('Game paused');
    return this;
  }
  
  // Resume the game
  resume() {
    this.isPaused = false;
    console.log('Game resumed');
    return this;
  }
  
  // Stop the game loop
  stop() {
    this.isRunning = false;
    console.log('Game stopped');
    return this;
  }
  
  // Main game loop (runs once per frame)
  gameLoop(timestamp) {
    // Calculate delta time (time since last frame in seconds)
    this.deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    
    // Update FPS counter
    this.frameCount++;
    if (timestamp - this.lastFpsUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = timestamp;
      console.log('FPS:', this.fps);
    }
    
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Skip updates if paused, but still render
    if (!this.isPaused) {
      // Update game logic
      this.update(this.deltaTime);
    }
    
    // Render the game
    this.render();
    
    // Draw FPS counter
    this.ctx.fillStyle = 'white';
    this.ctx.font = '14px Arial';
    this.ctx.fillText('FPS: ' + this.fps, 10, 20);
    
    // Schedule the next frame if the game is still running
    if (this.isRunning) {
      requestAnimationFrame(this.gameLoop);
    }
  }
  
  // Update game logic
  update(deltaTime) {
    // Update all entities
    for (let i = 0; i < this.entities.length; i++) {
      const entity = this.entities[i];
      entity.update(deltaTime, this);
    }
    
    // Check for collisions
    this.checkCollisions();
    
    // Check game conditions (victory, defeat, etc.)
    this.checkGameConditions();
  }
  
  // Render all game objects
  render() {
    // Render all entities in the right order
    // (background first, then sorted by z-index)
    
    // Sort entities by z-index
    const sortedEntities = [...this.entities].sort((a, b) => 
      (a.zIndex || 0) - (b.zIndex || 0)
    );
    
    // Render each entity
    for (let i = 0; i < sortedEntities.length; i++) {
      const entity = sortedEntities[i];
      entity.render(this.ctx, this);
    }
  }
  
  // Add an entity to the game
  addEntity(entity) {
    this.entities.push(entity);
    if (entity.onAdd) {
      entity.onAdd(this);
    }
    return entity;
  }
  
  // Remove an entity from the game
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      if (entity.onRemove) {
        entity.onRemove(this);
      }
      this.entities.splice(index, 1);
    }
  }
  
  // Check for collisions between entities
  checkCollisions() {
    // Simple collision detection
    for (let i = 0; i < this.entities.length; i++) {
      const a = this.entities[i];
      
      // Skip entities without collision
      if (!a.hasCollision) continue;
      
      for (let j = i + 1; j < this.entities.length; j++) {
        const b = this.entities[j];
        
        // Skip entities without collision
        if (!b.hasCollision) continue;
        
        // Check for collision (simple rectangle intersection)
        if (this.checkCollision(a, b)) {
          // Handle collision
          if (a.onCollision) a.onCollision(b, this);
          if (b.onCollision) b.onCollision(a, this);
        }
      }
    }
  }
  
  // Check collision between two entities (simple AABB)
  checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }
  
  // Create initial enemies
  createInitialEnemies() {
    // Add some enemies at different positions
    for (let i = 0; i < 5; i++) {
      const enemy = createEnemy(
        200 + i * 100, 
        300
      );
      this.addEntity(enemy);
    }
  }
  
  // Handle key down events
  handleKeyDown(event) {
    // Update input state
    // In a real game, you would have an input manager
    
    // Handle pause key
    if (event.key === 'p' || event.key === 'P') {
      this.isPaused ? this.resume() : this.pause();
    }
  }
  
  // Handle key up events
  handleKeyUp(event) {
    // Update input state
    // In a real game, you would have an input manager
  }
  
  // Check game conditions (victory, defeat, etc.)
  checkGameConditions() {
    // Example: Check if player is dead
    if (this.player && this.player.health <= 0) {
      console.log('Game Over');
      this.pause();
      // Show game over screen
    }
    
    // Example: Check if all enemies are defeated
    const hasEnemies = this.entities.some(e => e.type === 'enemy');
    if (!hasEnemies) {
      console.log('Victory!');
      this.pause();
      // Show victory screen
    }
  }
}

// Create and export the game engine
const gameEngine = new GameEngine();
export default gameEngine;

// Usage: 
// Import the engine and start it:
// 
// import gameEngine from './gameEngine.js';
// 
// window.onload = () => {
//   gameEngine.init().start();
// };`,
          explanation: `This code implements a robust game loop and engine for a JavaScript game. Let me break down the key components:

1. **GameEngine Class**: The core of the game that manages all entities, updates, and rendering.

2. **Game Loop Architecture**:
   - Uses **requestAnimationFrame** for smooth animation that syncs with the browser's refresh rate
   - Calculates **deltaTime** to ensure consistent game speed regardless of frame rate
   - Implements an FPS counter to monitor performance
   - Separates logic updates from rendering

3. **Key Engine Components**:
   - **Entity Management**: Add, remove, and update game objects
   - **Collision Detection**: Simple AABB (Axis-Aligned Bounding Box) collision system
   - **Input Handling**: Basic keyboard input for gameplay and pause functionality
   - **Game State Control**: Start, pause, resume, and stop the game

4. **Rendering System**:
   - Clears the canvas each frame
   - Sorts entities by z-index for proper layering
   - Renders each entity in the correct order
   - Displays a performance counter (FPS)

5. **Game Flow Control**:
   - The \`init()\` method sets up the game environment
   - The \`start()\` method begins the game loop
   - The \`update()\` method advances game logic based on elapsed time
   - The \`render()\` method draws the current game state

This code follows good practices for game development:
- Separation of concerns (update logic vs. rendering)
- Time-based movement for consistent gameplay across different devices
- Proper resource management (adding/removing entities)
- Event-based input handling

To use this engine, you would:
1. Create entity classes with \`update()\` and \`render()\` methods
2. Define \`createPlayer()\` and \`createEnemy()\` functions
3. Set up an HTML canvas with id="gameCanvas"
4. Initialize and start the engine when the page loads

This foundation can be extended with:
- Asset loading systems
- Sound management
- Scene transitions
- More sophisticated collision detection
- Physics simulation`
        }
      };
      
      // Default response for unrecognized prompts
      let response = {
        code: `// Simple game object
class GameObject {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  update() {
    // Update logic goes here
    console.log('Updating game object');
  }
  
  render(context) {
    // Render logic
    context.fillStyle = 'blue';
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}

// Example usage
const gameObject = new GameObject(100, 100, 50, 50);
export default gameObject;`,
        explanation: `This is a basic template for a game object in JavaScript.

The GameObject class has:

1. **Constructor**: Takes position (x, y) and dimensions (width, height)
2. **Update Method**: Where you would put game logic that changes the object's state
3. **Render Method**: Draws the object to the canvas context

This pattern is fundamental to game development as it:
- Encapsulates object properties and behavior
- Separates logic (update) from presentation (render)
- Provides a reusable template for different game entities

You can extend this pattern to create specific game elements like:
- Players
- Enemies
- Projectiles
- Collectables
- Obstacles

For a complete game, you would:
1. Create a game loop that calls update and render on all objects
2. Add input handling to control player objects
3. Implement collision detection between objects
4. Add game-specific logic and rules`
      };

      // Check if we have a specific response for this prompt
      const promptLowerCase = prompt.toLowerCase();
      for (const key in mockResponses) {
        if (promptLowerCase.includes(key)) {
          response = mockResponses[key];
          break;
        }
      }
      
      setAiExplanation(response.explanation);
      setGeneratedCode(response.code);
      
      toast({
        title: 'Code generated!',
        description: 'AI has generated code based on your prompt.',
      });
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your prompt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={40} minSize={30} className="flex flex-col">
            <div className="p-4">
              <PromptInput onSubmit={handlePromptSubmit} isProcessing={isProcessing} />
            </div>
            <Separator />
            <div className="flex-1 overflow-hidden">
              <AiOutput explanation={aiExplanation} isLoading={isProcessing} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={30}>
            <CodeEditor code={generatedCode} isLoading={isProcessing} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
