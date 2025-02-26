// Main game script - career-quest.js

class CareerQuest {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.sprites = {};
    this.entities = [];
    this.player = null;
    this.currentLevel = 0;
    this.gameState = 'loading'; // loading, title, playing, coding, dialog
    this.codingChallenge = null;
    this.keyState = {};
    this.enemiesDefeated = 0;
    
    // Configure canvas size
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Set up input handlers
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    
    // Start the game loop
    this.lastTime = 0;
    this.init();
  }
  
  async init() {
    // Load sprites
    await this.loadSprites();
    
    // Create player
    this.player = new Player(100, 200, this.sprites.player);
    
    // Create initial enemies
    this.spawnEnemies();
    
    // Start game
    this.gameState = 'title';
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  async loadSprites() {
    const spriteNames = ['player', 'jiraMonster', 'zombieManager', 'meeting', 'arrow'];
    const loadPromises = spriteNames.map(name => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.sprites[name] = img;
          resolve();
        };
        // In a real implementation, you would have actual sprite images
        img.src = `sprites/${name}.png`;
        // For the prototype, we'll use placeholder colored rectangles
        this.sprites[name] = { width: 32, height: 48, placeholder: true };
        resolve();
      });
    });
    
    await Promise.all(loadPromises);
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  spawnEnemies() {
    // Clear existing enemies
    this.entities = this.entities.filter(entity => entity.type === 'player' || entity.type === 'arrow');
    
    // Add new enemies based on level
    for (let i = 0; i < 3 + this.currentLevel; i++) {
      const enemyTypes = ['jiraMonster', 'zombieManager', 'meeting'];
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const x = Math.random() * (this.canvas.width - 100) + 50;
      const y = Math.random() * (this.canvas.height - 200) + 100;
      
      let enemy;
      switch (type) {
        case 'jiraMonster':
          enemy = new JiraMonster(x, y, this.sprites.jiraMonster);
          break;
        case 'zombieManager':
          enemy = new ZombieManager(x, y, this.sprites.zombieManager);
          break;
        case 'meeting':
          enemy = new Meeting(x, y, this.sprites.meeting);
          break;
      }
      
      this.entities.push(enemy);
    }
    
    // Always add the player
    this.entities = this.entities.filter(entity => entity.type !== 'player');
    this.entities.push(this.player);
  }
  
  handleKeyDown(e) {
    this.keyState[e.key] = true;
    
    // Handle special key presses
    if (this.gameState === 'title' && e.key === 'Enter') {
      this.gameState = 'playing';
    }
    
    if (this.gameState === 'playing') {
      // Space to initiate coding challenge
      if (e.key === ' ') {
        this.startCodingChallenge();
      }
    }
    
    if (this.gameState === 'coding') {
      // Handle coding input
      if (e.key === 'Enter' && e.ctrlKey) {
        this.submitCode();
      } else if (e.key === 'Backspace') {
        // Handle backspace
        this.codingChallenge.userCode = this.codingChallenge.userCode.slice(0, -1);
      } else if (e.key.length === 1) {
        // Add character to user code
        this.codingChallenge.userCode += e.key;
      }
    }
    
    if (this.gameState === 'dialog' && e.key === 'Enter') {
      // Return to playing state after dialog
      this.gameState = 'playing';
    }
  }
  
  handleKeyUp(e) {
    this.keyState[e.key] = false;
  }
  
  startCodingChallenge() {
    this.gameState = 'coding';
    this.codingChallenge = {
      prompt: "Write a function that returns the sum of two numbers:",
      expectedOutput: "function add(a, b) { return a + b; }",
      userCode: ""
    };
  }
  
  submitCode() {
    // Very simple validation - in a real game, you'd evaluate the code properly
    if (this.codingChallenge.userCode.includes('return') && 
        this.codingChallenge.userCode.includes('+')) {
      // Success! Create an arrow
      const arrow = new Arrow(
        this.player.x + 20, 
        this.player.y, 
        this.sprites.arrow
      );
      this.entities.push(arrow);
      this.gameState = 'playing';
    } else {
      // Code doesn't work - give feedback
      console.log("Your code doesn't work yet. Try again!");
    }
  }
  
  gameLoop(time) {
    // Calculate delta time
    const deltaTime = time - (this.lastTime || time);
    this.lastTime = time;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and render based on game state
    switch (this.gameState) {
      case 'loading':
        this.renderLoading();
        break;
      case 'title':
        this.renderTitle();
        break;
      case 'playing':
        this.updatePlaying(deltaTime);
        this.renderPlaying();
        break;
      case 'coding':
        this.renderCoding();
        break;
      case 'dialog':
        this.renderDialog();
        break;
    }
    
    // Continue the loop
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  updatePlaying(deltaTime) {
    // Update player
    if (this.keyState['ArrowLeft']) this.player.moveLeft(deltaTime);
    if (this.keyState['ArrowRight']) this.player.moveRight(deltaTime);
    if (this.keyState['ArrowUp']) this.player.jump();
    
    // Update all entities
    this.entities.forEach(entity => entity.update(deltaTime, this.entities));
    
    // Check for collisions
    this.checkCollisions();
    
    // Check for level completion
    this.checkLevelCompletion();
  }
  
  checkCollisions() {
    // Check arrow hits
    const arrows = this.entities.filter(entity => entity.type === 'arrow');
    const enemies = this.entities.filter(entity => 
      ['jiraMonster', 'zombieManager', 'meeting'].includes(entity.type)
    );
    
    arrows.forEach(arrow => {
      enemies.forEach(enemy => {
        if (this.checkCollision(arrow, enemy)) {
          // Mark both for removal
          arrow.active = false;
          enemy.health -= 1;
          if (enemy.health <= 0) {
            enemy.active = false;
            this.enemiesDefeated++;
          }
        }
      });
    });
    
    // Remove inactive entities
    this.entities = this.entities.filter(entity => entity.active);
  }
  
  checkCollision(entity1, entity2) {
    return (
      entity1.x < entity2.x + entity2.width &&
      entity1.x + entity1.width > entity2.x &&
      entity1.y < entity2.y + entity2.height &&
      entity1.y + entity1.height > entity2.y
    );
  }
  
  checkLevelCompletion() {
    const remainingEnemies = this.entities.filter(entity => 
      ['jiraMonster', 'zombieManager', 'meeting'].includes(entity.type)
    );
    
    if (remainingEnemies.length === 0) {
      this.currentLevel++;
      
      if (this.currentLevel >= 3) {
        // Game complete
        this.gameState = 'dialog';
        // In a real game, you'd show the player's resume or portfolio
      } else {
        this.spawnEnemies();
      }
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
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '36px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('CAREER QUEST', this.canvas.width/2, this.canvas.height/2 - 40);
    
    this.ctx.font = '18px monospace';
    this.ctx.fillText('The Job Hunt RPG', this.canvas.width/2, this.canvas.height/2);
    
    this.ctx.font = '14px monospace';
    this.ctx.fillText('Press ENTER to start', this.canvas.width/2, this.canvas.height/2 + 60);
  }
  
  renderPlaying() {
    // Background
    this.ctx.fillStyle = '#3a7ecf';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Ground
    this.ctx.fillStyle = '#3d3d3d';
    this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
    
    // Render all entities
    this.entities.forEach(entity => this.renderEntity(entity));
    
    // HUD
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Level: ${this.currentLevel + 1}`, 20, 30);
    this.ctx.fillText(`Enemies Defeated: ${this.enemiesDefeated}`, 20, 50);
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
  
  renderEntity(entity) {
    if (entity.sprite && entity.sprite.placeholder) {
      // Render placeholder
      this.ctx.fillStyle = this.getColorForEntityType(entity.type);
      this.ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
    } else {
      // Render actual sprite
      this.ctx.drawImage(entity.sprite, entity.x, entity.y, entity.width, entity.height);
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
      this.codingChallenge.prompt, 
      codeAreaX + 20, 
      codeAreaY + 30
    );
    
    // User code
    this.ctx.fillText(
      this.codingChallenge.userCode || 'Type your code here...', 
      codeAreaX + 20, 
      codeAreaY + 70
    );
    
    // Cursor blinking effect
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      const textWidth = this.ctx.measureText(this.codingChallenge.userCode || 'Type your code here...').width;
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
}

// Entity classes
class Entity {
  constructor(x, y, sprite, type) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.width = sprite ? sprite.width : 32;
    this.height = sprite ? sprite.height : 48;
    this.type = type;
    this.active = true;
  }
  
  update(deltaTime) {
    // Base update logic
  }
}

class Player extends Entity {
  constructor(x, y, sprite) {
    super(x, y, sprite, 'player');
    this.speed = 0.3; // pixels per millisecond
    this.jumpVelocity = 0;
    this.isJumping = false;
    this.gravity = 0.001;
  }
  
  update(deltaTime) {
    // Handle gravity and jumping
    if (this.isJumping) {
      this.y -= this.jumpVelocity * deltaTime;
      this.jumpVelocity -= this.gravity * deltaTime;
      
      // Check for landing
      if (this.y > 300) { // Hardcoded floor for prototype
        this.y = 300;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
    }
  }
  
  moveLeft(deltaTime) {
    this.x -= this.speed * deltaTime;
    if (this.x < 0) this.x = 0;
  }
  
  moveRight(deltaTime) {
    this.x += this.speed * deltaTime;
  }
  
  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpVelocity = 0.5;
    }
  }
}

class Arrow extends Entity {
  constructor(x, y, sprite) {
    super(x, y, sprite, 'arrow');
    this.speed = 0.5; // pixels per millisecond
    this.width = 20;
    this.height = 5;
  }
  
  update(deltaTime) {
    this.x += this.speed * deltaTime;
    
    // Remove if out of bounds
    if (this.x > window.innerWidth) {
      this.active = false;
    }
  }
}

class JiraMonster extends Entity {
  constructor(x, y, sprite) {
    super(x, y, sprite, 'jiraMonster');
    this.speed = 0.05; // pixels per millisecond
    this.health = 1;
  }
  
  update(deltaTime, entities) {
    // Move toward player
    const player = entities.find(entity => entity.type === 'player');
    if (player) {
      const dx = player.x - this.x;
      const direction = dx > 0 ? 1 : -1;
      this.x += direction * this.speed * deltaTime;
    }
  }
}

class ZombieManager extends Entity {
  constructor(x, y, sprite) {
    super(x, y, sprite, 'zombieManager');
    this.speed = 0.03; // pixels per millisecond
    this.health = 2;
  }
  
  update(deltaTime, entities) {
    // Slowly follows player
    const player = entities.find(entity => entity.type === 'player');
    if (player) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const direction = dx > 0 ? 1 : -1;
      this.x += direction * this.speed * deltaTime;
      
      // Also moves vertically
      const vDirection = dy > 0 ? 1 : -1;
      this.y += vDirection * this.speed * 0.5 * deltaTime;
    }
  }
}

class Meeting extends Entity {
  constructor(x, y, sprite) {
    super(x, y, sprite, 'meeting');
    this.speed = 0.02; // pixels per millisecond
    this.health = 3;
    this.splitTimer = 10000; // milliseconds until split
    this.timeSinceLastSplit = 0;
  }
  
  update(deltaTime, entities) {
    // Slowly moves around
    this.x += Math.sin(Date.now() / 1000) * this.speed * deltaTime;
    this.y += Math.cos(Date.now() / 1000) * this.speed * deltaTime;
    
    // Split into more meetings
    this.timeSinceLastSplit += deltaTime;
    if (this.timeSinceLastSplit >= this.splitTimer) {
      this.timeSinceLastSplit = 0;
      // In a real implementation, you'd create a new meeting entity
      console.log("Meeting split!");
    }
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // We no longer need to create a canvas element as it's created in the HTML
  // Just start the game with the existing canvas
  const game = new CareerQuest('game-canvas');
});