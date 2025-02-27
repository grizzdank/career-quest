// UIManager.js - Handles UI elements like debug overlay and mute button

export class UIManager {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.ctx = gameEngine.ctx;
    this.canvas = gameEngine.canvas;
    
    // Debug overlay settings
    this.debugOverlayVisible = false;
    this.debugOverlayWidth = 300;
    this.debugOverlayHeight = 400;
    this.debugOverlayX = 10;
    this.debugOverlayY = 10;
    
    // Mute button settings
    this.muteButtonSize = 30;
    this.muteButtonX = this.canvas.width - this.muteButtonSize - 10;
    this.muteButtonY = 10;
    
    // Initialize event listeners
    this.initEventListeners();
  }
  
  initEventListeners() {
    // Debug overlay toggle (D key)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'd' || e.key === 'D') {
        this.toggleDebugOverlay();
      }
    });
    
    // Mute button click
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if click is within mute button
      if (
        x >= this.muteButtonX && 
        x <= this.muteButtonX + this.muteButtonSize &&
        y >= this.muteButtonY && 
        y <= this.muteButtonY + this.muteButtonSize
      ) {
        this.game.toggleMute();
      }
    });
    
    // Update mute button position on window resize
    window.addEventListener('resize', () => {
      this.muteButtonX = this.canvas.width - this.muteButtonSize - 10;
    });
  }
  
  toggleDebugOverlay() {
    this.debugOverlayVisible = !this.debugOverlayVisible;
    console.log(`Debug overlay ${this.debugOverlayVisible ? 'enabled' : 'disabled'}`);
    
    // Toggle bounding boxes when debug overlay is toggled
    if (this.game.debugInfo) {
      this.game.debugInfo.showBoundingBoxes = this.debugOverlayVisible;
    }
  }
  
  renderUI() {
    // Render mute button
    this.renderMuteButton();
    
    // Render debug overlay if visible
    if (this.debugOverlayVisible) {
      this.renderDebugOverlay();
    }
  }
  
  renderMuteButton() {
    // Button background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(
      this.muteButtonX, 
      this.muteButtonY, 
      this.muteButtonSize, 
      this.muteButtonSize
    );
    
    // Button border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      this.muteButtonX, 
      this.muteButtonY, 
      this.muteButtonSize, 
      this.muteButtonSize
    );
    
    // Speaker icon
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    
    const centerX = this.muteButtonX + this.muteButtonSize / 2;
    const centerY = this.muteButtonY + this.muteButtonSize / 2;
    const size = this.muteButtonSize * 0.4;
    
    // Draw speaker
    this.ctx.moveTo(centerX - size/2, centerY);
    this.ctx.lineTo(centerX - size/4, centerY - size/4);
    this.ctx.lineTo(centerX - size/4, centerY + size/4);
    this.ctx.lineTo(centerX - size/2, centerY);
    this.ctx.fill();
    
    // Draw speaker cone
    if (!this.game.muted) {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, size/2, -Math.PI/4, Math.PI/4);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, size/3, -Math.PI/3, Math.PI/3);
      this.ctx.stroke();
    } else {
      // Draw X for muted
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY - size/3);
      this.ctx.lineTo(centerX, centerY + size/3);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(centerX - size/3, centerY);
      this.ctx.lineTo(centerX + size/3, centerY);
      this.ctx.stroke();
    }
  }
  
  renderDebugOverlay() {
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(
      this.debugOverlayX, 
      this.debugOverlayY, 
      this.debugOverlayWidth, 
      this.debugOverlayHeight
    );
    
    // Border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      this.debugOverlayX, 
      this.debugOverlayY, 
      this.debugOverlayWidth, 
      this.debugOverlayHeight
    );
    
    // Title
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(
      'DEBUG INFO', 
      this.debugOverlayX + 10, 
      this.debugOverlayY + 20
    );
    
    // Game state
    this.ctx.font = '12px monospace';
    this.ctx.fillText(
      `Game State: ${this.game.gameState}`, 
      this.debugOverlayX + 10, 
      this.debugOverlayY + 40
    );
    
    // FPS
    this.ctx.fillText(
      `FPS: ${this.game.debugInfo?.fps || 'N/A'}`, 
      this.debugOverlayX + 10, 
      this.debugOverlayY + 60
    );
    
    // Player position
    const player = this.game.entityManager?.player;
    if (player) {
      this.ctx.fillText(
        `Player: x=${Math.round(player.x)}, y=${Math.round(player.y)}`, 
        this.debugOverlayX + 10, 
        this.debugOverlayY + 80
      );
    }
    
    // Entity count
    this.ctx.fillText(
      `Entities: ${this.game.entityManager?.entities.length || 0}`, 
      this.debugOverlayX + 10, 
      this.debugOverlayY + 100
    );
    
    // Asset loading status
    this.ctx.fillText(
      `Assets Loaded: ${this.game.assetsLoaded ? 'Yes' : 'No'}`, 
      this.debugOverlayX + 10, 
      this.debugOverlayY + 120
    );
    
    // Sprite info
    this.ctx.fillText(
      'Sprite Info:', 
      this.debugOverlayX + 10, 
      this.debugOverlayY + 140
    );
    
    // JiraMonster sprite info
    const jiraMonster = this.game.entityManager?.getEntityByType('jiraMonster')[0];
    if (jiraMonster) {
      this.ctx.fillText(
        `JiraMonster: ${jiraMonster.sprite.placeholder ? 'Placeholder' : 'Loaded'}`, 
        this.debugOverlayX + 20, 
        this.debugOverlayY + 160
      );
      
      if (!jiraMonster.sprite.placeholder) {
        this.ctx.fillText(
          `  Size: ${jiraMonster.width}x${jiraMonster.height}`, 
          this.debugOverlayX + 20, 
          this.debugOverlayY + 180
        );
        this.ctx.fillText(
          `  Sprite: ${jiraMonster.sprite.width}x${jiraMonster.sprite.height}`, 
          this.debugOverlayX + 20, 
          this.debugOverlayY + 200
        );
        this.ctx.fillText(
          `  Complete: ${jiraMonster.sprite.complete ? 'Yes' : 'No'}`, 
          this.debugOverlayX + 20, 
          this.debugOverlayY + 220
        );
      }
    }
    
    // Error log
    if (this.game.debugInfo?.errors && this.game.debugInfo.errors.length > 0) {
      this.ctx.fillStyle = '#ff6666';
      this.ctx.fillText(
        'Errors:', 
        this.debugOverlayX + 10, 
        this.debugOverlayY + 250
      );
      
      // Show last 3 errors
      const errors = this.game.debugInfo.errors.slice(-3);
      errors.forEach((error, index) => {
        // Truncate long error messages
        const truncatedError = error.length > 35 ? 
          error.substring(0, 32) + '...' : 
          error;
          
        this.ctx.fillText(
          truncatedError, 
          this.debugOverlayX + 20, 
          this.debugOverlayY + 270 + (index * 20)
        );
      });
    }
    
    // Last render attempt
    if (this.game.debugInfo?.lastRenderAttempt) {
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(
        `Last Render: ${this.game.debugInfo.lastRenderSuccess ? 'Success' : 'Failed'}`, 
        this.debugOverlayX + 10, 
        this.debugOverlayY + 340
      );
    }
    
    // Instructions
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.fillText(
      'Press D to hide debug overlay', 
      this.debugOverlayX + 10, 
      this.debugOverlayY + 380
    );
  }
} 