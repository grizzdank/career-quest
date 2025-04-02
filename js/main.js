// main.js - Entry point for the game

import { GameEngine } from './core/GameEngine.js';

console.log('Main script loaded');

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing game...');
  
  try {
    // Get the canvas element
    const canvas = document.getElementById('gameCanvas');
    console.log('Canvas element:', canvas ? 'found' : 'not found');
    
    if (!canvas) {
      console.log('Creating new canvas element...');
      
      // Create canvas if it doesn't exist
      const newCanvas = document.createElement('canvas');
      newCanvas.id = 'gameCanvas';
      newCanvas.width = window.innerWidth;
      newCanvas.height = window.innerHeight;
      document.body.appendChild(newCanvas);
      
      // Initialize game with the new canvas
      console.log('Initializing game with new canvas...');
      const game = new GameEngine(newCanvas);
      game.init().catch(err => {
        console.error('Error initializing game:', err);
      });
    } else {
      console.log('Initializing game with existing canvas...');
      
      // Initialize game with existing canvas
      const game = new GameEngine(canvas);
      game.init().catch(err => {
        console.error('Error initializing game:', err);
      });
    }
  } catch (err) {
    console.error('Critical error in game initialization:', err);
  }
}); 