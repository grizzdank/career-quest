// Arrow.js - Handles the Arrow entity (player's weapon)

export class Arrow {
  constructor(game, x, y) {
    this.game = game;
    this.type = 'arrow';
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 10;
    this.velocityX = 10;
    this.active = true;
    
    // Load sprite
    try {
      if (game && game.assetLoader) {
        this.sprite = game.assetLoader.getSprite('arrow');
        // If sprite is null, use placeholder
        if (!this.sprite) {
          this.sprite = { width: 30, height: 10, placeholder: true };
          console.warn('Arrow sprite not found, using placeholder');
        }
      } else {
        // Use placeholder if assetLoader is not available
        this.sprite = { width: 30, height: 10, placeholder: true };
        console.warn('Arrow created without assetLoader, using placeholder');
      }
    } catch (err) {
      console.error('Error loading Arrow sprite:', err);
      this.sprite = { width: 30, height: 10, placeholder: true };
    }
    
    // Debug info
    console.log('Arrow created:', { 
      x, 
      y, 
      sprite: this.sprite ? (this.sprite.placeholder ? 'placeholder' : 'loaded') : 'missing' 
    });
  }
  
  update(deltaTime) {
    // Move arrow to the right
    this.x += this.velocityX;
    
    // Remove arrow if it goes off screen
    if (this.x > this.game.canvas.width) {
      this.active = false;
    }
  }
  
  render(ctx) {
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
      // Draw a placeholder arrow
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      
      // Add arrowhead
      ctx.beginPath();
      ctx.moveTo(this.x + this.width, this.y + this.height/2);
      ctx.lineTo(this.x + this.width - 10, this.y);
      ctx.lineTo(this.x + this.width - 10, this.y + this.height);
      ctx.closePath();
      ctx.fillStyle = '#ff6600';
      ctx.fill();
    }
    
    // Draw bounding box if debug is enabled
    if (this.game.debugInfo?.showBoundingBoxes) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
} 