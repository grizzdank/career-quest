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
    this.player = new Player(
      x, 
      y, 
      this.game.assetLoader.getSprite('player'),
      this.game
    );
    this.entities.push(this.player);
    return this.player;
  }
  
  createArrow(x, y) {
    const arrow = new Arrow(
      x, 
      y, 
      this.game.assetLoader.getSprite('arrow'),
      this.game
    );
    this.entities.push(arrow);
    return arrow;
  }
  
  spawnEnemies() {
    // Clear existing enemies
    this.entities = this.entities.filter(entity => 
      entity.type === 'player' || entity.type === 'arrow'
    );
    
    // Add new enemies based on level
    for (let i = 0; i < 3 + this.game.currentLevel; i++) {
      const enemyTypes = ['jiraMonster', 'zombieManager', 'meeting'];
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const x = Math.random() * (this.game.canvas.width - 100) + 50;
      const y = Math.random() * (this.game.canvas.height - 200) + 100;
      
      let enemy;
      switch (type) {
        case 'jiraMonster':
          enemy = new JiraMonster(
            x, 
            y, 
            this.game.assetLoader.getSprite('jiraMonster'),
            this.game
          );
          break;
        case 'zombieManager':
          enemy = new ZombieManager(
            x, 
            y, 
            this.game.assetLoader.getSprite('zombieManager'),
            this.game
          );
          break;
        case 'meeting':
          enemy = new Meeting(
            x, 
            y, 
            this.game.assetLoader.getSprite('meeting'),
            this.game
          );
          break;
      }
      
      this.entities.push(enemy);
    }
    
    // Always add the player if it exists but isn't in the entities array
    if (this.player && !this.entities.includes(this.player)) {
      this.entities.push(this.player);
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