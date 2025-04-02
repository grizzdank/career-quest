// JiraMonster.js - Handles the JiraMonster enemy entity

export class JiraMonster {
  constructor(x, y, sprite, game) {
    console.log('JiraMonster constructor called with:', {
      x, 
      y,
      spriteExists: !!sprite,
      spriteType: sprite ? typeof sprite : 'N/A',
      gameExists: !!game,
      gameType: game ? typeof game : 'N/A'
    });
    
    this.type = 'jiraMonster';
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 64;
    
    // Ensure sprite is defined
    if (!sprite) {
      console.warn('JiraMonster created with missing sprite');
      sprite = { width: 64, height: 64, placeholder: true };
    }
    
    // Ensure game is defined
    if (!game) {
      console.error('JiraMonster constructor called with undefined game object');
      game = {
        canvas: { width: 800, height: 600 }
      };
    }
    
    this.sprite = sprite;
    this.game = game;
    this.velocityX = Math.random() > 0.5 ? 0.8 : -0.8;
    this.velocityY = 0;
    this.gravity = 0.4;
    this.isGrounded = false;
    this.health = 1;
    this.active = true;
    
    // Set dimensions based on sprite if available
    if (this.sprite && !this.sprite.placeholder) {
      console.log('JiraMonster using actual sprite with dimensions:', {
        width: this.sprite.width,
        height: this.sprite.height,
        src: this.sprite.src
      });
      
      // Scale down if the sprite is too large
      const maxSize = 64;
      if (this.sprite.width > maxSize || this.sprite.height > maxSize) {
        const scale = Math.min(
          maxSize / this.sprite.width,
          maxSize / this.sprite.height
        );
        
        this.width = this.sprite.width * scale;
        this.height = this.sprite.height * scale;
        
        console.log('JiraMonster sprite scaled down:', {
          newWidth: this.width,
          newHeight: this.height,
          scaleFactor: scale
        });
      } else {
        this.width = this.sprite.width;
        this.height = this.sprite.height;
      }
    } else {
      console.log('JiraMonster using placeholder with dimensions:', {
        width: this.width,
        height: this.height
      });
    }
    
    // Debug info
    console.log('JiraMonster created:', { 
      x, 
      y, 
      sprite: this.sprite ? (this.sprite.placeholder ? 'placeholder' : 'loaded') : 'missing',
      dimensions: `${this.width}x${this.height}`
    });
  }
  
  update(deltaTime) {
    if (!this.active) return;
    
    // Apply gravity
    this.velocityY += this.gravity;
    
    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Check for ground collision
    if (this.y + this.height >= this.game.canvas.height - 80) {
      this.y = this.game.canvas.height - 80 - this.height;
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
    
    // Randomly change direction occasionally
    if (Math.random() < 0.01) {
      this.velocityX *= -1;
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
      ctx.fillStyle = '#ff3366';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    // Draw bounding box if debug is enabled
    if (this.game.debugInfo?.showBoundingBoxes) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
  
  hit() {
    this.health--;
    if (this.health <= 0) {
      this.die();
    }
  }
  
  die() {
    this.active = false;
    this.game.enemiesDefeated++;
    console.log('JiraMonster defeated!');
  }
} 