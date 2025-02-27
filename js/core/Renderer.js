// Renderer.js - Handles all rendering operations

export class Renderer {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.ctx = gameEngine.ctx;
    this.canvas = gameEngine.canvas;
  }
  
  render(deltaTime) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render based on game state
    switch (this.game.gameState) {
      case 'loading':
        this.renderLoading();
        break;
      case 'title':
        this.renderTitle();
        break;
      case 'playing':
        this.renderPlaying();
        break;
      case 'coding':
        this.renderCoding();
        break;
      case 'dialog':
        this.renderDialog();
        break;
    }
  }
  
  renderLoading() {
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Loading...', this.canvas.width/2, this.canvas.height/2);
  }
  
  renderTitle() {
    // Render background first
    this.renderBackground();
    
    // Semi-transparent overlay to make text more readable - reduced opacity
    this.ctx.fillStyle = 'rgba(34, 34, 34, 0.4)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Create a more visible text box for the title
    const titleBoxWidth = 500;
    const titleBoxHeight = 300;
    const titleBoxX = (this.canvas.width - titleBoxWidth) / 2;
    const titleBoxY = (this.canvas.height - titleBoxHeight) / 2 - 30;
    
    // Draw semi-transparent box behind title text
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.fillRect(titleBoxX, titleBoxY, titleBoxWidth, titleBoxHeight);
    
    // Add a border to the title box
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(titleBoxX, titleBoxY, titleBoxWidth, titleBoxHeight);
    
    // Title text with shadow for better visibility
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '36px monospace';
    this.ctx.textAlign = 'center';
    
    // Add text shadow
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    this.ctx.shadowBlur = 5;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    
    this.ctx.fillText('CAREER QUEST', this.canvas.width/2, this.canvas.height/2 - 40);
    
    this.ctx.font = '18px monospace';
    this.ctx.fillText('The Job Hunt RPG', this.canvas.width/2, this.canvas.height/2);
    
    this.ctx.font = '14px monospace';
    this.ctx.fillText('Press ENTER to start', this.canvas.width/2, this.canvas.height/2 + 60);
    
    // Reset shadow for version indicator
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // Version indicator to confirm code changes
    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('Version: 1.2 (Modular)', this.canvas.width/2, this.canvas.height/2 + 100);
  }
  
  renderPlaying() {
    // Background
    this.renderBackground();
    
    // Ground
    this.ctx.fillStyle = '#3d3d3d';
    this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
    
    // Render all entities
    this.game.entityManager.entities.forEach(entity => this.renderEntity(entity));
    
    // HUD
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Level: ${this.game.currentLevel + 1}`, 20, 30);
    this.ctx.fillText(`Enemies Defeated: ${this.game.enemiesDefeated}`, 20, 50);
    this.ctx.textAlign = 'right';
    this.ctx.fillText('Press SPACE to code', this.canvas.width - 20, 30);
    
    // Controls indicator
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(20, this.canvas.height - 120, 220, 90);
    this.ctx.fillStyle = '#fff';
    this.ctx.textAlign = 'left';
    this.ctx.font = '14px monospace';
    this.ctx.fillText('CONTROLS:', 30, this.canvas.height - 100);
    this.ctx.fillText('← → : Move left/right', 30, this.canvas.height - 80);
    this.ctx.fillText('↑ : Jump', 30, this.canvas.height - 60);
    this.ctx.fillText('SPACE : Create code weapon', 30, this.canvas.height - 40);
  }
  
  renderCoding() {
    // Background
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Code area
    this.ctx.fillStyle = '#333';
    const codeAreaWidth = Math.min(800, this.canvas.width - 100);
    const codeAreaHeight = 300;
    const codeAreaX = (this.canvas.width - codeAreaWidth) / 2;
    const codeAreaY = (this.canvas.height - codeAreaHeight) / 2;
    this.ctx.fillRect(codeAreaX, codeAreaY, codeAreaWidth, codeAreaHeight);
    
    // Prompt
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(
      this.game.codingChallenge.prompt, 
      codeAreaX + 20, 
      codeAreaY + 30
    );
    
    // User code
    this.ctx.fillText(
      this.game.codingChallenge.userCode || 'Type your code here...', 
      codeAreaX + 20, 
      codeAreaY + 70
    );
    
    // Cursor blinking effect
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      const textWidth = this.ctx.measureText(this.game.codingChallenge.userCode || 'Type your code here...').width;
      this.ctx.fillRect(
        codeAreaX + 20 + textWidth, 
        codeAreaY + 58, 
        10, 
        2
      );
    }
    
    // Instructions
    this.ctx.fillStyle = '#aaa';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'Type your code and press Ctrl+Enter to submit', 
      this.canvas.width / 2, 
      codeAreaY + codeAreaHeight + 30
    );
    
    // Example
    this.ctx.fillStyle = '#666';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(
      'Example: function add(a, b) { return a + b; }', 
      codeAreaX + 20, 
      codeAreaY + codeAreaHeight - 20
    );
  }
  
  renderDialog() {
    // Background
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Dialog box
    this.ctx.fillStyle = '#333';
    const dialogWidth = Math.min(800, this.canvas.width - 100);
    const dialogHeight = 200;
    const dialogX = (this.canvas.width - dialogWidth) / 2;
    const dialogY = (this.canvas.height - dialogHeight) / 2;
    this.ctx.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);
    
    // Text
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '18px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'Congratulations! You defeated all the corporate challenges!', 
      this.canvas.width / 2, 
      dialogY + 60
    );
    
    this.ctx.font = '16px monospace';
    this.ctx.fillText(
      'View my full portfolio to learn more', 
      this.canvas.width / 2, 
      dialogY + 100
    );
    
    this.ctx.fillStyle = '#aaa';
    this.ctx.font = '14px monospace';
    this.ctx.fillText(
      'Press ENTER to continue', 
      this.canvas.width / 2, 
      dialogY + 150
    );
  }
  
  renderBackground() {
    console.log('Render background called:', {
      gameState: this.game.gameState,
      backgroundsExist: !!this.game.assetLoader.backgrounds,
      currentBackground: this.game.assetLoader.backgrounds && 
                        this.game.assetLoader.backgrounds[this.game.gameState] ? 'exists' : 'missing'
    });
    
    // Get the appropriate background for the current game state
    const background = this.game.assetLoader.getBackground(this.game.gameState);
    
    if (background) {
      try {
        const scale = Math.min(
          this.canvas.width / background.width,
          this.canvas.height / background.height
        );
        console.log('Background scale calculated:', {
          scale,
          bgWidth: background.width,
          bgHeight: background.height
        });
        
        const x = (this.canvas.width - background.width * scale) / 2;
        const y = (this.canvas.height - background.height * scale) / 2;
        
        console.log('Drawing background at:', { x, y, scale });
        this.ctx.drawImage(
          background,
          x, y,
          background.width * scale,
          background.height * scale
        );
        
        // Add debug info
        if (this.game.debugInfo) {
          this.game.debugInfo.lastRenderAttempt = new Date().toISOString();
          this.game.debugInfo.lastRenderSuccess = true;
        }
      } catch (err) {
        console.error('Error rendering background:', err);
        if (this.game.debugInfo) {
          this.game.debugInfo.errors.push(`Error rendering background: ${err.message}`);
          this.game.debugInfo.lastRenderSuccess = false;
        }
        
        // Fallback to a colored background
        this.ctx.fillStyle = '#3a7ecf';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    } else {
      // No background loaded, use fallback
      this.ctx.fillStyle = '#3a7ecf';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      if (this.game.debugInfo) {
        this.game.debugInfo.lastRenderAttempt = new Date().toISOString();
        this.game.debugInfo.lastRenderSuccess = false;
      }
    }
  }
  
  renderEntity(entity) {
    try {
      if (entity.sprite && entity.sprite.placeholder) {
        // Render placeholder
        this.ctx.fillStyle = this.getColorForEntityType(entity.type);
        this.ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
      } else {
        // For jiraMonster, add extra debug info
        if (entity.type === 'jiraMonster') {
          console.log('Rendering jiraMonster sprite:', {
            x: entity.x,
            y: entity.y,
            width: entity.width,
            height: entity.height,
            spriteComplete: entity.sprite.complete,
            spriteWidth: entity.sprite.width,
            spriteHeight: entity.sprite.height
          });
        }
        
        // Render actual sprite
        this.ctx.drawImage(entity.sprite, entity.x, entity.y, entity.width, entity.height);
      }
      
      // Draw entity bounding box for debugging
      if (this.game.debugInfo && this.game.debugInfo.showBoundingBoxes) {
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
      }
    } catch (err) {
      console.error(`Error rendering ${entity.type}:`, err);
      
      // Fallback to colored rectangle
      this.ctx.fillStyle = this.getColorForEntityType(entity.type);
      this.ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
      
      // Add error to debug info
      if (this.game.debugInfo) {
        this.game.debugInfo.errors.push(`Error rendering ${entity.type}: ${err.message}`);
      }
    }
  }
  
  getColorForEntityType(type) {
    const colors = {
      player: '#00aaff',
      jiraMonster: '#ff3366',
      zombieManager: '#33cc33',
      meeting: '#ffcc00',
      arrow: '#ffffff'
    };
    return colors[type] || '#888888';
  }
} 