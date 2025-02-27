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
    this.markedForRemoval = false;
    
    // Load sprite
    this.sprite = game.assetLoader.getSprite('arrow');
    
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
      this.markedForRemoval = true;
    }
  }
} 