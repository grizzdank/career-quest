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
    
    // Calculate FPS for debug info
    if (deltaTime > 0) {
      this.game.debugInfo.fps = Math.round(1000 / deltaTime);
    }
    
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
      case 'minimized':
        this.renderMinimized();
        break;
    }
    
    // Always render UI on top
    this.game.uiManager.renderUI();
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
    this.ctx.fillRect(0, this.canvas.height - 80, this.canvas.width, 80);
    
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
    
    // Minimize button
    this.drawMinimizeButton();
    
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
    this.ctx.fillText('M : Minimize game', 30, this.canvas.height - 20);
  }
  
  renderCoding() {
    // Background with slight transparency for code overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Code area
    this.ctx.fillStyle = '#1e1e1e'; // VS Code-like dark theme
    const codeAreaWidth = Math.min(800, this.canvas.width - 100);
    const codeAreaHeight = 350;
    const codeAreaX = (this.canvas.width - codeAreaWidth) / 2;
    const codeAreaY = (this.canvas.height - codeAreaHeight) / 2;
    
    // Main code editor background
    this.ctx.fillRect(codeAreaX, codeAreaY, codeAreaWidth, codeAreaHeight);
    
    // Title bar with challenge difficulty
    this.ctx.fillStyle = '#007acc'; // Blue title bar
    this.ctx.fillRect(codeAreaX, codeAreaY, codeAreaWidth, 30);
    
    // Title text
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px monospace';
    this.ctx.textAlign = 'left';
    const challenge = this.game.codingChallenge;
    this.ctx.fillText(
      `Code Challenge - ${challenge.difficulty.toUpperCase()}`, 
      codeAreaX + 10, 
      codeAreaY + 20
    );
    
    // Prompt section background
    this.ctx.fillStyle = '#252526';
    this.ctx.fillRect(codeAreaX, codeAreaY + 30, codeAreaWidth, 50);
    
    // Prompt text
    this.ctx.fillStyle = '#d4d4d4';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(
      challenge.prompt, 
      codeAreaX + 20, 
      codeAreaY + 55
    );
    
    // Code editor background
    this.ctx.fillStyle = '#1e1e1e';
    this.ctx.fillRect(codeAreaX, codeAreaY + 80, codeAreaWidth, 200);
    
    // Line numbers background
    this.ctx.fillStyle = '#252526';
    this.ctx.fillRect(codeAreaX, codeAreaY + 80, 30, 200);
    
    // Line numbers
    this.ctx.fillStyle = '#858585';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'right';
    const userCode = challenge.userCode || '';
    const lineCount = userCode.split('\n').length || 1;
    for (let i = 0; i < lineCount; i++) {
      this.ctx.fillText(
        (i + 1).toString(), 
        codeAreaX + 25, 
        codeAreaY + 100 + (i * 16)
      );
    }
    
    // User code with syntax highlighting (simplified)
    this.ctx.fillStyle = '#d4d4d4'; // Default text color
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'left';
    
    // Split code by lines
    const lines = userCode.split('\n');
    const lineHeight = 16;
    
    // Render each line with basic syntax highlighting
    lines.forEach((line, lineIndex) => {
      let xPos = codeAreaX + 40;
      let yPos = codeAreaY + 100 + (lineIndex * lineHeight);
      
      // Simple syntax highlighting by word
      const words = line.split(/(\s+|[(){}[\],;])/);
      words.forEach(word => {
        // Choose color based on word type
        if (/function|return|if|else|for|while|let|const|var/.test(word)) {
          this.ctx.fillStyle = '#569cd6'; // Blue for keywords
        } else if (/true|false|null|undefined|this|new/.test(word)) {
          this.ctx.fillStyle = '#569cd6'; // Blue for literals
        } else if (/["'].*["']/.test(word)) {
          this.ctx.fillStyle = '#ce9178'; // Orange for strings
        } else if (/\d+/.test(word)) {
          this.ctx.fillStyle = '#b5cea8'; // Light green for numbers
        } else if (/[+\-*/=<>!&|]+/.test(word)) {
          this.ctx.fillStyle = '#d4d4d4'; // White for operators
        } else if (/[(){}[\],;]/.test(word)) {
          this.ctx.fillStyle = '#d4d4d4'; // White for punctuation
        } else {
          this.ctx.fillStyle = '#9cdcfe'; // Light blue for variables
        }
        
        // Draw the word
        this.ctx.fillText(word, xPos, yPos);
        xPos += this.ctx.measureText(word).width;
      });
    });
    
    // Draw cursor
    const cursorPos = challenge.cursorPosition || 0;
    let cursorLine = 0;
    let cursorCol = 0;
    let charCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= cursorPos) {
        cursorLine = i;
        cursorCol = cursorPos - charCount;
        break;
      }
      // Add line length plus 1 for the newline character
      charCount += lines[i].length + 1;
      if (charCount >= cursorPos) {
        cursorLine = i + 1;
        cursorCol = 0;
        break;
      }
    }
    
    // Calculate cursor x position based on text width
    const textBeforeCursor = lines[cursorLine]?.substring(0, cursorCol) || '';
    const cursorX = codeAreaX + 40 + this.ctx.measureText(textBeforeCursor).width;
    const cursorY = codeAreaY + 100 + (cursorLine * lineHeight);
    
    // Draw blinking cursor
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      this.ctx.fillStyle = '#d4d4d4';
      this.ctx.fillRect(cursorX, cursorY - 12, 2, 16);
    }
    
    // Feedback section
    this.ctx.fillStyle = '#252526';
    this.ctx.fillRect(codeAreaX, codeAreaY + 280, codeAreaWidth, 40);
    
    // Feedback text
    if (challenge.feedback) {
      if (challenge.feedback.includes('Great job')) {
        this.ctx.fillStyle = '#4CAF50'; // Green for success
      } else {
        this.ctx.fillStyle = '#e74c3c'; // Red for errors
      }
      this.ctx.font = '14px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(
        challenge.feedback, 
        codeAreaX + 20, 
        codeAreaY + 305
      );
    }
    
    // Example code hint
    this.ctx.fillStyle = '#666';
    this.ctx.textAlign = 'left';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(
      'Example: ' + challenge.example, 
      codeAreaX + 20, 
      codeAreaY + 335
    );
    
    // Instructions
    this.ctx.fillStyle = '#aaa';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'Type your code and press Ctrl+Enter to submit, Esc to cancel', 
      this.canvas.width / 2, 
      codeAreaY + codeAreaHeight + 30
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
  
  renderMinimized() {
    // Dark header bar with game info
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, 0, this.canvas.width, 80);
    
    // Game logo/title
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 20px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Career Quest - Minimized', 20, 30);
    
    // Game stats
    this.ctx.font = '14px monospace';
    this.ctx.fillText(`Level: ${this.game.currentLevel + 1} | Enemies Defeated: ${this.game.enemiesDefeated}`, 20, 55);
    
    // Expand button
    const buttonX = this.canvas.width - 120;
    const buttonY = 20;
    const buttonWidth = 100;
    const buttonHeight = 40;
    
    // Button background
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.beginPath();
    this.ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
    this.ctx.fill();
    
    // Button text
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('RESUME GAME', buttonX + buttonWidth/2, buttonY + buttonHeight/2 + 5);
    
    // Helper text
    this.ctx.textAlign = 'right';
    this.ctx.fillStyle = '#aaa';
    this.ctx.font = '12px monospace';
    this.ctx.fillText('Click anywhere or press M to maximize', this.canvas.width - 130, 70);
  }
  
  renderBackground() {
    // Get parallax layers
    const layers = this.game.assetLoader.getParallaxLayers();
    
    console.log('Rendering background:', {
      hasParallaxLayers: !!layers,
      layerStatus: {
        background: !!layers.background?.image,
        midground: !!layers.midground?.image,
        foreground: !!layers.foreground?.image
      },
      gameState: this.game.gameState
    });
    
    // If we have parallax layers, render them
    if (layers.background && layers.midground && layers.foreground) {
      // Calculate player position relative to canvas width for scrolling
      const player = this.game.entityManager.player;
      const playerRatio = player ? (player.x / this.canvas.width) : 0.5;
      
      console.log('Parallax info:', {
        playerX: player?.x,
        canvasWidth: this.canvas.width,
        playerRatio
      });
      
      // Render each layer with parallax effect
      Object.entries(layers).forEach(([name, layer]) => {
        if (!layer || !layer.image) return;
        
        // Calculate layer offset based on player position and layer speed
        const maxOffset = this.canvas.width - layer.image.width;
        layer.x = maxOffset * playerRatio * layer.speed;
        
        // Draw the layer twice to create seamless scrolling
        this.ctx.drawImage(
          layer.image,
          layer.x,
          0,
          layer.image.width,
          layer.image.height,
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
        
        // Draw second copy if needed to fill gap
        if (layer.x > 0) {
          this.ctx.drawImage(
            layer.image,
            layer.x - layer.image.width,
            0,
            layer.image.width,
            layer.image.height,
            0,
            0,
            this.canvas.width,
            this.canvas.height
          );
        } else if (layer.x + layer.image.width < this.canvas.width) {
          this.ctx.drawImage(
            layer.image,
            layer.x + layer.image.width,
            0,
            layer.image.width,
            layer.image.height,
            0,
            0,
            this.canvas.width,
            this.canvas.height
          );
        }
      });
      
      // Add debug info
      if (this.game.debugInfo) {
        this.game.debugInfo.lastRenderAttempt = new Date().toISOString();
        this.game.debugInfo.lastRenderSuccess = true;
      }
    } else {
      // Fallback to original background if parallax layers aren't loaded
      const background = this.game.assetLoader.getBackground(this.game.gameState);
      
      if (background) {
        try {
          const scale = Math.min(
            this.canvas.width / background.width,
            this.canvas.height / background.height
          );
          
          const x = (this.canvas.width - background.width * scale) / 2;
          const y = (this.canvas.height - background.height * scale) / 2;
          
          this.ctx.drawImage(
            background,
            x, y,
            background.width * scale,
            background.height * scale
          );
          
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
  }
  
  renderEntity(entity) {
    try {
      // Use the entity's own render method if it exists
      if (entity.render) {
        entity.render(this.ctx);
      } else if (entity.sprite && entity.sprite.placeholder) {
        // Fallback to placeholder rendering
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
            spriteComplete: entity.sprite?.complete,
            spriteWidth: entity.sprite?.width,
            spriteHeight: entity.sprite?.height
          });
        }
        
        // Render actual sprite
        if (entity.sprite) {
          this.ctx.drawImage(entity.sprite, entity.x, entity.y, entity.width, entity.height);
        }
      }
      
      // Draw entity bounding box for debugging
      if (this.game.debugInfo?.showBoundingBoxes) {
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
  
  // Add this new method to draw the minimize button
  drawMinimizeButton() {
    const buttonX = this.canvas.width - 50;
    const buttonY = 50;
    const buttonSize = 40;
    
    // Button background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.beginPath();
    this.ctx.roundRect(buttonX, buttonY, buttonSize, buttonSize, 8);
    this.ctx.fill();
    
    // Button border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.roundRect(buttonX, buttonY, buttonSize, buttonSize, 8);
    this.ctx.stroke();
    
    // Minimize icon (horizontal line)
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(buttonX + 10, buttonY + buttonSize/2);
    this.ctx.lineTo(buttonX + buttonSize - 10, buttonY + buttonSize/2);
    this.ctx.stroke();
    
    // Button text
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('RESUME', buttonX + buttonSize/2, buttonY + buttonSize - 5);
    
    // Store button boundaries for click detection
    this.minimizeButtonBounds = {
      x: buttonX,
      y: buttonY,
      width: buttonSize,
      height: buttonSize
    };
  }
} 