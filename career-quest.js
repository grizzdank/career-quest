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
    
    // Audio setup
    this.soundtrack = null;
    this.isMuted = false;
    
    // Debug info
    this.debugInfo = {
      backgroundLoaded: false,
      soundtrackLoaded: false,
      errors: []
    };
    
    // Create debug overlay
    this.createDebugOverlay();
    
    // Create mute button
    this.createMuteButton();
    
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
    
    // Load backgrounds
    await this.loadBackgrounds();
    
    // Load soundtrack
    await this.loadSoundtrack();
    
    // Create player
    this.player = new Player(100, 200, this.sprites.player);
    
    // Create initial enemies
    this.spawnEnemies();
    
    // Start game
    this.gameState = 'title';
    
    // Auto-hide debug overlay after 5 seconds
    setTimeout(() => {
      const debugOverlay = document.getElementById('debug-overlay');
      if (debugOverlay) {
        debugOverlay.style.display = 'none';
      }
    }, 5000);
    
    // Don't autoplay soundtrack - will play on user interaction instead
    // this.playSoundtrack();
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  async loadSprites() {
    const spriteNames = ['player', 'jiraMonster', 'zombieManager', 'meeting', 'arrow'];
    const loadPromises = spriteNames.map(name => {
      return new Promise((resolve) => {
        // For the prototype, we'll use placeholder colored rectangles
        this.sprites[name] = { width: 32, height: 48, placeholder: true };
        resolve();
        
        // When you have actual sprites, uncomment this code:
        /*
        const img = new Image();
        img.onload = () => {
          this.sprites[name] = img;
          resolve();
        };
        img.onerror = () => {
          // Fallback to placeholder on error
          this.sprites[name] = { width: 32, height: 48, placeholder: true };
          resolve();
        };
        img.src = `assets/sprites/${name}.png`;
        */
      });
    });
    
    await Promise.all(loadPromises);
  }
  
  async loadBackgrounds() {
    console.log('Starting backgrounds load...');
    
    // Load title background
    await this.loadBackground('title', 'assets/backgrounds/title-bg.png', 'game-bg.png');
    
    // Load game background
    await this.loadBackground('playing', 'assets/backgrounds/game-bg.png', 'game-bg.png');
    
    // Initialize backgrounds object if it doesn't exist
    if (!this.backgrounds) {
      this.backgrounds = {};
    }
  }
  
  async loadBackground(state, primaryPath, fallbackPath) {
    console.log(`Starting ${state} background load...`);
    console.log('Current time:', new Date().toISOString());
    console.log('Document readyState:', document.readyState);
    
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        console.log(`${state} background loaded successfully:`, {
          width: img.width,
          height: img.height,
          src: img.src,
          complete: img.complete,
          time: new Date().toISOString()
        });
        
        // Initialize backgrounds object if it doesn't exist
        if (!this.backgrounds) {
          this.backgrounds = {};
        }
        
        // Store the background for this state
        this.backgrounds[state] = img;
        
        // For backward compatibility
        if (state === 'playing') {
          this.background = img;
        }
        
        this.debugInfo.backgroundLoaded = true;
        resolve();
      };
      
      img.onerror = (err) => {
        console.error(`${state} background load failed:`, {
          src: img.src,
          error: err,
          time: new Date().toISOString()
        });
        
        this.debugInfo.errors.push(`${state} background load failed: ${img.src}`);
        
        // Try with fallback path
        console.log(`Attempting fallback path for ${state} background...`);
        img.src = fallbackPath;
        
        resolve(); // Still resolve to not block game
      };
      
      console.log(`Attempting to load ${state} background from:`, primaryPath);
      img.src = primaryPath;
    });
  }
  
  async loadSoundtrack() {
    console.log('Starting soundtrack load...');
    console.log('Current time:', new Date().toISOString());
    console.log('Document readyState:', document.readyState);
    
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.loop = true;
      
      audio.oncanplaythrough = () => {
        console.log('Soundtrack loaded successfully', {
          src: audio.src,
          duration: audio.duration,
          time: new Date().toISOString()
        });
        this.soundtrack = audio;
        this.debugInfo.soundtrackLoaded = true;
        resolve();
      };
      
      audio.onerror = (err) => {
        console.error('Soundtrack load failed:', {
          src: audio.src,
          error: err,
          time: new Date().toISOString()
        });
        
        this.debugInfo.errors.push(`Soundtrack load failed: ${audio.src}`);
        
        // Try with a different path as fallback
        console.log('Attempting fallback path...');
        audio.src = 'soundtrack.mp3'; // Try root directory
        
        resolve(); // Still resolve to not block game
      };
      
      console.log('Attempting to load soundtrack from:', 'audio/soundtrack.mp3');
      audio.src = 'audio/soundtrack.mp3';
    });
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
      // Play soundtrack on user interaction
      this.playSoundtrack();
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
    this.ctx.fillText('Version: 1.1 (Updated)', this.canvas.width/2, this.canvas.height/2 + 100);
  }
  
  renderPlaying() {
    // Background
    this.renderBackground();
    
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
  
  renderBackground() {
    console.log('Render background called:', {
      gameState: this.gameState,
      backgroundsExist: !!this.backgrounds,
      currentBackground: this.backgrounds && this.backgrounds[this.gameState] ? 'exists' : 'missing'
    });
    
    // Get the appropriate background for the current game state
    const background = this.backgrounds && this.backgrounds[this.gameState] 
      ? this.backgrounds[this.gameState] 
      : this.background; // Fallback to the old background property
    
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
        if (this.debugInfo) {
          this.debugInfo.lastRenderAttempt = new Date().toISOString();
          this.debugInfo.lastRenderSuccess = true;
        }
      } catch (err) {
        console.error('Error rendering background:', err);
        if (this.debugInfo) {
          this.debugInfo.errors.push(`Error rendering background: ${err.message}`);
          this.debugInfo.lastRenderSuccess = false;
        }
        
        // Fallback to a colored background
        this.ctx.fillStyle = '#3a7ecf';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    } else {
      // No background loaded, use fallback
      this.ctx.fillStyle = '#3a7ecf';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      if (this.debugInfo) {
        this.debugInfo.lastRenderAttempt = new Date().toISOString();
        this.debugInfo.lastRenderSuccess = false;
      }
    }
  }
  
  playSoundtrack() {
    if (this.soundtrack && !this.isMuted) {
      this.soundtrack.play().catch(err => {
        console.error('Error playing soundtrack:', err);
      });
    }
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted && this.soundtrack) {
      this.soundtrack.pause();
    } else if (this.soundtrack) {
      this.soundtrack.play().catch(err => {
        console.error('Error playing soundtrack:', err);
      });
    }
    
    return this.isMuted;
  }
  
  createDebugOverlay() {
    // Create debug overlay element
    const debugOverlay = document.createElement('div');
    debugOverlay.id = 'debug-overlay';
    debugOverlay.style.position = 'fixed';
    debugOverlay.style.top = '10px';
    debugOverlay.style.left = '10px';
    debugOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugOverlay.style.color = '#fff';
    debugOverlay.style.padding = '10px';
    debugOverlay.style.fontFamily = 'monospace';
    debugOverlay.style.fontSize = '12px';
    debugOverlay.style.zIndex = '1000';
    debugOverlay.style.maxWidth = '400px';
    debugOverlay.style.maxHeight = '200px';
    debugOverlay.style.overflow = 'auto';
    debugOverlay.style.transition = 'all 0.3s ease';
    
    // Create header with controls
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '8px';
    
    const title = document.createElement('strong');
    title.textContent = 'Debug Info';
    
    const controls = document.createElement('div');
    
    // Minimize button
    const minimizeButton = document.createElement('button');
    minimizeButton.textContent = '_';
    minimizeButton.style.marginRight = '5px';
    minimizeButton.style.padding = '0 5px';
    minimizeButton.style.backgroundColor = '#444';
    minimizeButton.style.color = '#fff';
    minimizeButton.style.border = '1px solid #666';
    minimizeButton.style.cursor = 'pointer';
    minimizeButton.title = 'Minimize';
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.padding = '0 5px';
    closeButton.style.backgroundColor = '#444';
    closeButton.style.color = '#fff';
    closeButton.style.border = '1px solid #666';
    closeButton.style.cursor = 'pointer';
    closeButton.title = 'Close';
    
    // Content container
    const contentContainer = document.createElement('div');
    contentContainer.id = 'debug-content-container';
    
    // Debug content
    const debugContent = document.createElement('div');
    debugContent.id = 'debug-content';
    
    // Add reload button
    const reloadButton = document.createElement('button');
    reloadButton.textContent = 'Reload Assets';
    reloadButton.style.marginTop = '10px';
    reloadButton.style.padding = '5px';
    reloadButton.style.backgroundColor = '#444';
    reloadButton.style.color = '#fff';
    reloadButton.style.border = '1px solid #666';
    reloadButton.style.cursor = 'pointer';
    
    // Add event listeners
    let isMinimized = false;
    minimizeButton.onclick = () => {
      isMinimized = !isMinimized;
      if (isMinimized) {
        contentContainer.style.display = 'none';
        minimizeButton.textContent = '+';
        minimizeButton.title = 'Expand';
        debugOverlay.style.maxHeight = 'auto';
      } else {
        contentContainer.style.display = 'block';
        minimizeButton.textContent = '_';
        minimizeButton.title = 'Minimize';
        debugOverlay.style.maxHeight = '200px';
      }
    };
    
    closeButton.onclick = () => {
      debugOverlay.style.display = 'none';
    };
    
    reloadButton.onclick = () => this.reloadAssets();
    
    // Show debug overlay again if hidden (keyboard shortcut)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F9') {
        debugOverlay.style.display = 'block';
      }
    });
    
    // Assemble the overlay
    controls.appendChild(minimizeButton);
    controls.appendChild(closeButton);
    header.appendChild(title);
    header.appendChild(controls);
    
    contentContainer.appendChild(debugContent);
    contentContainer.appendChild(reloadButton);
    
    debugOverlay.appendChild(header);
    debugOverlay.appendChild(contentContainer);
    
    document.body.appendChild(debugOverlay);
    
    // Update debug info every second
    setInterval(() => this.updateDebugOverlay(), 1000);
  }
  
  async reloadAssets() {
    // Clear existing assets
    this.background = null;
    this.backgrounds = {};
    this.soundtrack = null;
    
    // Reset debug info
    this.debugInfo.backgroundLoaded = false;
    this.debugInfo.soundtrackLoaded = false;
    this.debugInfo.errors = [];
    
    // Reload assets
    await this.loadBackgrounds();
    await this.loadSoundtrack();
    
    // Update debug overlay immediately
    this.updateDebugOverlay();
  }
  
  updateDebugOverlay() {
    const debugContent = document.getElementById('debug-content');
    if (!debugContent) return;
    
    const now = new Date().toISOString();
    
    let html = `<strong>Debug Info (${now})</strong><br>`;
    html += `Version: 1.1 (Updated)<br>`;
    html += `Background Loaded: ${this.debugInfo.backgroundLoaded}<br>`;
    html += `Soundtrack Loaded: ${this.debugInfo.soundtrackLoaded}<br>`;
    html += `Game State: ${this.gameState}<br>`;
    
    if (this.debugInfo.lastRenderAttempt) {
      html += `Last Render: ${this.debugInfo.lastRenderAttempt}<br>`;
      html += `Render Success: ${this.debugInfo.lastRenderSuccess}<br>`;
    }
    
    if (this.backgrounds) {
      html += `<strong>Backgrounds:</strong><br>`;
      for (const state in this.backgrounds) {
        const bg = this.backgrounds[state];
        if (bg) {
          html += `- ${state}: ${bg.width}x${bg.height} (${bg.src.split('/').pop()})<br>`;
        }
      }
    } else if (this.background) {
      html += `Background: ${this.background.width}x${this.background.height}<br>`;
      html += `Background Complete: ${this.background.complete}<br>`;
      html += `Background Src: ${this.background.src.split('/').pop()}<br>`;
    }
    
    if (this.soundtrack) {
      html += `Soundtrack: ${this.soundtrack.duration ? this.soundtrack.duration.toFixed(1) + 's' : 'unknown'}<br>`;
      html += `Muted: ${this.isMuted}<br>`;
      html += `Soundtrack Src: ${this.soundtrack.src.split('/').pop()}<br>`;
    }
    
    if (this.debugInfo.errors.length > 0) {
      html += `<strong>Errors (${this.debugInfo.errors.length}):</strong><br>`;
      // Show only the last 5 errors to avoid cluttering
      const recentErrors = this.debugInfo.errors.slice(-5);
      recentErrors.forEach(err => {
        html += `- ${err}<br>`;
      });
    }
    
    // Add note about F9 to show debug if closed
    html += `<br><em>Press F9 to show debug if closed</em>`;
    
    debugContent.innerHTML = html;
  }
  
  createMuteButton() {
    // Create mute button
    const muteButton = document.createElement('button');
    muteButton.id = 'mute-button';
    muteButton.style.position = 'fixed';
    muteButton.style.bottom = '20px';
    muteButton.style.right = '20px';
    muteButton.style.padding = '8px 12px';
    muteButton.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    muteButton.style.color = '#fff';
    muteButton.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    muteButton.style.borderRadius = '20px';
    muteButton.style.cursor = 'pointer';
    muteButton.style.zIndex = '1000';
    muteButton.style.fontFamily = 'monospace';
    muteButton.style.fontSize = '14px';
    muteButton.style.display = 'flex';
    muteButton.style.alignItems = 'center';
    muteButton.style.justifyContent = 'center';
    muteButton.style.transition = 'all 0.3s ease';
    muteButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    
    // Add hover effect
    muteButton.onmouseover = () => {
      muteButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      muteButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    };
    
    muteButton.onmouseout = () => {
      muteButton.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      muteButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    };
    
    // Add sound icon
    const soundIcon = document.createElement('span');
    soundIcon.id = 'sound-icon';
    soundIcon.innerHTML = '🔊';
    soundIcon.style.marginRight = '5px';
    soundIcon.style.fontSize = '16px';
    
    // Add text
    const buttonText = document.createElement('span');
    buttonText.textContent = 'Sound: ON';
    buttonText.id = 'mute-text';
    
    muteButton.appendChild(soundIcon);
    muteButton.appendChild(buttonText);
    
    // Add click event
    muteButton.onclick = () => {
      const isMuted = this.toggleMute();
      const icon = document.getElementById('sound-icon');
      const text = document.getElementById('mute-text');
      
      if (isMuted) {
        icon.innerHTML = '🔇';
        text.textContent = 'Sound: OFF';
      } else {
        icon.innerHTML = '🔊';
        text.textContent = 'Sound: ON';
      }
    };
    
    // Add keyboard shortcut for mute (M key)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') {
        muteButton.click();
      }
    });
    
    document.body.appendChild(muteButton);
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
// This is now handled in index.html
// document.addEventListener('DOMContentLoaded', () => {
//   // We no longer need to create a canvas element as it's created in the HTML
//   // Just start the game with the existing canvas
//   const game = new CareerQuest('game-canvas');
// });