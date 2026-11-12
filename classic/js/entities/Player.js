// Player.js - Player character entity

export class Player {
  constructor(x, y, sprite, game) {
    this.type = 'player';
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 48;
    this.sprite = sprite;
    this.game = game;
    this.active = true;
    
    // Movement properties
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 3.5;
    this.jumpForce = -10;
    this.gravity = 0.4;
    this.isJumping = false;
  }
  
  update(deltaTime, entities) {
    // Apply gravity
    this.velocityY += this.gravity;
    
    // Apply friction to stop movement when keys aren't pressed
    this.velocityX *= 0.8; // This will gradually slow down the player
    if (Math.abs(this.velocityX) < 0.1) {
      this.velocityX = 0; // Stop completely when very slow
    }
    
    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Ground collision
    if (this.y > this.game.canvas.height - 80 - this.height) {
      this.y = this.game.canvas.height - 80 - this.height;
      this.velocityY = 0;
      this.isJumping = false;
    }
    
    // Wall collision
    if (this.x < 0) this.x = 0;
    if (this.x > this.game.canvas.width - this.width) {
      this.x = this.game.canvas.width - this.width;
    }
  }
  
  moveLeft(deltaTime) {
    this.velocityX = -this.speed;
  }
  
  moveRight(deltaTime) {
    this.velocityX = this.speed;
  }
  
  jump() {
    if (!this.isJumping) {
      this.velocityY = this.jumpForce;
      this.isJumping = true;
    }
  }
  
  render(ctx) {
    if (this.sprite && !this.sprite.placeholder) {
      // Draw actual sprite
      ctx.drawImage(
        this.sprite,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else {
      // Draw placeholder rectangle
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Draw face
      ctx.fillStyle = '#fff';
      ctx.fillRect(this.x + 8, this.y + 12, 4, 4);
      ctx.fillRect(this.x + 20, this.y + 12, 4, 4);
      ctx.fillRect(this.x + 8, this.y + 24, 16, 2);
    }
    
    // Draw bounding box if debug is enabled
    if (this.game.debugInfo?.showBoundingBoxes) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
} 