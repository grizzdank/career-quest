// Player.js - Handles the player entity

export class Player {
  constructor(game, x, y) {
    this.game = game;
    this.type = 'player';
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 60;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 5;
    this.jumpForce = 12;
    this.gravity = 0.5;
    this.isJumping = false;
    this.isGrounded = false;
    this.sprite = game.assetLoader.getSprite('player');
    
    // Debug info
    console.log('Player created:', { x, y, sprite: this.sprite ? 'loaded' : 'missing' });
  }
  
  update(deltaTime) {
    // Apply gravity
    this.velocityY += this.gravity;
    
    // Apply horizontal movement based on key states
    if (this.game.keys.ArrowLeft) {
      this.velocityX = -this.speed;
    } else if (this.game.keys.ArrowRight) {
      this.velocityX = this.speed;
    } else {
      // Apply friction when no keys are pressed
      this.velocityX *= 0.8;
      if (Math.abs(this.velocityX) < 0.1) this.velocityX = 0;
    }
    
    // Apply jump if key is pressed and player is on the ground
    if (this.game.keys.ArrowUp && this.isGrounded) {
      this.velocityY = -this.jumpForce;
      this.isGrounded = false;
      this.isJumping = true;
    }
    
    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Check for ground collision
    if (this.y + this.height >= this.game.canvas.height - 50) {
      this.y = this.game.canvas.height - 50 - this.height;
      this.velocityY = 0;
      this.isGrounded = true;
      this.isJumping = false;
    }
    
    // Check for wall collisions
    if (this.x < 0) {
      this.x = 0;
      this.velocityX = 0;
    }
    if (this.x + this.width > this.game.canvas.width) {
      this.x = this.game.canvas.width - this.width;
      this.velocityX = 0;
    }
  }
  
  createArrow() {
    // Only create an arrow if not already in the coding state
    if (this.game.gameState === 'playing') {
      // Create an arrow at the player's position
      return this.game.entityManager.createArrow(
        this.x + this.width / 2, 
        this.y + this.height / 2
      );
    }
    return null;
  }
} 