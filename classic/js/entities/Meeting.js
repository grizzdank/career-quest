// Meeting.js - Handles the Meeting enemy entity

export class Meeting {
  constructor(x, y, sprite, game) {
    // Simple and direct setup with no potentially failing operations
    this.type = 'meeting';
    this.x = x || 100;
    this.y = y || 100;
    this.width = 60;
    this.height = 60;
    
    // Use provided sprite or create a default one
    this.sprite = sprite || { width: 60, height: 60, placeholder: true, color: '#cc66ff' };
    
    // Safe game object initialization
    this.game = game || { canvas: { width: 800, height: 600 } };
    
    // Initialize other properties
    this.velocityX = Math.random() > 0.5 ? 0.8 : -0.8;
    this.velocityY = 0;
    this.gravity = 0.3;
    this.isGrounded = false;
    this.health = 1;
    this.isDead = false;
    this.markedForRemoval = false;
    this.active = true;
    
    console.log('Meeting created with:', {
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
    
    // Meetings move slowly but steadily
    if (Math.random() < 0.005) {
      this.velocityX *= -1;
    }
    
    // Meetings occasionally float upward (defying gravity)
    if (Math.random() < 0.02) {
      this.velocityY = -1.5;
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
      ctx.fillStyle = '#cc66ff';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Add some details to make it look like a meeting
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x + this.width/2, this.y + this.height/2, 15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.font = '10px Arial';
      ctx.fillText('MEETING', this.x + 10, this.y + this.height/2 + 3);
    }
  }
} 