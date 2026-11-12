// ZombieManager.js - Handles the ZombieManager enemy entity

export class ZombieManager {
  constructor(x, y, sprite, game) {
    // Simple and direct setup with no potentially failing operations
    this.type = 'zombieManager';
    this.x = x || 100;
    this.y = y || 100;
    this.width = 50;
    this.height = 70;
    
    // Use provided sprite or create a default one
    this.sprite = sprite || { width: 50, height: 70, placeholder: true, color: '#ff9900' };
    
    // Safe game object initialization
    this.game = game || { canvas: { width: 800, height: 600 } };
    
    // Initialize other properties
    this.velocityX = Math.random() > 0.5 ? 1.0 : -1.0;
    this.velocityY = 0;
    this.gravity = 0.4;
    this.isGrounded = false;
    this.jumpTimer = 0;
    this.jumpInterval = Math.random() * 3000 + 2000;
    this.health = 1;
    this.isDead = false;
    this.markedForRemoval = false;
    this.active = true;
    
    console.log('ZombieManager created with:', {
      x: this.x,
      y: this.y,
      hasSprite: !!this.sprite,
      hasGame: !!this.game
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
    
    // Zombie managers move more erratically
    if (Math.random() < 0.03) {
      this.velocityX *= -1;
    }
    
    // Occasionally jump
    if (this.isGrounded && Math.random() < 0.01) {
      this.velocityY = -8;
      this.isGrounded = false;
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
    
    console.log('ZombieManager defeated!');
  }
  
  render(ctx) {
    if (this.isDead) return;
    
    if (this.sprite && !this.sprite.placeholder) {
      // Draw the sprite if available
      ctx.drawImage(
        this.sprite,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else {
      // Draw a placeholder rectangle
      ctx.fillStyle = '#ff9900';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Add some details to make it look like a zombie manager
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(this.x + this.width/2, this.y + 20, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw arms
      ctx.strokeStyle = '#ff9900';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(this.x + 10, this.y + 30);
      ctx.lineTo(this.x, this.y + 50);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(this.x + this.width - 10, this.y + 30);
      ctx.lineTo(this.x + this.width, this.y + 50);
      ctx.stroke();
    }
  }
} 