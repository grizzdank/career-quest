// GameEngine.js - Main game loop and state management

import { AssetLoader } from './AssetLoader.js';
import { EntityManager } from './EntityManager.js';
import { Renderer } from './Renderer.js';
import { UIManager } from './UIManager.js';

export class GameEngine {
  constructor(canvas) {
    // Canvas setup
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    
    // Game state
    this.gameState = 'loading'; // loading, title, playing, coding, dialog, minimized
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
    
    console.log('GameEngine initialized with canvas:', {
      width: this.canvas.width,
      height: this.canvas.height
    });
  }
  
  async init() {
    try {
      // Load assets
      console.log('Starting asset loading...');
      await this.assetLoader.loadAllAssets();
      console.log('Assets loaded, checking sprites availability...');
      
      // Verify that sprites are available
      const spriteNames = ['player', 'jiraMonster', 'zombieManager', 'meeting', 'arrow'];
      for (const name of spriteNames) {
        const sprite = this.assetLoader.getSprite(name);
        console.log(`Sprite ${name} availability:`, {
          exists: !!sprite,
          isPlaceholder: sprite && sprite.placeholder
        });
      }
      
      // Small delay to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create player and enemies
      console.log('Creating player...');
      this.entityManager.createPlayer(100, 220);
      
      console.log('Spawning enemies...');
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
    } catch (err) {
      console.error('Error in game initialization:', err);
      // Display error on screen
      const errorDiv = document.createElement('div');
      errorDiv.style.position = 'absolute';
      errorDiv.style.top = '10px';
      errorDiv.style.left = '10px';
      errorDiv.style.color = 'red';
      errorDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
      errorDiv.style.padding = '10px';
      errorDiv.style.fontFamily = 'monospace';
      errorDiv.textContent = `Game initialization error: ${err.message}`;
      document.body.appendChild(errorDiv);
    }
    
    // Set up event listeners
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Add click handler for buttons
    this.canvas.addEventListener('click', this.handleClick.bind(this));
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
      
      // M key to minimize
      if (e.key === 'm' || e.key === 'M') {
        this.minimizeGame();
      }
    }
    
    if (this.gameState === 'minimized') {
      // Allow restoring with M key as well
      if (e.key === 'm' || e.key === 'M') {
        this.restoreGame();
      }
    }
    
    if (this.gameState === 'coding') {
      // Handle coding input with improved text handling
      if (e.key === 'Enter' && e.ctrlKey) {
        this.submitCode();
      } else if (e.key === 'Enter' && !e.ctrlKey) {
        // Add a newline character
        const pos = this.codingChallenge.cursorPosition;
        this.codingChallenge.userCode = 
          this.codingChallenge.userCode.substring(0, pos) + 
          '\n' + 
          this.codingChallenge.userCode.substring(pos);
        this.codingChallenge.cursorPosition++;
        e.preventDefault();
      } else if (e.key === 'Escape') {
        // Cancel coding mode
        this.gameState = 'playing';
      } else if (e.key === 'Backspace') {
        // Handle backspace with cursor position
        const pos = this.codingChallenge.cursorPosition;
        if (pos > 0) {
          this.codingChallenge.userCode = 
            this.codingChallenge.userCode.substring(0, pos - 1) + 
            this.codingChallenge.userCode.substring(pos);
          this.codingChallenge.cursorPosition = Math.max(0, pos - 1);
        }
      } else if (e.key === 'ArrowLeft') {
        // Move cursor left
        this.codingChallenge.cursorPosition = Math.max(
          0, 
          this.codingChallenge.cursorPosition - 1
        );
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        // Move cursor right
        this.codingChallenge.cursorPosition = Math.min(
          this.codingChallenge.userCode.length,
          this.codingChallenge.cursorPosition + 1
        );
        e.preventDefault();
      } else if (e.key === 'Tab') {
        // Insert tab as 2 spaces
        const pos = this.codingChallenge.cursorPosition;
        this.codingChallenge.userCode = 
          this.codingChallenge.userCode.substring(0, pos) + 
          '  ' + 
          this.codingChallenge.userCode.substring(pos);
        this.codingChallenge.cursorPosition += 2;
        e.preventDefault(); // Prevent default tab behavior
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Add character at cursor position
        const pos = this.codingChallenge.cursorPosition;
        this.codingChallenge.userCode = 
          this.codingChallenge.userCode.substring(0, pos) + 
          e.key + 
          this.codingChallenge.userCode.substring(pos);
        this.codingChallenge.cursorPosition++;
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
    
    // Define a set of progressively harder challenges
    const challenges = [
      {
        prompt: "Write a function that returns the sum of two numbers:",
        expectedPattern: /function\s+\w+\s*\(\s*\w+\s*,\s*\w+\s*\)\s*{\s*return\s+\w+\s*\+\s*\w+\s*;\s*}/,
        example: "function add(a, b) { return a + b; }",
        difficulty: 'easy'
      },
      {
        prompt: "Write a function that checks if a string is a palindrome:",
        expectedPattern: /function\s+\w+\s*\(\s*\w+\s*\)\s*{\s*.*\s*return\s+.*\s*}/,
        example: "function isPalindrome(str) { return str === str.split('').reverse().join(''); }",
        difficulty: 'medium'
      },
      {
        prompt: "Write a function that sorts an array of numbers:",
        expectedPattern: /function\s+\w+\s*\(\s*\w+\s*\)\s*{\s*.*sort.*\s*}/,
        example: "function sortArray(arr) { return arr.sort((a, b) => a - b); }",
        difficulty: 'medium'
      }
    ];
    
    // Select a challenge based on level progression
    const challengeIndex = Math.min(this.currentLevel, challenges.length - 1);
    
    this.codingChallenge = {
      ...challenges[challengeIndex],
      userCode: "",
      feedback: "",
      cursorPosition: 0
    };
  }
  
  submitCode() {
    const challenge = this.codingChallenge;
    
    // Test the code against the expected pattern
    if (challenge.expectedPattern.test(challenge.userCode)) {
      // Success! Create an arrow
      this.entityManager.createArrow(
        this.entityManager.player.x + 20, 
        this.entityManager.player.y
      );
      this.codingChallenge.feedback = "Great job! Code successfully compiled!";
      
      // Return to playing state after a short delay
      setTimeout(() => {
        this.gameState = 'playing';
      }, 1500);
    } else {
      // Code doesn't work - give specific feedback
      if (challenge.userCode.length < 10) {
        this.codingChallenge.feedback = "Your solution is too short. Keep coding!";
      } else if (!challenge.userCode.includes('function')) {
        this.codingChallenge.feedback = "You need to define a function. Try again!";
      } else if (!challenge.userCode.includes('return')) {
        this.codingChallenge.feedback = "Your function needs to return a value. Try again!";
      } else {
        this.codingChallenge.feedback = "Your solution is close but not quite right. Try again!";
      }
    }
  }
  
  gameLoop(time) {
    // Calculate deltaTime
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and render based on game state
    switch (this.gameState) {
      case 'loading':
        // No updates during loading
        this.renderer.renderLoading();
        break;
      case 'title':
        this.renderer.renderTitle();
        break;
      case 'playing':
        this.updatePlaying(deltaTime);
        this.renderer.renderPlaying();
        break;
      case 'coding':
        this.renderer.renderCoding();
        break;
      case 'dialog':
        this.renderer.renderDialog();
        break;
      case 'minimized':
        this.renderer.renderMinimized();
        break;
    }
    
    // Continue game loop
    requestAnimationFrame(this.gameLoop.bind(this));
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
  
  // Add new method to handle mouse clicks
  handleClick(e) {
    // Get click coordinates relative to canvas
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Check if minimize button was clicked (if visible)
    if (this.gameState === 'playing' && this.renderer.minimizeButtonBounds) {
      const btn = this.renderer.minimizeButtonBounds;
      if (clickX >= btn.x && clickX <= btn.x + btn.width &&
          clickY >= btn.y && clickY <= btn.y + btn.height) {
        this.minimizeGame();
        return;
      }
    }
    
    // Check if restore button was clicked when game is minimized
    if (this.gameState === 'minimized') {
      // Anywhere on the minimized UI should restore
      this.restoreGame();
      return;
    }
  }
  
  minimizeGame() {
    // Save previous state to restore to later
    this.previousState = this.gameState;
    this.gameState = 'minimized';
    
    // Collapse canvas size
    this.canvas.style.height = '80px';
    
    // Dispatch an event that the portfolio site can listen for
    const minimizeEvent = new CustomEvent('gameMinimized', {
      detail: { message: 'Game has been minimized' }
    });
    window.dispatchEvent(minimizeEvent);
  }
  
  restoreGame() {
    // Restore to previous state
    this.gameState = this.previousState || 'playing';
    
    // Restore canvas size
    this.canvas.style.height = '';
    this.resizeCanvas(); // Make sure everything is properly sized
    
    // Let the portfolio know we're maximized again
    const restoreEvent = new CustomEvent('gameRestored', {
      detail: { message: 'Game has been restored' }
    });
    window.dispatchEvent(restoreEvent);
  }
}

// Initialize game when script is loaded
export function initGame(canvasId) {
  const game = new GameEngine(canvasId);
  game.init();
  return game;
} 