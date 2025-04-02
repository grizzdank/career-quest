// AssetLoader.js - Handles loading of all game assets

export class AssetLoader {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.sprites = {};
    this.backgrounds = {};
    this.parallaxLayers = {
      background: null,
      midground: null,
      foreground: null
    };
    this.soundtrack = null;
  }
  
  async loadAllAssets() {
    await Promise.all([
      this.loadSprites(),
      this.loadBackgrounds(),
      this.loadParallaxLayers(),
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
              this.createPlaceholderSprite(name);
              resolve();
            }
          };
          
          // First attempt - try the correct path
          console.log(`Attempting to load ${name} sprite from:`, `assets/sprites/jiraMonster.png`);
          img.src = `assets/sprites/jiraMonster.png`;
        } else {
          // For other sprites, we'll use placeholder colored rectangles
          this.createPlaceholderSprite(name);
          resolve();
        }
      });
    });
    
    await Promise.all(loadPromises);
    console.log('All sprites loaded (or placeholders created)');
  }
  
  createPlaceholderSprite(name) {
    console.log(`Creating placeholder sprite for ${name}`);
    
    // Create appropriate placeholder based on entity type
    switch(name) {
      case 'player':
        this.sprites[name] = { 
          width: 32, 
          height: 48, 
          placeholder: true,
          color: '#4CAF50' // Green
        };
        break;
      case 'jiraMonster':
        this.sprites[name] = { 
          width: 64, 
          height: 64, 
          placeholder: true,
          color: '#ff3366' // Pink
        };
        break;
      case 'zombieManager':
        this.sprites[name] = { 
          width: 50, 
          height: 70, 
          placeholder: true,
          color: '#ff9900' // Orange
        };
        break;
      case 'meeting':
        this.sprites[name] = { 
          width: 60, 
          height: 60, 
          placeholder: true,
          color: '#cc66ff' // Purple
        };
        break;
      case 'arrow':
        this.sprites[name] = { 
          width: 30, 
          height: 10, 
          placeholder: true,
          color: '#ffcc00' // Yellow
        };
        break;
      default:
        this.sprites[name] = { 
          width: 32, 
          height: 32, 
          placeholder: true,
          color: '#cccccc' // Gray
        };
    }
    
    // Add to debug info
    if (!this.game.debugInfo.sprites) {
      this.game.debugInfo.sprites = {};
    }
    this.game.debugInfo.sprites[name] = {
      loaded: false,
      placeholder: true,
      dimensions: `${this.sprites[name].width}x${this.sprites[name].height}`
    };
    
    console.log(`Placeholder sprite created for ${name}:`, this.sprites[name]);
  }
  
  async loadBackgrounds() {
    console.log('Starting backgrounds load...');
    
    // Only load title background, playing state will use parallax layers
    await this.loadBackground('title', 'assets/backgrounds/title-bg.png', 'title-bg.png');
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
  
  async loadParallaxLayers() {
    console.log('Loading parallax background layers...');
    
    const layers = [
      { name: 'background', path: 'assets/backgrounds/background.png' },
      { name: 'midground', path: 'assets/backgrounds/midground.png' },
      { name: 'foreground', path: 'assets/backgrounds/foreground.png' }
    ];
    
    await Promise.all(layers.map(layer => this.loadParallaxLayer(layer.name, layer.path)));
  }
  
  async loadParallaxLayer(name, path) {
    console.log(`Loading ${name} parallax layer from ${path}`);
    
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        console.log(`${name} parallax layer loaded successfully:`, {
          width: img.width,
          height: img.height,
          src: img.src
        });
        
        this.parallaxLayers[name] = {
          image: img,
          x: 0,  // For tracking scroll position
          speed: name === 'background' ? 0.2 : 
                 name === 'midground' ? 0.5 : 
                 0.8  // foreground moves fastest
        };
        
        resolve();
      };
      
      img.onerror = (err) => {
        console.error(`Failed to load ${name} parallax layer:`, err);
        this.game.debugInfo.errors.push(`${name} parallax layer load failed: ${path}`);
        resolve(); // Still resolve to not block game
      };
      
      img.src = path;
    });
  }
  
  getParallaxLayers() {
    return this.parallaxLayers;
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
    // Only return the specifically requested background, no fallback
    return this.backgrounds[state] || null;
  }
} 