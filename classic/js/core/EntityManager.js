// EntityManager.js - Handles entity creation, updates, and collision detection

import { Player } from '../entities/Player.js';
import { JiraMonster } from '../entities/JiraMonster.js';
import { ZombieManager } from '../entities/ZombieManager.js';
import { Meeting } from '../entities/Meeting.js';
import { Arrow } from '../entities/Arrow.js';

export class EntityManager {
  constructor(gameEngine) {
    this.game = gameEngine;
    this.entities = [];
    this.player = null;
  }
  
  createPlayer(x, y) {
    let sprite = null;
    try {
      if (this.game && this.game.assetLoader) {
        sprite = this.game.assetLoader.getSprite('player');
      }
      
      this.player = new Player(
        x, 
        y, 
        sprite,
        this.game
      );
    } catch (err) {
      console.error('Error creating Player:', err);
      // Create a simple placeholder player
      this.player = {
        type: 'player',
        x: x,
        y: y,
        width: 32,
        height: 48,
        velocityX: 0,
        velocityY: 0,
        speed: 5,
        jumpForce: -12,
        gravity: 0.5,
        isJumping: false,
        active: true,
        update: () => {},
        moveLeft: () => { this.player.x -= 5; },
        moveRight: () => { this.player.x += 5; },
        jump: () => {},
        render: (ctx) => {
          ctx.fillStyle = '#4CAF50';
          ctx.fillRect(this.player.x, this.player.y, 32, 48);
        }
      };
    }
    
    this.entities.push(this.player);
    return this.player;
  }
  
  createArrow(x, y) {
    let arrow;
    try {
      arrow = new Arrow(
        this.game,
        x, 
        y
      );
    } catch (err) {
      console.error('Error creating Arrow:', err);
      // Create a simple placeholder arrow
      arrow = {
        type: 'arrow',
        x: x,
        y: y,
        width: 30,
        height: 10,
        velocityX: 10,
        active: true,
        update: () => {
          arrow.x += arrow.velocityX;
          if (arrow.x > this.game.canvas.width) {
            arrow.active = false;
          }
        },
        render: (ctx) => {
          ctx.fillStyle = '#ffcc00';
          ctx.fillRect(arrow.x, arrow.y, 30, 10);
        }
      };
    }
    
    this.entities.push(arrow);
    return arrow;
  }
  
  spawnEnemies() {
    try {
      console.log('EntityManager.spawnEnemies called with:', {
        gameExists: !!this.game,
        gameType: typeof this.game,
        gameKeys: this.game ? Object.keys(this.game) : [],
        hasAssetLoader: !!(this.game && this.game.assetLoader),
        assetLoaderType: this.game && this.game.assetLoader ? typeof this.game.assetLoader : 'N/A'
      });
      
      // Clear existing enemies
      this.entities = this.entities.filter(entity => 
        entity.type === 'player' || entity.type === 'arrow'
      );
      
      console.log('Creating enemies for level:', this.game.currentLevel);
      
      // Add new enemies based on level
      for (let i = 0; i < 3 + this.game.currentLevel; i++) {
        const enemyTypes = ['jiraMonster', 'zombieManager', 'meeting'];
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const x = Math.random() * (this.game.canvas.width - 100) + 50;
        const y = Math.random() * (this.game.canvas.height - 200) + 100;
        
        console.log(`Creating ${type} at (${x}, ${y})`);
        
        let enemy = null;
        
        // Pre-load sprites for all entity types
        let sprite = null;
        if (this.game && this.game.assetLoader) {
          try {
            sprite = this.game.assetLoader.getSprite(type);
            console.log(`Got sprite for ${type}:`, sprite ? 'success' : 'null');
          } catch (err) {
            console.error(`Error getting sprite for ${type}:`, err);
            // Create default placeholder
            sprite = {
              width: type === 'meeting' ? 60 : 50,
              height: type === 'meeting' ? 60 : 70,
              placeholder: true
            };
          }
        } else {
          console.warn('Missing game.assetLoader, using placeholder sprite');
          sprite = {
            width: type === 'meeting' ? 60 : 50,
            height: type === 'meeting' ? 60 : 70,
            placeholder: true
          };
        }
        
        try {
          switch (type) {
            case 'jiraMonster':
              console.log('Creating JiraMonster with params:', {
                hasX: typeof x !== 'undefined',
                hasY: typeof y !== 'undefined',
                hasSprite: !!sprite,
                hasGame: !!this.game
              });
              
              enemy = new JiraMonster(x, y, sprite, this.game);
              break;
              
            case 'zombieManager':
              console.log('Creating ZombieManager with params:', {
                hasX: typeof x !== 'undefined',
                hasY: typeof y !== 'undefined',
                hasSprite: !!sprite,
                hasGame: !!this.game
              });
              
              enemy = new ZombieManager(x, y, sprite, this.game);
              break;
              
            case 'meeting':
              console.log('Creating Meeting with params:', {
                hasX: typeof x !== 'undefined',
                hasY: typeof y !== 'undefined',
                hasSprite: !!sprite,
                hasGame: !!this.game
              });
              
              enemy = new Meeting(x, y, sprite, this.game);
              break;
          }
          
          if (enemy) {
            console.log(`Successfully created ${type} entity`);
            this.entities.push(enemy);
          } else {
            console.error(`Failed to create ${type} entity - enemy is null`);
          }
        } catch (err) {
          console.error(`Error creating ${type} entity:`, err);
        }
      }
      
      // Always add the player if it exists but isn't in the entities array
      if (this.player && !this.entities.includes(this.player)) {
        this.entities.push(this.player);
      }
      
      console.log('Finished spawning enemies, entity count:', this.entities.length);
    } catch (err) {
      console.error('Error in spawnEnemies method:', err);
    }
  }
  
  updateEntities(deltaTime) {
    this.entities.forEach(entity => entity.update(deltaTime, this.entities));
  }
  
  checkCollisions() {
    // Check arrow hits
    const arrows = this.entities.filter(entity => entity.type === 'arrow');
    const enemies = this.getEnemies();
    
    arrows.forEach(arrow => {
      enemies.forEach(enemy => {
        if (this.checkCollision(arrow, enemy)) {
          // Mark both for removal
          arrow.active = false;
          enemy.health -= 1;
          if (enemy.health <= 0) {
            enemy.active = false;
            this.game.enemiesDefeated++;
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
  
  getEnemies() {
    return this.entities.filter(entity => 
      ['jiraMonster', 'zombieManager', 'meeting'].includes(entity.type)
    );
  }
  
  getEntityByType(type) {
    return this.entities.filter(entity => entity.type === type);
  }
} 