// Meeting.js - Handles the Meeting enemy entity

export class Meeting {
  constructor(game, x, y) {
    this.game = game;
    this.type = 'meeting';
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 60;
    this.velocityX = Math.random() > 0.5 ? 1 : -1;
    this.velocityY = 0;
    this.gravity = 0.5;
    this.isGrounded = false;
    this.health = 1;
    this.isDead = false;
    this.markedForRemoval = false;
    
    // Load sprite
    this.sprite = game.assetLoader.getSprite('meeting');
    
    // Debug info
    console.log('Meeting created:', { 
      x, 
      y, 
      sprite: this.sprite ? (this.sprite.placeholder ? 'placeholder' : 'loaded') : 'missing' 
    });
  }
  
  update(deltaTime) {
    if (this.isDead) return;
    
    // Apply gravity
    this.velocityY += this.gravity;
    
    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Check for ground collision
    if (this.y + this.height >= this.game.canvas.height - 50) {
      this.y = this.game.canvas.height - 50 - this.height;
      this.velocityY = 0;
      this.isGrounded = true;
    }
    
    // Check for wall collisions and reverse direction
    if (this.x < 0) {
      this.x = 0;
      this.velocityX *= -1;
    }
    if (this.x + this.width > this.game.canvas.width) {
      this.x = this.game.canvas.width - this.width;
      this.velocityX *= -1;
    }
    
    // Meetings move slowly but steadily
    if (Math.random() < 0.005) {
      this.velocityX *= -1;
    }
    
    // Meetings occasionally float upward (defying gravity)
    if (Math.random() < 0.02) {
      this.velocityY = -2;
    }
  }
  
  hit() {
    this.health--;
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    this.isDead = true;
    this.markedForRemoval = true;
    this.game.enemiesDefeated++;
    
    console.log('Meeting defeated!');
  }
} 