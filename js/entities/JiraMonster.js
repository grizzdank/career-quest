// JiraMonster.js - Handles the JiraMonster enemy entity

export class JiraMonster {
  constructor(game, x, y) {
    this.game = game;
    this.type = 'jiraMonster';
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 64;
    this.velocityX = Math.random() > 0.5 ? 2 : -2;
    this.velocityY = 0;
    this.gravity = 0.5;
    this.isGrounded = false;
    this.health = 1;
    this.isDead = false;
    this.markedForRemoval = false;
    
    // Load sprite
    this.sprite = game.assetLoader.getSprite('jiraMonster');
    
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
    
    // Randomly change direction occasionally
    if (Math.random() < 0.01) {
      this.velocityX *= -1;
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
    
    console.log('JiraMonster defeated!');
  }
} 