// AssetLoader.js - Handles loading of all game assets

export class AssetLoader {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.sprites = {};
    this.backgrounds = {};
    this.soundtrack = null;
  }
  
  async loadAllAssets() {
    await Promise.all([
      this.loadSprites(),
      this.loadBackgrounds(),
      this.loadSoundtrack()
    ]);
    
    console.log('All assets loaded successfully');
  }
  
  async loadSprites() {
    console.log('Starting sprite loading...');
    const spriteNames = ['player', 'jiraMonster', 'zombieManager', 'meeting', 'arrow'];
    const loadPromises = spriteNames.map(name => {
      return new Promise((resolve) => {
        // Special handling for jiraMonster - load actual sprite
        if (name === 'jiraMonster') {
          const img = new Image();
          
          img.onload = () => {
            console.log(`${name} sprite loaded successfully:`, {
              width: img.width,
              height: img.height,
              src: img.src,
              complete: img.complete,
              time: new Date().toISOString()
            });
            
            // Store the sprite
            this.sprites[name] = img;
            
            // Add to debug info
            if (!this.game.debugInfo.sprites) {
              this.game.debugInfo.sprites = {};
            }
            this.game.debugInfo.sprites[name] = {
              loaded: true,
              width: img.width,
              height: img.height,
              src: img.src
            };
            
            resolve();
          };
          
          img.onerror = (err) => {
            console.error(`${name} sprite load failed:`, {
              src: img.src,
              error: err,
              time: new Date().toISOString()
            });
            
            // Add error to debug info
            this.game.debugInfo.errors.push(`${name} sprite load failed: ${img.src}`);
            
            // Try with a different path as fallback
            if (img.src.includes('assets/sprites/jiraMonster.png')) {
              console.log('Trying with assets/jiraMonster.png...');
              img.src = 'assets/jiraMonster.png';
            } else if (img.src.includes('assets/jiraMonster.png')) {
              console.log('Trying with assets/@jiraMonster.png...');
              img.src = 'assets/@jiraMonster.png';
            } else if (img.src.includes('assets/@jiraMonster.png')) {
              console.log('Trying with root path...');
              img.src = 'jiraMonster.png';
            } else {
              // All attempts failed, use placeholder
              console.log(`Using placeholder for ${name}`);
              this.sprites[name] = { width: 32, height: 48, placeholder: true };
              
              // Add to debug info
              if (!this.game.debugInfo.sprites) {
                this.game.debugInfo.sprites = {};
              }
              this.game.debugInfo.sprites[name] = {
                loaded: false,
                placeholder: true
              };
              
              resolve();
            }
          };
          
          // First attempt - try the correct path
          console.log(`Attempting to load ${name} sprite from:`, `assets/sprites/jiraMonster.png`);
          img.src = `assets/sprites/jiraMonster.png`;
        } else {
          // For other sprites, we'll use placeholder colored rectangles
          this.sprites[name] = { width: 32, height: 48, placeholder: true };
          resolve();
        }
      });
    });
    
    await Promise.all(loadPromises);
    console.log('All sprites loaded (or placeholders created)');
  }
  
  async loadBackgrounds() {
    console.log('Starting backgrounds load...');
    
    // Load title background
    await this.loadBackground('title', 'assets/backgrounds/title-bg.png', 'game-bg.png');
    
    // Load game background
    await this.loadBackground('playing', 'assets/backgrounds/game-bg.png', 'game-bg.png');
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
        
        // Store the background for this state
        this.backgrounds[state] = img;
        
        this.game.debugInfo.backgroundLoaded = true;
        resolve();
      };
      
      img.onerror = (err) => {
        console.error(`${state} background load failed:`, {
          src: img.src,
          error: err,
          time: new Date().toISOString()
        });
        
        this.game.debugInfo.errors.push(`${state} background load failed: ${img.src}`);
        
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
        this.game.debugInfo.soundtrackLoaded = true;
        resolve();
      };
      
      audio.onerror = (err) => {
        console.error('Soundtrack load failed:', {
          src: audio.src,
          error: err,
          time: new Date().toISOString()
        });
        
        this.game.debugInfo.errors.push(`Soundtrack load failed: ${audio.src}`);
        
        // Try with a different path as fallback
        console.log('Attempting fallback path...');
        audio.src = 'soundtrack.mp3'; // Try root directory
        
        resolve(); // Still resolve to not block game
      };
      
      console.log('Attempting to load soundtrack from:', 'audio/soundtrack.mp3');
      audio.src = 'audio/soundtrack.mp3';
    });
  }
  
  playSoundtrack() {
    if (this.soundtrack && !this.game.isMuted) {
      this.soundtrack.play().catch(err => {
        console.error('Error playing soundtrack:', err);
      });
    }
  }
  
  getSprite(name) {
    return this.sprites[name] || null;
  }
  
  getBackground(state) {
    return this.backgrounds[state] || this.backgrounds['playing'] || null;
  }
} 