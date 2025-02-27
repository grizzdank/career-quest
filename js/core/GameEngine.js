// GameEngine.js - Main game loop and state management

import { AssetLoader } from './AssetLoader.js';
import { EntityManager } from './EntityManager.js';
import { Renderer } from './Renderer.js';
import { UIManager } from './UIManager.js';

export class GameEngine {
  constructor(canvasId) {
    // Canvas setup
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Game state
    this.gameState = 'loading'; // loading, title, playing, coding, dialog
    this.currentLevel = 0;
    this.enemiesDefeated = 0;
    this.keyState = {};
    this.lastTime = 0;
    
    // Initialize subsystems
    this.assetLoader = new AssetLoader(this);
    this.entityManager = new EntityManager(this);
    this.renderer = new Renderer(this);
    this.uiManager = new UIManager(this);
    
    // Audio state
    this.isMuted = false;
    
    // Debug info
    this.debugInfo = {
      backgroundLoaded: false,
      soundtrackLoaded: false,
      errors: [],
      sprites: {}
    };
    
    // Configure canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Set up input handlers
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }
  
  async init() {
    // Load assets
    await this.assetLoader.loadAllAssets();
    
    // Create player and enemies
    this.entityManager.createPlayer(100, 200);
    this.entityManager.spawnEnemies();
    
    // Start game
    this.gameState = 'title';
    
    // Auto-hide debug overlay after 5 seconds
    setTimeout(() => {
      const debugOverlay = document.getElementById('debug-overlay');
      if (debugOverlay) {
        debugOverlay.style.display = 'none';
      }
    }, 5000);
    
    // Start game loop
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  handleKeyDown(e) {
    this.keyState[e.key] = true;
    
    // Handle special key presses
    if (this.gameState === 'title' && e.key === 'Enter') {
      this.gameState = 'playing';
      // Play soundtrack on user interaction
      this.assetLoader.playSoundtrack();
    }
    
    if (this.gameState === 'playing') {
      // Space to initiate coding challenge
      if (e.key === ' ') {
        this.startCodingChallenge();
      }
    }
    
    if (this.gameState === 'coding') {
      // Handle coding input
      if (e.key === 'Enter' && e.ctrlKey) {
        this.submitCode();
      } else if (e.key === 'Backspace') {
        // Handle backspace
        this.codingChallenge.userCode = this.codingChallenge.userCode.slice(0, -1);
      } else if (e.key.length === 1) {
        // Add character to user code
        this.codingChallenge.userCode += e.key;
      }
    }
    
    if (this.gameState === 'dialog' && e.key === 'Enter') {
      // Return to playing state after dialog
      this.gameState = 'playing';
    }
  }
  
  handleKeyUp(e) {
    this.keyState[e.key] = false;
  }
  
  startCodingChallenge() {
    this.gameState = 'coding';
    this.codingChallenge = {
      prompt: "Write a function that returns the sum of two numbers:",
      expectedOutput: "function add(a, b) { return a + b; }",
      userCode: ""
    };
  }
  
  submitCode() {
    // Very simple validation - in a real game, you'd evaluate the code properly
    if (this.codingChallenge.userCode.includes('return') && 
        this.codingChallenge.userCode.includes('+')) {
      // Success! Create an arrow
      this.entityManager.createArrow(
        this.entityManager.player.x + 20, 
        this.entityManager.player.y
      );
      this.gameState = 'playing';
    } else {
      // Code doesn't work - give feedback
      console.log("Your code doesn't work yet. Try again!");
    }
  }
  
  gameLoop(time) {
    // Calculate delta time
    const deltaTime = time - (this.lastTime || time);
    this.lastTime = time;
    
    // Update game state
    if (this.gameState === 'playing') {
      this.updatePlaying(deltaTime);
    }
    
    // Render current state
    this.renderer.render(deltaTime);
    
    // Continue the loop
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  updatePlaying(deltaTime) {
    // Update player movement based on key state
    const player = this.entityManager.player;
    if (this.keyState['ArrowLeft']) player.moveLeft(deltaTime);
    if (this.keyState['ArrowRight']) player.moveRight(deltaTime);
    if (this.keyState['ArrowUp']) player.jump();
    
    // Update all entities
    this.entityManager.updateEntities(deltaTime);
    
    // Check for collisions
    this.entityManager.checkCollisions();
    
    // Check for level completion
    this.checkLevelCompletion();
  }
  
  checkLevelCompletion() {
    const remainingEnemies = this.entityManager.getEnemies();
    
    if (remainingEnemies.length === 0) {
      this.currentLevel++;
      
      if (this.currentLevel >= 3) {
        // Game complete
        this.gameState = 'dialog';
      } else {
        this.entityManager.spawnEnemies();
      }
    }
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted && this.assetLoader.soundtrack) {
      this.assetLoader.soundtrack.pause();
    } else if (this.assetLoader.soundtrack) {
      this.assetLoader.soundtrack.play().catch(err => {
        console.error('Error playing soundtrack:', err);
      });
    }
    
    return this.isMuted;
  }
}

// Initialize game when script is loaded
export function initGame(canvasId) {
  const game = new GameEngine(canvasId);
  game.init();
  return game;
} 