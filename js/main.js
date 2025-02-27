// main.js - Entry point for the game

import { GameEngine } from './core/GameEngine.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing game...');
  
  // Get the canvas element
  const canvas = document.getElementById('gameCanvas');
  
  if (!canvas) {
    console.error('Canvas element not found! Creating canvas element...');
    
    // Create canvas if it doesn't exist
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'gameCanvas';
    newCanvas.width = window.innerWidth;
    newCanvas.height = window.innerHeight;
    document.body.appendChild(newCanvas);
    
    // Initialize game with the new canvas
    const game = new GameEngine(newCanvas);
    game.init();
  } else {
    console.log('Canvas found, initializing game...');
    
    // Initialize game with existing canvas
    const game = new GameEngine(canvas);
    game.init();
  }
}); 